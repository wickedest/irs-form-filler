const execFile = require('child_process').execFile;

class PDF {
	static cat({ source, pages, out }) {
		return new Promise((resolve, reject) => {
			// pdftk /forms/2018/f8938.pdf cat 1-2 3-end output out.pdf
			const args = [
				source,
				'cat',
				pages,
				'output',
				out
			];
			execFile('pdftk', args, (error, stdout, stderr) => {
				if (error) {
					return reject(error);
				}
				resolve();
			});
		});
	}

	static join({ sources, out }) {
		const files = (sources instanceof Array) ? sources : [sources];
		return new Promise((resolve, reject) => {
			// pdftk /forms/2018/f8938.pdf cat 1-2 3-end output out.pdf
			const args = [
				...files,
				'cat',
				'output',
				out
			];
			execFile('pdftk', args, (error, stdout, stderr) => {
				if (error) {
					return reject(error);
				}
				resolve();
			});
		});
	}
};

module.exports = PDF;
