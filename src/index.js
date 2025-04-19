import fs from 'fs';
import { Form } from 'pdffiller-script';
import getForms from './forms.js';
import FormFiller from './FormFiller.js';

const afs = fs.promises;

async function fill({ config, only, output, debug }) {
	const forms = await getForms();
	const formFillers = {};
	for (const formId in forms) {
		formFillers[formId] = FormFiller.create({
			name: formId,
			...forms[formId]
		});
	}

	ensureDirectory(output);

	const form = new Form();
	await form.init(config);

	// 1st pass
	const filled = [];
	for (const formId in forms) {
		await formFillers[formId].fill(form, null, { debug, filled });
	}
	// 2nd pass
	for (const formId in forms) {
		await formFillers[formId].fill(form, null, { debug, filled });
	}
	// 3nd pass, save
	for (const formId in forms) {
		const save = only ? only.includes(formId) : true;
		await formFillers[formId].fill(form, save ? output : null, { debug, filled });
	}
}

function ensureDirectory(dir) {
	// log('ensure dir:', dir);
	return afs.access(dir, fs.constants.R_OK | fs.constants.W_OK)
		.catch(() => {
			// log('mkdir:', dir);
			afs.mkdir(dir);
		});
}

export default fill;
