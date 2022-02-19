# irs-form-filler

A tool for filling out IRS income tax forms.

# Warning

_You_ are responsible for filing your taxes correctly, not the maintainers of **irs-form-filler**.  If you know what you are doing, then this tool can help you.  This tool is only a form filler to the best of its ability for the specific tax year.  Do not rely only on this tool.  The maintainers are developers, not tax experts.

This tool was designed to file taxes for US citizens who reside abroad, file their taxes within their country of residence and need to submit their taxes to the IRS with (hopefully) $0.00 amount owed.  Some companies charge substiantial amounts for filing, and this is a punative tax on US citizens living abroad.

Actually, this tool was designed to file taxes for its author.  Unless you fit the specific profile (i.e. married, filing separately, no dependents, etc.), then you may not find this tool very useful.  However, I am happy to accept PR that might extend the functionality of the scripts so as to support other filers, such as single filers, etc., but you have to do the work.  See [CONTRIBUTING.md](./CONTRIBUTING.md).

# Initialize a new tax year project

```bash
$ mkdir tax-2020
$ cd tax-2020
$ npx -p irs-form-filler init
```

After running, your `tax-2020` directory will be initialized with a `config.yaml` file, which you use to provide your financial information.

# Fill out all forms for the tax year

Update `config.yaml` with your current tax year details, and then run:

```bash
$ npx -p irs-form-filler fill config.yaml
```
