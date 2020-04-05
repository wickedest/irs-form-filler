function toCurrency(val) {
	return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function parseCurrency(val) {
	return parseInt(val.replace && val.replace(',', '') || val);
}

module.exports = {
	toCurrency,
	parseCurrency
};
