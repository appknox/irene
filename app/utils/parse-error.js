/* eslint-disable prettier/prettier */
const parseError = function(err, defaultMessage) {
  let errMsg = defaultMessage || '';
  if (err.errors && err.errors.length) {
    errMsg = err.errors[0].detail || errMsg;
  } else if (err.payload && err.payload.detail) {
    errMsg = err.payload.detail;
  } else if (err.message) {
    errMsg = err.message;
  }
  return errMsg;
};

export default parseError;
