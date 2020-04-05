const { expect } = require('chai');
const simple = require('simple-mock');
const mock = require('mock-require');
const PDF = require('../src/pdf');

describe('PDF', () => {
	it('should export PDF functions', () => {
		expect(PDF).to.be.a('function');
		expect(PDF.cat).to.be.a('function');
		expect(PDF.cat).to.have.length(1);
		expect(PDF.join).to.be.a('function');
		expect(PDF.join).to.have.length(1);
	});

	it('should cat one PDF file', async () => {
		const source = 'foo.pdf';
		const out = 'bar.pdf';
		const execFile = simple.mock().callbackWith(null);
		mock('child_process', { execFile });
		const PDF = mock.reRequire('../src/pdf');

		await PDF.cat({ source, pages: 3, out });

		expect(execFile.calls).to.have.length(1);
		expect(execFile.lastCall.args[0]).to.equal('pdftk');
		expect(execFile.lastCall.args[1].join(' '))
			.to.deep.equal('foo.pdf cat 3 output bar.pdf');
	});

	it('should join multiple PDF files', async () => {
		const sources = [ 'foo1.pdf', 'foo2.pdf' ];
		const out = 'bar.pdf';
		const execFile = simple.mock().callbackWith(null);
		mock('child_process', { execFile });
		const PDF = mock.reRequire('../src/pdf');

		await PDF.join({ sources, out });

		expect(execFile.calls).to.have.length(1);
		expect(execFile.lastCall.args.slice(0, 2)).to.deep.equal([
			'pdftk',
			[
				'foo1.pdf',
				'foo2.pdf',
				'cat',
				'output',
				'bar.pdf'
			]
		]);
	});


});
