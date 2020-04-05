const fs = require('fs');
const path = require('path');
const pdfFiller = require('pdffiller');
const chalk = require('chalk');
const yaml = require('js-yaml');
const log = require('debug')('irs-tax-filler');

function toCurrency(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function parseCurrency(val) {
	return parseInt(val.replace && val.replace(',', '') || val);
}
global.parseCurrency = parseCurrency;
global.toCurrency = toCurrency;

class BaseForm {
	constructor({ cwd, year }, form) {
		this.form = form;
		this.pdf = path.join(cwd, 'tax-forms', year, `${form}.pdf`);
		this.fields = path.join(cwd, 'data', year, `${form}.json`);
		log({ cwd, year, form });
		log('PDF', this.pdf);
		log('JSON', this.fields);
	}

	async generateData({ cwd, year }) {
		if (!fs.existsSync(path.join(cwd, 'data'))) {
			fs.mkdirSync(path.join(cwd, 'data'));
		}
		if (!fs.existsSync(path.join(cwd, 'data', year))) {
			fs.mkdirSync(path.join(cwd, 'data', year));
		}

		return new Promise((resolve, reject) => {
			if (!fs.existsSync(this.fields)) {
				const pdfFile = path.join(cwd, 'data', year, `${this.form}.pdf`);
				log('generateFDFTemplate', {
					cwd: process.cwd(),
					pdfFile
				});
				pdfFiller.generateFDFTemplate(this.pdf, null, (err, template) => {
					if (err) {
						log(err);
						return reject(err);
					}
					Object.keys(template).forEach((key, i) => {
						template[key] = `${i}`;
					});
					fs.writeFileSync(this.fields, JSON.stringify(template, null, '\t'));
					log('wrote new fields file:', this.fields);

					pdfFiller.fillFormWithFlatten(this.pdf, pdfFile, template, false, function(err) {
						if (err) {
							return reject(err);
						}
						log('wrote new example file:', pdfFile);
						resolve();
					});
				});
			}
			resolve();
		});
	}

	async init(ctx, target) {
		const form = target || this.form;
		// store form data inputs
		if (!ctx.userInputs.filled) {
			ctx.userInputs.filled = {};
		}
		if (!ctx.userInputs.data) {
			ctx.userInputs.data = {};
		}
		ctx.userInputs.filled[form] = {};
		ctx.userInputs.data[form] = {};
	}

	fill(ctx, options = {}) {
		const fillerjs = path.join(ctx.cwd, 'filler', ctx.year, `${this.form}.js`);
		const filleryaml = path.join(ctx.cwd, 'filler', ctx.year, `${this.form}.yaml`);
		if (fs.existsSync(filleryaml)) {
			this._fillYAML(ctx, filleryaml, options);
		}
	}

	_fillYAML(ctx, filler, options = {}) {
		const fields = require(this.fields);
		const inputs = yaml.safeLoad(fs.readFileSync(filler));
		const form = options.form || this.form;
		const data = ctx.userInputs.data[form];
		function findField(id) {
			for (const field in fields) {
				if (fields[field] === id) {
					return field;
				}
			}
		}
		function fillFormField(ctx, form, entry, fieldId, value) {
			const field = findField(fieldId);
			// if the entry ends with .whole, give the whole number, otherwise
			// give the decimal remainder.
			if (entry.endsWith('.whole')) {
				value = toCurrency(CURRENCY(value).whole);
			} else if (entry.endsWith('.dec')) {
				value = CURRENCY(value).dec;
			}
			// fill the form field
			ctx.userInputs.filled[form][field] = value;
			// also fill the friendly name
			ctx.userInputs.filled[form][entry] = value;

			data[field] = value;
			log(chalk.dim(`${form} ${field}:`), chalk.yellow(value));
		}
		for (const entry in inputs) {
			if (inputs[entry].value) {
				// needs to be calculated
				const value = eval(ctx.userInputs, inputs[entry].value);
				if (inputs[entry].calculate) {
					const fn = eval2(inputs[entry].calculate);
					const { field, fill } = fn(ctx.userInputs, value);
					fillFormField(ctx, form, entry, field, fill);
				}
			} else {
				for (const fieldId in inputs[entry]) {
					const value = eval(ctx.userInputs, inputs[entry][fieldId]);
					fillFormField(ctx, form, entry, fieldId, value);
				}
			}
		}
	}

	async write(ctx) {
		const pdfDest = path.join(ctx.cwd, ctx.year, `${this.form}.pdf`);
		return this.writeFormFromSource(ctx, this.form, this.pdf, pdfDest);
	}

	writeFormFromSource(ctx, form, pdfSource, pdfDest) {
		return new Promise((resolve, reject) => {
			pdfFiller.fillFormWithFlatten(pdfSource, pdfDest, ctx.userInputs.data[form], false, (err) => {
				if (err) {
					return reject(err);
				}
				log('wrote', pdfDest);
				resolve();
			});
		});
	}
}

function CURRENCY(value) {
	const simplified = value.replace(',', '');
	const parts = simplified.split('.');
	if (parts.length === 1) {
		return {
			whole: parts[0],
			dec: '00'
		}
	} else {
		return {
			whole: parts[0],
			dec: parts[1]
		}
	}
}

function eval(data, template) {
	const validator = {
		get(target, key) {
			if (typeof target[key] === 'object' && target[key] !== null) {
				return new Proxy(target[key], validator)
			} else {
				if (!Reflect.has(target, key)) {
					return '';
				}
				return target[key];
			}
		}
	};
	const proxy = new Proxy(data, validator);
	try {
		const fn = new Function('ctx', 'return `' + template + '`;');
		return fn.call(global, proxy) || '';
	} catch (ex) {
		console.error(`error with template: ${template}`)
		throw ex;
	}
}

function eval2(template) {
	try {
		const fn = new Function(`return ${template}`);
		return fn.call();
	} catch (ex) {
		console.error(`error with template: ${template}`)
		throw ex;
	}
}

module.exports = BaseForm;
