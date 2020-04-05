#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');
const log = require('debug')('irs-tax-filler');
const BaseForm = require('./BaseForm');
const Form1116 = require('./Form1116');
const Form1116amt = require('./Form1116amt');
const Form1040s3 = require('./Form1040s3');
const Form1040 = require('./Form1040');
const Form8965 = require('./Form8965');
const Form8938 = require('./Form8938');
const Form6251 = require('./Form6251');
const PDF = require('./pdf.js');

const formMap = {
	f1116: Form1116,
	f1116amt: Form1116amt,
	f1040s3: Form1040s3,
	f1040: Form1040,
	f6251: Form6251,
	f8965: Form8965,
	f8938: Form8938
};

const formsOrder = Object.keys(formMap);

function sortForms(a, b) {
	const oa = formsOrder.indexOf(a);
	const ob = formsOrder.indexOf(b);
	return (oa > ob) ? 1 : (oa < ob)? -1 : 0;
}

async function fill(year, inputs, options = {}) {
	const cwd = path.resolve(process.cwd());
	const tmpdir = os.tmpdir();

	process.chdir(tmpdir);

	const ctx = {
		cwd,
		year
	};

	let only = [];
	if (options.only && !(options.only instanceof Array)) {
		only = [ options.only ];
	}

	const forms = fs.readdirSync(path.join(cwd, 'tax-forms', year))
		.map(a => path.basename(a, '.pdf'))
		.filter(a => !options.only || options.only.includes(a))
		.sort(sortForms)
		.map(a => {
			if (formMap.hasOwnProperty(a)) {
				return new formMap[a](ctx);
			}
			// else, unknown form
			return new BaseForm({ cwd, year }, a);
		});

	// generate form data for building forms
	if (options.generate) {
		log(`Generating form data into: ${path.join(cwd, 'data')}`)
		for (const form of forms) {
			form.generateData(ctx);
		}
		if (!fs.existsSync(path.join(cwd, 'example.yaml'))) {
			const inputData = fs.readFileSync(inputs);
			console.log(chalk.yellow('Wrote: example.yaml.  Modify this file as per the README.md instructions.'));
			fs.writeFileSync(path.join(cwd, 'example.yaml'), inputData);
		}
		console.log(chalk.yellow(`Original IRS forms are in: ./tax-forms/${year}`));
		console.log(chalk.yellow(`Working IRS forms are in: ./data/${year}`));
		console.log(chalk.yellow('Modify example.yaml as per the README.md instructions. Then run:'));
		console.log(chalk.cyan('irs-tax-filler fill-tax example.yaml'));
		return;
	}

	if (!fs.existsSync(path.join(cwd, year))) {
		fs.mkdirSync(path.join(cwd, year));
	}

	// sort accounts by institution name and account number
	const userInputs = yaml.safeLoad(fs.readFileSync(inputs));
	userInputs.accounts.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 :
		a.account > b.account ? 1 : a.account < b.account ? -1 : 0);

	// used to populate first account on f8938.js
	userInputs.account = userInputs.accounts[0];
	ctx.userInputs = userInputs;

	// init forms
	for (const form of forms) {
		await form.init(ctx);
	}

	// fill forms (1st pass)
	for (const form of forms) {
		form.fill(ctx);
	}

	// fill forms (2nd pass)
	for (const form of forms) {
		form.fill(ctx, { log: true, errors: true });
	}

	// write
	for (const form of forms) {
		await form.write(ctx);
	}

	const outputOrder = [
		'f1040',
		'f1040s3',
		'f8849',
		'f1116',
		'f6251',
		'f1116amt',
		'f8965',
		'f8938',
		'carryover-general',
		'carryover-alternative-minimum-tax'
	];

	await PDF.join({
		sources: outputOrder.map(a => path.join(ctx.cwd, ctx.year, `${a}.pdf`)),
		out: path.join(ctx.cwd, ctx.year, `1040-${year}.pdf`)
	});
}

module.exports = fill;
