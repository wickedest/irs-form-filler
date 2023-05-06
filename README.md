# irs-form-filler

`irs-form-filler` is a tool for filling out Internal Revenue Service (IRS) income tax forms for the 2021 tax year.  Given a simple input file, this tool will generate a series of documents for filing with the IRS.

This tool was designed to file taxes for US citizens who reside abroad, file their taxes within their country of residence and need to submit their taxes to the IRS with (hopefully) $0.00 amount owed.  Some companies charge substiantial amounts for filing, and this is a punative tax on US citizens living abroad.

Actually, this tool was specifically designed to file taxes for its author.  Unless you fit the specific profile (i.e. married, filing separately, no dependents, etc.), then you may not find this tool very useful.  However, I am happy to accept PR that might extend the functionality of the scripts so as to support other filers, such as single filers, etc., but you have to do the work.  See [CONTRIBUTING.md](./CONTRIBUTING.md).

This tool takes an input YAML file, e.g.:

```yaml
firstName: Joe
middleInitial: A
lastName: Bloggs
ssn: 012-34-5678
occupation: Programmer
phone: 0015551212
email: joe.bloggs@domain.com
...
```

And fills the following IRS forms:

* [f1116](https://www.irs.gov/pub/irs-pdf/f1116.pdf) - Foreign Tax Credit
* [f1116 amt](https://www.irs.gov/pub/irs-pdf/f1116.pdf) - Foreign Tax Credit Alternative Minimum Tax
* [f1040 schedule 3](https://www.irs.gov/pub/irs-pdf/f1040s3.pdf) - Additional Credits and Payments
* [f1040](https://www.irs.gov/pub/irs-pdf/f1040.pdf) -  U.S. Individual Income Tax Return
* [f6251](https://www.irs.gov/pub/irs-pdf/f6251.pdf) - Alternative Minimum Tax—Individuals
* [f1040 schedule 2](https://www.irs.gov/pub/irs-pdf/f1040s2.pdf) - Additional Taxes
* [f1040 schedule b](https://www.irs.gov/pub/irs-pdf/f1040sb.pdf) - Interest and Ordinary Dividends
* [f8938](https://www.irs.gov/pub/irs-pdf/f8938.pdf) - Statement of Specified Foreign Financial Assets ([FBAR](https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar) also required, but filed electronically)

Once filled you can use the [e-file](https://www.irs.gov/filing/e-file-options) (if you earn $73,000 or less) and copy the values from the PDF documents to the e-file.  Alternatively, you can print all the files and post them snail-mail.  For more information, see [US Citizens and Resident Aliens Abroad](https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-resident-aliens-abroad).

## WARNING

**Do not rely on this tool to be correct.**  The maintainers are developers, not tax experts.  _You_ are responsible for filing your taxes correctly, not the maintainers of **irs-form-filler**, and we accept no responsibility for the documents this tool produces, and make no promises as to their correctness.  If you know what you are doing, then this tool can help you.

## Versions

This tool is only a form filler (to the best of its ability) for the specific tax year.  It has formulas for calculating individual fields and requires re-calibration every tax year because the IRS changes the forms every year.  Each year, there will be a new tagged version.

* [irs-2020](https://www.npmjs.com/package/irs-form-filler/v/0.2.0) - Fills forms for the 2020 tax return.
* [irs-2021](https://www.npmjs.com/package/irs-form-filler/v/0.3.0) - Fills forms for the 2021 tax return.

## How to use irs-form-filler

It is recommended to create and maintain separate directories for each tax year.  Use the tool to initialize a directory, populate the `config.yaml` file, and generate the tax documents, and then file your taxes.

### Initialize a new tax year project

```bash
$ mkdir tax-2021
$ cd tax-2021
$ npx -p irs-form-filler init
```

After running, your `tax-2021` directory will be initialized with a `config.yaml` file, which you use to provide your financial information.

### Fill out config.yaml

Edit `config.yaml` and fill out your information as per the [Configuration](#configuration) sections below.

### Generate tax documents

This tool uses a configuration file (e.g. `config.yaml`) to generate tax documents.  You must fill this file with your own details before running this tool.  See the [Configuration](#configuration) section for more information.

To generate your tax documents:

```bash
$ npx -p irs-form-filler fill
```

# Configuration

The following sections detail all the fields necessary to configure `config.yaml`.  You should keep a backup of this file and the documents that this tool produces, because they will be needed next year.

## Personal information

Edit `config.yaml` and update all of the following fields with your personal information.

| Field                  | Description |
| ---------------------- | ---------------------|
| **firstName** | Your first name. |
| **middleInitial** | Your middle initial. |
| **lastName** | Your last name (surname). |
| **ssn** | Your USA social security number or equivalent. |
| **occupation** | Your employment occupation. |
| **phone** | Your phone, including `00` country code (**use numbers only**). |
| **email** | Your email address. |
| **address.street** | The house number and street where you are tax resident. |
| **address.county** | The county in which you are tax resident. |
| **address.city** | The city in which are tax resident. |
| **address.postCode** | The postal code in which are tax resident. |
| **address.countryCode** | The country code in which are tax resident. |
| **address.country** | The country in which are tax resident. |
| **employer.name** | Your employer / company. |
| **employer.usaAddress** | Your employer's USA address. |
| **employer.foreignAddress** | Your employer's foreign address. |

## Financial information

Edit `config.yaml` and update all of the following fields with your financial information.

| Field                  | Description |
| ---------------------- | ---------------------|
| **endOfTaxYear** | The end of the tax year in `MM/DD/YYYY` format, e.g. `12/31/2021` |
| **filingStatus** | Your filing status, one of: `Single` \| `Married filing jointly` \| `Married filing separately` \| `Head of household` \| `Qualifying widow(er)` |
| **income¹** | This is your income from wages. |
| **incomeTax¹** | This is the amount of tax you paid on wages. |
| **averageExchangeRate** | Look up the exchange rate for on [irs.gov](https://www.irs.gov/individuals/international-taxpayers/yearly-average-currency-exchange-rates) for converting from your tax resident country's currency to USD. |
| **treasuryExchangeRate** | Look up the treasury exchange rate for on [fiscal.treasury.gov](https://fiscal.treasury.gov/reports-statements/treasury-reporting-rates-exchange/historical.html) for converting from your tax resident country's currency to USD. |
| **countriesWithBankAccounts** | A comma-separated list of countries for which you have bank accounts (an Schedule B and [FBAR](https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar) are required). |

1. This field value is in your tax resident country's currency; `irs-form-filler` will convert to USD.

## Foreign bank accounts

If you hold any foreign bank accounts, you must declare them to the IRS using form [f8938](https://www.irs.gov/pub/irs-pdf/f8938.pdf), but you must also submit a separate [FBAR](https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar) electronically.  For each account you own, create an item in `accounts` with the following fields:

| Field                  | Description |
| ---------------------- | ---------------------|
| **account** | The account number/designation. |
| **type** | The type of account, one of `deposit` | `custodial`.  A "custodial" might be a mutual fund, or brokerage account. |
| **name** | The name of the financial institution. |
| **address** | The financial institution's address. |
| **city** | The cityfinancial institution's city. |
| **currency** | The currency of the account. |
| **value** | The value of the account, in the stated `currency`. |
| **opened** | Set to `true` if the account was opened this year, otherwise `false`. |
| **closed** | Set to `true` if the account was closed this year, otherwise `false`. |
| **joint** | Set to `true` if the account is a joint account, otherwise `false`. |
| **tax** | Set to `true` if the account is taxable, otherwise `false`. |

## Carryover

As a US citizen living abroad and paying taxes in a foreign country with a bilateral tax agreement, there are two choices for how to handle the the foreign tax:

1. [Foreign Earned Income Exclusion](https://www.irs.gov/individuals/international-taxpayers/foreign-earned-income-exclusion) ([f2555](https://www.irs.gov/forms-pubs/about-form-2555))
2. [Foreign Tax Credit](https://www.irs.gov/individuals/international-taxpayers/foreign-tax-credit) ([f1116](https://www.irs.gov/forms-pubs/about-form-1116))

This configuration assumes #2.  This tool will calculate the amount of `utilized` taxes, and any "excess" can accumulate credit over the tax years.

### Foreign tax credit general carryover

Pay attention because it can be a little confusing.  This section deals with carryover from **previous years**.  _This tax year_ is the year for which you are filing taxes, and _previous tax year_ is the year prior to that.

| Field                  | Description |
| ---------------------- | ---------------------|
| **lastYearTaxCarryOverUSD** | This is the cumulative total amount of tax carryover, up to the previous tax year (excluding this tax year). So, if you used this tool to generate these files for the 2021 tax year, then it is in the `carryover-general.pdf` file and the total value in the field **Carryover to 2021**.  If you did not calculate carryover for the previous tax year, enter `0`. |

If you used this tool to generate tax in the previous tax year, then open the previous tax year's `carryover-general.pdf` file, and find the row of values for the previous tax year.  Then, in the `carryover.general` section, create a new section for the previous year's carryover, and copy the values for **Foreign Taxes** and **Utilized** and record them as follows:

```yaml
general:
  2019:
    foreign-taxes: 10404
    utilized: 980
```

Keep this `config.yaml` for all previous tax years, and also keep this tax year's `carryover-general.pdf` as it will feed into next year's tax.

## Foreign tax credit alternative minimum tax (AMT) carryover

This is similar to the [Carryover](#carryover) section but instead deals with [Alternative Minimum Tax](https://www.irs.gov/taxtopics/tc556).  This is any surplus tax that paid in your tax resident country that is above what you would have paid to the USA.

Open last tax year's `carryover-general.pdf` file, and find the row of values for the previous tax year.  Then, in the `carryover.alternative-minimum-tax` section, create a new section for the previous year's carryover, and copy the values for **Foreign Taxes** and **Utilized** and record them as follows:

```yaml
alternative-minimum-tax:
  2019:
    foreign-taxes: 10404
    utilized: 980
```

Keep this record of all the previous tax years.  This section will feed into next year's taxes.
