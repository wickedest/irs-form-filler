const fs = require('fs');
const path = require('path');
const BaseForm = require('./BaseForm');
const mdToPdf = require('md-to-pdf');

class Form1116 extends BaseForm {
	constructor(ctx, form = 'f1116') {
		super(ctx, form);
		this.type = 'general';
	}

	async write(ctx) {
		await super.write(ctx);
		this.writeCarryoverStatement(ctx, ctx.userInputs);
	}

	async writeCarryoverStatement({ cwd, year }, ctx) {
		const lines = [
			'# Foreign Tax Credit Carryover Statement 2017',
			`## ${this.type === 'general' ? 'General' : 'General - Alternative Minimum Tax'}`,
			'| Name(s) shown on return | Social Security Number |',
			'| ----------------------- | ---------------------- |',
			`| ${ctx.firstName} ${ctx.middleInitial} ${ctx.lastName} | ${ctx.ssn} |`,
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

		const lastYear = `${year - 1}`;
		const carryovers = ctx.carryover[this.type];
		const years = Object.keys(carryovers)
			.filter(priorYear => priorYear <= lastYear);
		let total = 0;
		for (const priorYear of years) {
			const taxes = parseInt(carryovers[priorYear]['foreign-taxes'], 10);
			const utilized = parseInt(carryovers[priorYear].utilized, 10);
			const carryover = taxes - utilized;
			lines.push(`${priorYear} | ${toCurrency(taxes)} | | ${toCurrency(utilized)} | ${toCurrency(carryover)}`);
			total += carryover;
		}
		lines.push(`| | | | **Carryover to ${year}** | ${toCurrency(total)}`);

		const mdfile = path.join(cwd, year, `carryover-${this.type}.md`);
		const pdffile = path.join(cwd, year, `carryover-${this.type}.pdf`);
		fs.writeFileSync(mdfile, lines.join('\n'), 'utf-8');
		await mdToPdf(mdfile, { dest: pdffile });
		console.log(`wrote ${pdffile}`);
		fs.unlinkSync(mdfile);
	}
}

module.exports = Form1116;
