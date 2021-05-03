# irs-form-filler

A tool for filling out IRS income tax forms.

# Warning

_You_ are responsible for filing your taxes correctly, not the maintainers of **irs-form-filler**.  If you know what you are doing, then this tool can help you.  This tool is only a form filler to the best of its ability for the specific tax year.  Do not rely only on this tool.  The maintainers are developers, not tax experts.

Specifically, this tool was designed to file taxes for US citizens who reside abroad, file their taxes within their country of residence and need to submit their taxes to the IRS with (hopefully) $0.00 amount owed.  Some companies charge substiantial amounts for filing, and this is a punative tax on US citizens living abroad.

# Initialize a new tax year project

```bash
$ mkdir tax-2020
$ cd tax-2020
$ npx irs-form-filler init
```

# Fill out all forms for the tax year

```bash
$ npx irs-form-filler fill config.yaml
```
