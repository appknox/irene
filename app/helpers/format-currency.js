import { helper } from '@ember/component/helper';

const formatCurrency = params => {
  const currencyName = params[0];
  const amount = params[1];

  const currency =  (!!currencyName && typeof currencyName === 'string'
    && currencyName.trim().length > 0) ?
    currencyName.toUpperCase() : "";

  const value = amount ? amount : "0";

  return `${currency} ${(value/100)}`;

};

export default helper(formatCurrency);
