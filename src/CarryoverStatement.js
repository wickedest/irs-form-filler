const fs = require('fs');
const path = require('path');
const { mdToPdf } = require('md-to-pdf');

class CarryoverStatement {
	constructor(options) {
		this.type = options.type;
	}

	async fill(form, dir = null, options = {}) {
		if (!dir) {
			return;
		}
		const lines = [
			`# Foreign Tax Credit Carryover Statement ${form.ctx.financial.endOfTaxYear.slice(-4) - 1}`,
			`## ${this.type === 'general' ? 'General' : 'General - Alternative Minimum Tax'}`,
			'| Name(s) shown on return | Social Security Number |',
			'| ----------------------- | ---------------------- |',
			`| ${form.ctx.firstName} ${form.ctx.middleInitial} ${form.ctx.lastName} | ${form.ctx.ssn} |`,
			'',
			'- [ ] **a** Passive category income',
			'- [X] **b** General category income',
			'- [ ] **c** Section 901(j) income',
			'- [ ] **d** Certain income re-sourced by treaty',
			'- [ ] **e** Lump-sum distribution',
			'',
			`| ${this.type === 'general' ? 'Regular tax' : 'AMT'} | Foreign taxes | Disallowed | Utilized | Carryover |`,
			'| ----------- | ------------ | ---------- | -------- | --------- |'
		];

		// FIXME: this is horrible
		const currencyWhole = form.endsWithFuncs['.whole'];

		const year = new Date(Date.parse(form.ctx.financial.endOfTaxYear)).getFullYear();
		const lastYear = year - 1;
		const carryovers = form.ctx.carryover[this.type];
		const years = Object.keys(carryovers)
			.filter(priorYear => priorYear <= lastYear);

		let total = 0;
		for (const priorYear of years) {
			const taxes = parseInt(carryovers[priorYear]['foreign-taxes'], 10);
			const utilized = parseInt(carryovers[priorYear].utilized, 10);
			const carryover = taxes - utilized;
			lines.push(`${priorYear} | ${currencyWhole(taxes)} | | ${currencyWhole(utilized)} | ${currencyWhole(carryover)}`);
			total += carryover;
		}
		lines.push(`| | | | **Carryover to ${year}** | ${currencyWhole(total)}`);

		const pdffile = path.join(dir, `carryover-${this.type}.pdf`);

		const pdf = await mdToPdf({ content: lines.join('\n') }, { dest: pdffile });
		if (pdf) {
			fs.writeFileSync(pdf.filename, pdf.content);

			if (options.filled) {
				options.filled.push(pdf.filename);
			}
		}
		console.log(`wrote ${pdffile}`);
	}
}

module.exports = CarryoverStatement;
