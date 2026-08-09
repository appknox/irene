/**
 * Pull the first message out of a DRF field-error body.
 *
 * Serializer validation failures arrive keyed by field, with no `detail`:
 * `{ p12: ['file too large (max 256 KB)'] }`. Without this the caller falls
 * through to its generic fallback and the user never learns what was wrong.
 *
 * Only array-of-string values count, which is the shape DRF produces for field
 * errors — that keeps an unrelated string field in an error body from being
 * mistaken for the message.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function firstFieldError(payload: any): string | undefined {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return undefined;
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0];
    }
  }

  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function parseError(err: any, defaultMessage?: string) {
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
  } else {
    // Checked last so every branch above keeps its existing behaviour.
    errMsg = firstFieldError(error.payload ?? error) ?? errMsg;
  }

  return errMsg;
}
