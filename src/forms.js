import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { promises: afs } = fs;

const fillOrder = [
	'f1116',
	'f1116sb',
	'f1116sbamt',
	'f1116amt',
	'f1040s3',
	'f1040',
	'f6251',
	'f1040s2',
	'f1040sb',
	'f8965',
	'f8938'
];

function sortByFillOrder(a, b) {
	const ia = fillOrder.indexOf(a);
	const ib = fillOrder.indexOf(b);
	if (ia >= 0 && ib >= 0) {
		return ia - ib; // e.g. 0-2 = -2
	}
	if (ia >= 0) {
		return -1;
	}
	return 1;
}

async function getForms() {
	return afs
		.readdir(path.join(__dirname, 'forms'))
		.then((forms) => {
			const result = {};

			const ordered = forms
				.map(a => a.replace('.pdf', ''))
				.sort(sortByFillOrder);

			for (const formId of ordered) {
				result[formId] = {
					map: path.join(__dirname, 'maps', `${formId}-map.yaml`),
					script: path.join(__dirname, 'scripts', `${formId}.yaml`),
					pdf: path.join(__dirname, 'forms', `${formId}.pdf`)
				};
			}
			return result;
		});
}

export default getForms;
