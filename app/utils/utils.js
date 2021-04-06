/**
 *
 * @param {Number} left
 * @param {Number} right
 * @param {Boolean} inclusive
 */
export function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}

/**
 * @function checkStringCharRange
 * @param {String} str
 * @param {Number} min
 * @param {Number} max
 * @param {Boolean} includeRange
 * Method to check the string is contain given range in terms of length
 */
export function checkStringCharRange(str, min, max, includeRange = true) {
  let isStringRange = false;
  if (str && str !== '') {
    const strLength = str.toString().length;
    if (includeRange) {
      isStringRange = strLength >= min && strLength <= max;
    } else {
      isStringRange = strLength > min && strLength < max;
    }
  }
  return isStringRange;
}
