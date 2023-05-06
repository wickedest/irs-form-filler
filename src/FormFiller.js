import fs from 'fs';
import path from 'path';

class FormFiller {
	constructor({ name, map, script, pdf }) {
		this.name = name;
		this.map = map;
		this.script = script;
		this.pdf = pdf;
	}

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
		}
	}
}

class FormFiller8938 extends FormFiller {
	constructor(options) {
		super(options);
	}

	async fill(form, dir = null, options = {}) {
		const parts = [];
		const unlink = [];

		await form.load(this.pdf, this.map);

		// Take a clean page 2 from the original document
		let contd;
		if (dir) {
			contd = path.join(dir, 'f8938-contd.pdf');
			await form.slice(2, 3, contd);
			unlink.push(contd);
		}

		// fill pages 1-2
		form.ctx.page = 1;
		form.ctx.account = form.ctx.accounts[0];
		await super.fill(form, dir);

		// slice pages 1-2 out of written f8938.pdf
		if (dir) {
			form.setSourcePDF(path.join(dir, 'f8938.pdf'));
			const pages1and2 = path.join(dir, 'f8938-pages1-2.pdf');
			await form.slice(1, 3, pages1and2);
			parts.push(pages1and2);
			unlink.push(pages1and2);
		}

		// form 8938 has two pages, but we're going to make additional pages,
		// starting at page 3.
		const accounts = form.ctx.accounts.slice(1);
		let i = 0;
		for (const account of accounts) {
			form.ctx.page = i + 3;
			form.ctx.account = account;

			const formName = `${this.name}-${i + 3}`;
			form.setFormName(formName);
			await form.fill(this.script);

			if (dir) {
				form.setSourcePDF(contd);
				const part = path.join(dir, `${formName}.pdf`);
				await form.save(part);
				parts.push(part);
				unlink.push(part);
			}

			i += 1;
		}

		if (dir) {
			const pdffile = path.join(dir, 'f8938.pdf');
			await form.join(parts, pdffile);

			if (options.filled) {
				options.filled.push(pdffile);
			}
		}

		unlink.forEach(fs.unlinkSync);
	}
}

export default FormFiller;
