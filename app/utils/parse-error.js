export default function parseError(err, defaultMessage) {
  let errMsg = defaultMessage || '';
  let error;
  if (err.errors && err.errors.length) {
    error = err.errors[0];
  } else {
    error = err;
  }
  if (error.status == 500) {
    errMsg = error.title;
  } else if (error.status == 0) {
    errMsg = 'API request failed'; // adapter error
  } else if (error.payload && error.payload.detail) {
    errMsg = error.payload.detail;
  } else if (error.payload && error.payload.message) {
    errMsg = error.payload.message;
  } else if (error.detail) {
    errMsg = error.detail;
  } else if (error.message) {
    errMsg = error.message;
  } else if (error.title) {
    errMsg = error.title;
  }
  return errMsg;
}
