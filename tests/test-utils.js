import { underscore } from '@ember/string';

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
