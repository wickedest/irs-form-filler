import fs from 'fs/promises';
import path from 'path';
import { Form } from 'pdffiller-script';

class FormFiller {
	/**
	 * Construct a form filler. Do not use directly. Use `FormFiller.create`.
	 *
	 * @param {object} options -
	 * @param {string} options.name - The form name (e.g. "f1040").
	 * @param {string} options.pdf - The PDF file name (e.g. "f1040.pdf").
	 * @param {string} options.script - The fill YAML script (e.g. "f1040.yaml").
	 * @param {string} options.map - The PDF map file name (e.g. "f1040-map.yaml").
	 */
	constructor({ name, map, script, pdf }) {
		this.name = name;
		this.map = map;
		this.script = script;
		this.pdf = pdf;
	}

	/**
	 * Factory to create a form filler.
	 *
	 * @param {*} options
	 * @returns {FormFiller}
	 */
	static create(options) {
		if (![ 'f8938' ].includes(options.name)) {
			return new FormFiller(options);
		} else {
			return new FormFiller8938(options);
		}
	}

	async fill(form, dir = null, options = {}) {
		const formName = this.name;
		await form.load(this.pdf, this.map);
		await form.fill(this.script, options);
		if (dir) {
			const pdffile = path.join(dir, `${formName}.pdf`);
			await form.save(pdffile);
			console.log(`wrote ${pdffile}`);

			if (options.filled) {
				options.filled.push(pdffile);
			}
			return pdffile;
		}
	}
}

class FormFiller8938 extends FormFiller {
	constructor(options) {
		super(options);
	}

	/**
	 *
	 * @param {Form} form
	 * @param {string=} dir
	 * @param {object={}} options
	 * @returns
	 */
	async fill(form, dir = null, options = {}) {
		const parts = [];
		const unlink = [];

		if (!dir) {
			return;
		}

		// Load the f8938 PDF and fill
		await form.load(this.pdf, this.map);
		form.ctx.account = form.ctx.accounts[0];
		const pdffile = await super.fill(form, dir);

		// filled/f8938.pdf
		parts.push(pdffile);

		// Slice off page 1 and for each account, fill and save
		const contd = form.ctx.accounts.slice(1);
		for (const [i, account] of contd.entries()) {
			const dest = path.join(dir, `${this.name}-${i}.pdf`);

			// Create a new copy of the Form to fill out
			const formCont = new Form();
			await formCont.init(form.config);
			formCont.ctx.account = account;

			await formCont.load(this.pdf, this.map);
			await formCont.fill(this.script);
			await formCont.save(dest, {begin: 2, end: 2});
			parts.push(dest);
			unlink.push(dest);
		}

		await form.join(pdffile, parts);

		await Promise.all(unlink.map(fs.unlink));
	}
}

export default FormFiller;
