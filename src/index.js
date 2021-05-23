const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { Form } = require('pdffiller-script');
const getForms = require('./forms');
const FormFiller = require('./FormFiller');
const CarryoverStatement = require('./CarryoverStatement');

const afs = fs.promises;

async function fill({ config, only, output, debug }) {
	const forms = await getForms();
	const formFillers = {};
	for (const formId in forms) {
		formFillers[formId] = FormFiller.create({
			name: formId,
			...forms[formId]
		});
	}

	ensureDirectory(output);

	const form = new Form();
	await form.init(config);

	// 1st pass
	const filled = [];
	for (const formId in forms) {
		await formFillers[formId].fill(form, null, { debug, filled });
	}
	// 2nd pass
	for (const formId in forms) {
		await formFillers[formId].fill(form, null, { debug, filled });
	}
	// 3nd pass, save
	for (const formId in forms) {
		const save = only ? only.includes(formId) : true;
		await formFillers[formId].fill(form, save ? output : null, { debug, filled });
	}

	if (!only) {
		const gcos = new CarryoverStatement({ type: 'general' });
		await gcos.fill(form, output, { filled });

		const acos = new CarryoverStatement({ type: 'alternative-minimum-tax' });
		await acos.fill(form, output, { filled });
	}
}

function ensureDirectory(dir) {
	// log('ensure dir:', dir);
	return afs.access(dir, fs.constants.R_OK | fs.constants.W_OK)
		.catch(() => {
			// log('mkdir:', dir);
			afs.mkdir(dir);
		});
}

module.exports = fill;
