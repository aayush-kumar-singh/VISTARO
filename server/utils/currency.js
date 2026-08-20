const EXCHANGE_RATES = {
    INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 1.0, locale: "en-IN" },
    USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 0.012, locale: "en-US" },
    EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 0.011, locale: "de-DE" },
    GBP: { code: "GBP", symbol: "£", name: "British Pound", rate: 0.0095, locale: "en-GB" },
    AED: { code: "AED", symbol: "AED", name: "UAE Dirham", rate: 0.044, locale: "en-AE" },
};

function formatPrice(amountInINR, targetCurrencyCode = "INR") {
    const num = Number(amountInINR) || 0;
    const config = EXCHANGE_RATES[targetCurrencyCode] || EXCHANGE_RATES.INR;
    const converted = num * config.rate;

    try {
        return new Intl.NumberFormat(config.locale, {
            style: "currency",
            currency: config.code,
            maximumFractionDigits: 0,
        }).format(converted);
    } catch (e) {
        return `${config.symbol} ${Math.round(converted).toLocaleString()}`;
    }
}

module.exports = {
    EXCHANGE_RATES,
    formatPrice,
};
