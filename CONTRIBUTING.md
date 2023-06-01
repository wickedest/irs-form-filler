# Contributing

## Developing

To develop, you will first need to generate the `./examples` so that you can use this for a visual reference with respect to the `src/maps` files:

```bash
$ npm run build:map
```

The `./examples` are pre-filled forms that assign an integer to every input field (that can accept text) that can be used to to visually map the form fields to their keys.  This is necessary because the input fields are not really very human readable, e.g. `topmostSubform[0].Page1[0].FilingStatus[0].c1_01[0]`.  Some fields are checkboxes so are not filled (you may have to count from the last visible integer).

## Updating irs-form-filler documents for a new tax year

Pull master, and create a new branch for the tax year, for example:

```bash
$ git checkout -b year-2022
```

Remove all pre-existing data:

```bash
$ rm src/forms/*.pdf
$ rm src/maps/*.yaml
$ rm examples/*.pdf
```

Fetch the latest tax documents.  The required documents can change year to year, so the script may need to be updated if any new documents were added, or if any are no longer required (e.g. [f8965.pdf](https://www.irs.gov/affordable-care-act/individuals-and-families/individual-shared-responsibility-provision)).

```bash
$ npm run build:fetch
```

Generate the `src/maps` files and `examples` files:

```bash
$ npm run build:map
```

Update the `package.json` version, bump to a major release candidate, e.g.

```json
"version": "0.4.0-rc0",
```

## Updating irs-form-filler for a new tax year

This is the hard part.  Every year is different.  The `src/scripts` are sensitive to the specific tax year.  There are hard-coded values taken from the IRS instruction booklets, e.g. 1040 line 12a.  Not to mention that fields are sequentially numbered, so if they add, or move fields, their values will be all wrong.

It is useful to generate examples of the previous tax year, and one for the new tax year and visually compare the old/new documents.  This will help identify key differences between them, allowing you to update the `src/scripts` accordingly.

Examine all of the scripts in `src/scripts` against their
pre-filled PDF forms in `./examples`.  Some PDF readers do not seem to recognize the pre-filled fields, so if that is the case, open the PDF in chrome.  Not all fields are filled.  It may even be helpful to look at the previous year's form.

You need to go through every script line-by-line.  Each line requires concentration and take upwards of 15 minutes.  It is easy to lose your place.  I recommend putting a comment in the script as you go along: `// CURRENT -----------------`.

There are two main files are f1040 and f1116, but all files need to be checked.

1. If a field number changed, update it in the script.
2. If the tax form number changed (e.g. "7b" => "9"), then change it in the script.  However, if you change it, you must change **all** references to it in the current script, and in other scripts, e.g. `['f1040']['line.7b.total.income.whole']` changed to `['f1040']['line.9.total.income.whole']`, do this **before** changing the actual key.
3. If the instructions change, update it in the script (useful for reference).
4. If you notice a field was added in the form and it looks like it should be added to the script, add it.
5. If you notice a field's value is calculated differently, make the new calculation.
6. If you find a reference to another script that is not yet updated, do not update it until you get to that script.

Then debug.

This is useful for tracing field dependencies:
```bash
DEBUG=pdffiller-script npx irs-form-filler fill config.yaml |& grep 'part.i.3.total.tax.whole\|part.2.line.11.amt.whole\|line.17.alternative.minimum.tax.whole'
```

### Specific fields of note

**1040 standard.deduction**: This changes every year on the 1040.  The 1040 margin lists the standard deductions.  Update `src/scripts/f1040.yaml` with the appropriate standard deduction values and field number.

**1040 tax**: This requires you read the instructions and uses the Tax Computation Worksheet.

**1040 amount from schedule 2, line 3**: This is the Alternative Minimum Tax which is calculated in f6251.

**6251 exemption**: The values for this field are found in Part II of the form.

**6251 line 7**: The values for this field are found in Part II of the form.  The text is so confusing, but the "married filing separately" is a separate else condition.
