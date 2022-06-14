import { underscore } from '@ember/string';

function _serialize_object(payload) {
  const serializedPayload = {};
  Object.keys(payload.attrs).map((_key) => {
    serializedPayload[underscore(_key)] = payload[_key];
  });
  return serializedPayload;
}

export function serializer(data, many = false) {
  if (many == true) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data.models.map((d) => {
        return _serialize_object(d);
      }),
    };
  } else {
    return _serialize_object(data);
  }
}
