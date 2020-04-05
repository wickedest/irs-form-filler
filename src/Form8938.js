const fs = require('fs');
const path = require('path');
const PDF = require('./pdf.js');
const BaseForm = require('./BaseForm');

class Form8938 extends BaseForm {
	constructor(ctx) {
		super(ctx, 'f8938');
	}

	async init(ctx) {
		await super.init(ctx);

		// form 8938 has two pages, but we're going to make additional pages,
		// starting at page 3.
		const remainder = ctx.userInputs.accounts.slice(1);
		let i = 0;
		for (const account of remainder) {
			const form = `f8938-${i + 3}`;
			await super.init(ctx, form);
			i += 1;
		}

		// Take clean page 3 from the main f8938 document and make f8938-contd
		return PDF.cat({
			source: this.pdf,
			pages: '3',
			out: path.join(ctx.cwd, ctx.year, 'f8938-contd.pdf')
		});
	}

	fill(ctx, options = {}) {
		ctx.userInputs.account = ctx.userInputs.accounts[0];
		super.fill(ctx, options);
		// form 8938 has two pages, but we're going to make additional pages,
		// starting at page 3.
		const remainder = ctx.userInputs.accounts.slice(1);
		let i = 0;
		for (const account of remainder) {
			const form = `${this.form}-${i + 3}`;
			// needed for page numbers
			ctx.userInputs.page = i + 3;
			// needed for individual accounts
			ctx.userInputs.account = account;
			super.fill(ctx, { form });
			i += 1;
		}
	}

	async write(ctx) {
		await super.write(ctx);

		const { cwd, year, userInputs } = ctx;
		const unlink = [
			path.join(cwd, year, 'f8938-contd.pdf'),
			path.join(cwd, year, 'f8938-main.pdf')
		];

		// Take pages 1-2 from the main f8938 document and create: f8938-main.pdf
		await PDF.cat({
			source: path.join(cwd, year, 'f8938.pdf'),
			pages: '1-2',
			out: path.join(cwd, year, 'f8938-main.pdf')
		});

		// clean out the original before writing
		fs.unlinkSync(path.join(cwd, year, 'f8938.pdf'));

		// main is pages 1 and 2, has the first account, slice it off and generate
		// the remainder
		const remainder = userInputs.accounts.slice(1);
		// this writes f8938-3.pdf, f8938-4.pdf, etc.
		let i = 0;
		for (const account of remainder) {
			unlink.push(path.join(cwd, year, `f8938-${i + 3}.pdf`));
			await this.writeFormFromSource(
				ctx, `f8938-${i + 3}`,
				path.join(cwd, year, 'f8938-contd.pdf'),
				path.join(cwd, year, `f8938-${i + 3}.pdf`)
			);
			i += 1;
		}

		// join f8938-3.pdf, f8938-4.pdf, etc.
		const parts = unlink.filter(a => !a.includes('f8938-contd.pdf'));
		const dest = path.join(cwd, year, 'f8938.pdf');
		parts.forEach(a => console.log('joining', a, 'into', dest));
		await PDF.join({
			sources: parts,
			out: dest
		});

		// cleanup
		unlink.forEach(fs.unlinkSync);
	}
}

module.exports = Form8938;
