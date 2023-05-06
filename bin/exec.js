#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import yargs from 'yargs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fill from '../src/index.js';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { argv } = yargs(process.argv.slice(2))
	.command(
		'fill [--only form] [-o output] [-d key] [config]',
		'Fill PDF tax forms.',
		(yargs) => {
			yargs.positional('config', {
				describe: 'The YAML config file to use when filling forms.',
				type: 'string',
				// required: true,
				default: 'config.yaml'
			}).option(
				'only', {
					description: 'Only fill the specified tax document',
				}
			).option(
				'output', {
					alias: 'o',
					description: 'The output directory for the filled forms.',
					default: 'filled'
				}
			).option(
				'debug', {
					alias: 'd',
					description: 'Debug a key, e.g. "part.2.line1".  Use with --inspect-brk.'
				}
			).alias(
				'v', 'version'
			).alias(
				'h', 'help'
			);
		}
	)
	.command(
		'init [--force]',
		'Initialize a new tax year project.',
		(yargs) => {
			yargs.alias('h', 'help')
				.option(
					'force', {
						type: 'boolean',
						alias: 'f',
						description: 'Force the generation of a new config file.',
						default: false
					}
				)
		}
	);

async function init({ force }) {
	try {
		await fs.access('config.yaml', fs.constants.R_OK | fs.constants.W_OK);
		if (!force) {
			console.error('config.yaml already exists; use --force to overwrite.');
			process.exit(-1);
		}
	} catch (ex) {
		// okay, file does not exist
	}
	const config = await fs.readFile(path.join(__dirname, '..', 'config.yaml'));
	await fs.writeFile('config.yaml', config);

	/*
	const year = (new Date()).getFullYear() - 1;
	await fs.writeFile('package.json', JSON.stringify({
		name: `tax-${year}`,
		version: '1.0.0',
		description: `Your tax year ${year}`,
		keywords: [],
		author: '',
		license: 'ISC',
		private: true,
		dependencies: {
			'irs-form-filler': '^0.3.0'
		},
		scripts: {
			build: 'fill config.yaml',
			test: 'echo "Error: no tests" && exit 1'
		}
	}, null, '\t'));
	*/
}

if (argv._.includes('init')) {
	init(argv).catch(console.err);
} else if (argv._.includes('fill')) {
	const only = (typeof argv.only === 'string') ? [ argv.only ] : argv.only;
	fill({
		config: argv.config,
		output: argv.output,
		debug: argv.debug,
		only
	}).catch((ex) => {
		console.error(chalk.red(ex.stack));
	});
} else {
	yargs.showHelp();
	process.exitCode = 1;
}
