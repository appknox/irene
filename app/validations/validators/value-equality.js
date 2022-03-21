/* eslint-disable prettier/prettier */
export default function validateEquality({expected, message}) {
  return function (key, value) {
    if (value && value === expected) {
      return true;
    }
    return message;
  };
}
