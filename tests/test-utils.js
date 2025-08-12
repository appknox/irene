import { underscore } from '@ember/string';
import { find } from '@ember/test-helpers';

function _serialize_object(payload) {
  return Object.keys(payload.attrs).reduce((acc, curr) => {
    acc[underscore(curr)] = payload[curr];
    return acc;
  }, {});
}

export function serializer(data, many = false) {
  if (many) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data.models.map((d) => _serialize_object(d)),
    };
  } else {
    return _serialize_object(data);
  }
}

export function objectifyEncodedReqBody(reqBody = '') {
  // Splitting the string into an array of key-value pairs
  const pairs = reqBody.split('&');

  // Converting the array into an object using reduce
  const paramsObject = pairs.reduce((acc, pair) => {
    const [key, value] = pair.split('=');
    acc[key] = decodeURIComponent(value.replace(/\+/g, ' '));
    return acc;
  }, {});

  return paramsObject;
}

export const compareInnerHTMLWithIntlTranslation = (
  assert,
  { element, selector, message, doIncludesCheck }
) => {
  const innerHTML =
    element?.innerHTML || find(selector.trim()).innerHTML.trim();

  const assertMessage = `Element ${selector}: "${innerHTML}" <=====> Compared HTML: "${message}"`;

  if (doIncludesCheck) {
    assert.true(innerHTML.includes(message), assertMessage);
  } else {
    assert.strictEqual(innerHTML, message, assertMessage);
  }
};
