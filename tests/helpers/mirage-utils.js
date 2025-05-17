import { find, findAll } from '@ember/test-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import styles from 'irene/components/ak-select/index.scss';

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

/**
 * Get the trigger element of an AkSelect component.
 *
 * @param {Object} assert - The QUnit assert object.
 * @param {string} selector - The selector for the AkSelect component.
 * @returns {Object} - The trigger element of the AkSelect component.
 */

const classes = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

export const assertAkSelectTriggerExists = (assert, selector) =>
  assert.dom(`${selector} .${classes.trigger}`).exists();

/**
 * Find the trigger element of an AkSelect component.
 *
 * @param {Object} assert - The QUnit assert object.
 * @param {string} selector - The selector for the AkSelect component.
 * @returns {Object} - The trigger element of the AkSelect component.
 */

export const findAkSelectTrigger = (assert, selector) =>
  find(`${selector} .${classes.trigger}`);

/**
 * Choose an option from an AkSelect component.
 *
 * @param {Object} options - The options for the AkSelect component.
 * @param {string} options.selectTriggerClass - The class of the trigger element.
 * @param {string} options.labelToSelect - The label of the option to choose.
 * @param {number} options.optionIndex - The index of the option to choose.
 * @param {string} options.triggerSelector - The selector of the trigger element.
 */
export const chooseAkSelectOption = async ({
  selectTriggerClass,
  labelToSelect,
  optionIndex,
}) => {
  await clickTrigger(selectTriggerClass);

  if (optionIndex !== undefined) {
    await selectChoose(
      selectTriggerClass,
      '.ember-power-select-option',
      optionIndex
    );
  } else {
    // Choose the selected option label
    await selectChoose(selectTriggerClass, labelToSelect);
  }
};

/**
 * Get all options from an AkSelect component.
 *
 * @param {string} selectTriggerClass - The class of the trigger element.
 * @returns {Object} - The options of the AkSelect component.
 */
export const getAllAkSelectOptions = async (selectTriggerClass) => {
  // Click the trigger element
  await clickTrigger(selectTriggerClass);

  return findAll('.ember-power-select-option');
};

/**
 * Check that label is selected
 *
 * @param {Object} assert - The QUnit assert object.
 * @param {string} selector - The selector for the AkSelect component.
 * @param {string} label - The label of the option to check.
 * @param {number} optionIndex - The index of the option to check.
 */
export const assertAkSelectOptionSelected = async ({
  assert,
  selector,
  label,
  optionIndex,
}) => {
  if (optionIndex !== undefined) {
    // Click the trigger element
    await clickTrigger(selector);

    // Get all options
    const options = findAll('.ember-power-select-option');

    assert
      .dom(options[optionIndex])
      .hasAria('selected', 'true')
      .containsText(label);
  } else {
    assert.dom(`${selector} .${classes.trigger}`).containsText(label);
  }
};
