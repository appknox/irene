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
