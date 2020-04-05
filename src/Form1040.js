const BaseForm = require('./BaseForm');

class Form1040 extends BaseForm {
	constructor(ctx) {
		super(ctx, 'f1040');
	}
}

module.exports = Form1040;
