const Form1116 = require('./Form1116');

class Form1116amt extends Form1116 {
	constructor(ctx) {
		super(ctx, 'f1116amt');
		this.type = 'alternative-minimum-tax';
	}
}

module.exports = Form1116amt;
