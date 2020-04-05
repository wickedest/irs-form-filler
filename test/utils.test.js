const { expect } = require('chai');
const utils = require('../src/utils');

describe('utils', () => {
	it('should export utils functions', () => {
		expect(Object.keys(utils)).to.deep.equal([
			'toCurrency',
			'parseCurrency'
		]);
	});

	it('should convert currency', () => {
		expect(utils.toCurrency('1234.00')).to.equal('1,234.00');
		expect(utils.toCurrency('1234')).to.equal('1,234');
		expect(utils.toCurrency('1234567')).to.equal('1,234,567');
	});

	it('should parse currency', () => {
		expect(utils.parseCurrency('1234.00')).to.equal(1234.00);
		expect(utils.parseCurrency('1234')).to.equal(1234.00);
		expect(utils.parseCurrency('1234567')).to.equal(1234567.00);
	});
});
