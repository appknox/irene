/**
 * Converts a URL-encoded request body string into a JavaScript object.
 *
 * The function takes the `requestBody` property of the given request object,
 * replaces '&' with '","' and '=' with '":"', wraps it in '{"' and '"}' to form
 * a valid JSON string, then parses it into an object. URL-encoded characters
 * in the values are decoded.
 *
 * @param {Object} req - The request object containing the URL-encoded request body.
 * @param {string} req.requestBody - The URL-encoded request body string.
 * @returns {Object} - The parsed request body as a JavaScript object with decoded values.
 *
 * @example
 * // Example request object
 * const req = {
 *   requestBody: 'name=name&age=30&city=Lisbon'
 * };
 *
 * // Parsed object
 * const parsedBody = getReqBodyObjFromReqBodyStr(req);
 * console.log(parsedBody);
 * // Output: { name: 'name', age: '30', city: 'Lisbon' }
 */

export function getReqBodyObjFromReqBodyStr(req) {
  return JSON.parse(
    '{"' + req.requestBody.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
    function (key, value) {
      return key === '' ? value : decodeURIComponent(value);
    }
  );
}
