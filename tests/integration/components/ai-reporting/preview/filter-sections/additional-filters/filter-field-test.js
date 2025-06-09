import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';

import {
  calendarCenter,
  calendarSelect,
} from 'ember-power-calendar/test-support/helpers';

import dayjs from 'dayjs';

import ENUMS from 'irene/enums';
import { aiReportFilterOperators } from 'irene/helpers/ai-report-filter-operators';

import {
  assertAkSelectOptionSelected,
  assertAkSelectTriggerExists,
  chooseAkSelectOption,
} from 'irene/tests/helpers/mirage-utils';

import * as AI_GENERATE_REPORT_UTILS from 'irene/tests/helpers/ai-generate-report-utils';

// Filter operators labels
const FILTER_OPERATORS_LABELS = {
  eq: 'equalTo',
  neq: 'notEqualTo',
  gt: 'greaterThan',
  gte: 'greaterThanOrEqual',
  lt: 'lessThan',
  lte: 'lessThanOrEqual',
  in: 'anyOf',
  not_in: 'noneOf',
  contains: 'contains',
  icontains: 'containsCaseInsensitive',
  startswith: 'startsWith',
  endswith: 'endsWith',
  range: 'range',
  exists: 'exists',
  isnull: 'doesNotExist',
};

// OPERATORS
const { IN, NOT_IN, EXISTS, ISNULL, RANGE } =
  ENUMS.AI_REPORTING_FILTER_OPERATOR;

const IN_OPERATORS = [IN, NOT_IN];
const RANGE_OPERATORS = [RANGE];
const EXISTS_OPERATORS = [EXISTS, ISNULL];

// TEST START
module(
  'Integration | Component | ai-reporting/preview/filter-sections/additional-filters/filter-field',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    /**
     * ================================
     * TEST HELPER FUNCTIONS
     * ================================
     */
    function getFieldByTypeAndChoices(testData, type, withChoices) {
      let field = {};

      testData.filter_details.forEach((f) => {
        f.fields.find((f) => {
          const isType = f.type === type;
          const hasChoices = !!f.choices;

          if (withChoices) {
            field = isType && hasChoices ? f : field;
          } else {
            field = isType && !hasChoices ? f : field;
          }
        });
      });

      return field;
    }

    test.each(
      'it updates field value on operator change',
      [
        { type: ENUMS.AI_REPORTING_FIELD_TYPE.STRING },
        { type: ENUMS.AI_REPORTING_FIELD_TYPE.FLOAT },
        { type: ENUMS.AI_REPORTING_FIELD_TYPE.BOOLEAN },
        { type: ENUMS.AI_REPORTING_FIELD_TYPE.DATETIME },
        { type: ENUMS.AI_REPORTING_FIELD_TYPE.INTEGER, withChoices: false },
        { type: ENUMS.AI_REPORTING_FIELD_TYPE.INTEGER, withChoices: true },
      ],
      async function (assert, { type, withChoices }) {
        const testData = AI_GENERATE_REPORT_UTILS.generateTestData(1);

        // Find the field with the correct type and choices
        const field = getFieldByTypeAndChoices(testData, type, withChoices);

        // Component props
        this.setProperties({
          sectionId: 'test-section',
          field,
          operators: aiReportFilterOperators([field]),
          erroredFields: {},
          allCurrFilters: {},
          selectedFilters: [],
          onAddUpdateFilter: (id, detail) => {
            this.set('allCurrFilters', {
              ...this.allCurrFilters,
              ...detail,
            });
          },
        });

        await render(hbs`
          <AiReporting::Preview::FilterSections::AdditionalFilters::FilterField
            @sectionId={{this.sectionId}}
            @field={{this.field}}
            @operators={{this.operators}}
            @erroredFields={{this.erroredFields}}
            @allCurrFilters={{this.allCurrFilters}}
            @onAddUpdateFilter={{this.onAddUpdateFilter}}
          />
        `);

        // Boolean field types have only two constant choices
        // This is manually being added since no choices are returned for boolean field types
        field.choices =
          type === ENUMS.AI_REPORTING_FIELD_TYPE.BOOLEAN
            ? [
                ['True', 'true'],
                ['False', 'false'],
              ]
            : field.choices;

        // Check that the correct filter fields value component is rendered
        if (field?.choices) {
          const choiceTypeTriggerClass = `.${field.field}-filter-group-item-field-choice-select`;

          // Choice type values
          assertAkSelectTriggerExists(assert, choiceTypeTriggerClass);

          // Choose first option
          const firstOption = field.choices[0][0];

          await chooseAkSelectOption({
            selectTriggerClass: choiceTypeTriggerClass,
            labelToSelect: firstOption, // Enum value
          });

          // Check that the value is filled in
          assertAkSelectOptionSelected({
            assert,
            selector: choiceTypeTriggerClass,
            label: firstOption,
          });
        } else if (field.type === ENUMS.AI_REPORTING_FIELD_TYPE.DATETIME) {
          // Pick a date
          const dateTriggerSelector = `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupContent-field-datePicker-toggleBtn]`;
          const dateToSelect = new Date();
          const dateDisplayValue = dayjs(dateToSelect).format('DD MMM, YYYY');

          assert
            .dom(dateTriggerSelector)
            .hasText(t('reportModule.advancedFilters.selectDate'));

          assert.dom('[data-test-akDatePicker-calendar]').doesNotExist();

          // open date picker
          await click(dateTriggerSelector);

          assert.dom('[data-test-akDatePicker-calendar]').exists();

          await calendarSelect(
            '[data-test-akDatePicker-calendar]',
            dateToSelect
          );

          assert.dom(dateTriggerSelector).containsText(dateDisplayValue);
        } else {
          const inputElement = find(
            '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupContent-field-textTypeInput]'
          );

          assert.dom(inputElement).exists();

          const isFloat = field?.type === ENUMS.AI_REPORTING_FIELD_TYPE.FLOAT;
          const isInt = field?.type === ENUMS.AI_REPORTING_FIELD_TYPE.INTEGER;
          const value = isFloat ? '123.45' : isInt ? '123' : 'test';

          // Fill in the value
          await fillIn(inputElement, value);

          // Check that the value is filled in
          assert.dom(inputElement).hasValue(value);
        }
      }
    );

    test.each(
      'it returns the expected data type for an operator',
      [
        { type: ENUMS.AI_REPORTING_FIELD_TYPE.STRING },
        { type: ENUMS.AI_REPORTING_FIELD_TYPE.FLOAT },
        { type: ENUMS.AI_REPORTING_FIELD_TYPE.BOOLEAN },
        { type: ENUMS.AI_REPORTING_FIELD_TYPE.DATETIME },
        { type: ENUMS.AI_REPORTING_FIELD_TYPE.INTEGER, withChoices: false },
        { type: ENUMS.AI_REPORTING_FIELD_TYPE.INTEGER, withChoices: true },
      ],
      async function (assert, { type, withChoices }) {
        const testData = AI_GENERATE_REPORT_UTILS.generateTestData(1);

        // Find the field with the correct type and choices
        const field = getFieldByTypeAndChoices(testData, type, withChoices);
        const validOperators = aiReportFilterOperators([field]);

        // Component props
        this.setProperties({
          sectionId: 'test-section',
          field,
          operators: validOperators,
          erroredFields: {},
          allCurrFilters: {},
          selectedFilters: [],
          onAddUpdateFilter: (id, detail) => {
            this.set('allCurrFilters', {
              ...this.allCurrFilters,
              ...detail,
            });

            if (!this.validateValue) {
              return;
            }

            // Get the filter data
            const filterData = Object.values(detail)[0];
            const operator = filterData.operator;
            const value = filterData.value;
            const isBoolean = type === ENUMS.AI_REPORTING_FIELD_TYPE.BOOLEAN;

            // Boolean field types have only two constant choices: True and False
            if (isBoolean) {
              assert.ok(
                typeof value === 'boolean',
                `Expected value to be a boolean for operator ${operator}`
              );
            }
            // Confirm the data type of the value
            else if (
              IN_OPERATORS.includes(operator) ||
              RANGE_OPERATORS.includes(operator)
            ) {
              assert.ok(
                Array.isArray(value),
                `Expected value to be an array for operator ${operator}`
              );
            } else if (EXISTS_OPERATORS.includes(operator)) {
              assert.ok(
                [true, false, null].includes(value),
                `Expected value to be one of [true, false, null] for operator ${operator}`
              );
            } else {
              assert.ok(
                typeof value === 'string',
                `Expected value to be a string for operator ${operator}`
              );
            }

            this.set('validateValue', false);
          },
        });

        // Disable value validation until necessary
        this.set('validateValue', false);

        await render(hbs`
          <AiReporting::Preview::FilterSections::AdditionalFilters::FilterField
            @sectionId={{this.sectionId}}
            @field={{this.field}}
            @operators={{this.operators}}
            @erroredFields={{this.erroredFields}}
            @allCurrFilters={{this.allCurrFilters}}
            @onAddUpdateFilter={{this.onAddUpdateFilter}}
          />
        `);

        for (let index = 0; index < validOperators.length; index++) {
          // Select the operator
          const operator = validOperators[index];
          const operatorTriggerClass = `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupContent-field-filterOperatorSelectKey="${field.field}"]`;

          const operatorLabel = t(
            `reportModule.advancedFilters.${FILTER_OPERATORS_LABELS[operator]}`
          );

          // Select the operator
          await chooseAkSelectOption({
            selectTriggerClass: operatorTriggerClass,
            labelToSelect: operatorLabel, // Enum value
          });

          assertAkSelectOptionSelected({
            assert,
            selector: operatorTriggerClass,
            label: operatorLabel,
          });

          const isAnInOperator = IN_OPERATORS.includes(operator);
          const isARangeOperator = RANGE_OPERATORS.includes(operator);
          const isAnExistsOperator = EXISTS_OPERATORS.includes(operator);

          // Boolean field types have only two constant choices
          // This is manually being added since no choices are returned for boolean field types
          field.choices =
            type === ENUMS.AI_REPORTING_FIELD_TYPE.BOOLEAN
              ? [
                  ['True', 'true'],
                  ['False', 'false'],
                ]
              : field.choices;

          // Update field value
          if (field?.choices) {
            const choiceTypeTriggerClass = `.${field.field}-filter-group-item-field-choice-select`;

            if (isAnExistsOperator) {
              assert.dom(choiceTypeTriggerClass).doesNotExist();

              continue;
            }

            // Choice type values
            assertAkSelectTriggerExists(assert, choiceTypeTriggerClass);

            // Only validate after selecting options
            this.set('validateValue', true);

            const optionsToSelect = field.choices
              .slice(0, isAnInOperator ? 2 : 1)
              .map((o) => o[0]);

            // Select multiple options if the operator is an in operator and a single option if it is not
            for (const option of optionsToSelect) {
              await chooseAkSelectOption({
                selectTriggerClass: choiceTypeTriggerClass,
                labelToSelect: option, // Enum value
              });

              assertAkSelectOptionSelected({
                assert,
                selector: choiceTypeTriggerClass,
                label: option,
              });
            }
          } else if (field.type === ENUMS.AI_REPORTING_FIELD_TYPE.DATETIME) {
            // Date picker trigger
            const dateTriggerSelector = `[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupContent-field-datePicker-toggleBtn]`;
            const calendarSelector = `[data-test-akDatePicker-calendar]`;

            if (isAnExistsOperator) {
              assert.dom(dateTriggerSelector).doesNotExist();

              continue;
            }

            // Dates to select from
            const datesToSelectFrom = [
              dayjs().subtract(1, 'day').toDate(),
              dayjs().toDate(),
              dayjs().subtract(3, 'day').toDate(),
            ];

            // For range dates
            if (isARangeOperator) {
              assert
                .dom(dateTriggerSelector)
                .hasText(`${t('fromDate')} - ${t('toDate')}`);

              // open date picker
              await click(dateTriggerSelector);

              // Check that the date picker is open
              assert.dom(calendarSelector).exists();

              const prevMonth = dayjs().subtract(1, 'month');

              await calendarCenter(calendarSelector, prevMonth.toDate());

              const dateFrom = new Date(prevMonth.year(), prevMonth.month(), 1);
              const dateTo = new Date(prevMonth.year(), prevMonth.month(), 24);

              await calendarSelect(calendarSelector, dateFrom);

              this.set('validateValue', true);

              await calendarSelect(calendarSelector, dateTo);

              const fomatedFrom = dayjs(dateFrom).format('DD MMM, YYYY');
              const fomatedTo = dayjs(dateTo).format('DD MMM, YYYY');

              assert
                .dom(dateTriggerSelector)
                .hasText(`${fomatedFrom} - ${fomatedTo}`);
            }
            // For multiple dates
            else if (isAnInOperator) {
              assert
                .dom(dateTriggerSelector)
                .containsText(
                  t('reportModule.advancedFilters.selectMultipleDates')
                );

              // open date picker
              await click(dateTriggerSelector);

              assert.dom('[data-test-akDatePicker-calendar]').exists();

              this.set('validateValue', true);

              // Select multiple dates
              for (const date of datesToSelectFrom) {
                await calendarSelect('[data-test-akDatePicker-calendar]', date);

                assert
                  .dom(dateTriggerSelector)
                  .containsText(dayjs(date).format('DD/MM/YY'));
              }
            } else {
              this.set('validateValue', true);

              const dateToSelect = datesToSelectFrom[0];

              const dateDisplayValue =
                dayjs(dateToSelect).format('DD MMM, YYYY');

              assert
                .dom(dateTriggerSelector)
                .hasText(t('reportModule.advancedFilters.selectDate'));

              assert.dom('[data-test-akDatePicker-calendar]').doesNotExist();

              // open date picker
              await click(dateTriggerSelector);

              assert.dom('[data-test-akDatePicker-calendar]').exists();

              await calendarSelect(
                '[data-test-akDatePicker-calendar]',
                dateToSelect
              );

              assert.dom(dateTriggerSelector).containsText(dateDisplayValue);
            }
          } else {
            // Get the input element
            const inputElement = find(
              '[data-test-aiReporting-preview-filterByColumnDrawer-filterGroupContent-field-textTypeInput]'
            );

            // Validate immediately after changing the operator. Peculiar behavior with other operators other than in and exists
            if (!isAnInOperator || !isAnExistsOperator) {
              this.set('validateValue', true);
            }

            // If the operator is an exists operator, the input element should not exist
            if (isAnExistsOperator) {
              assert.dom(inputElement).doesNotExist();

              this.set('validateValue', false);

              continue;
            }

            // The input element should exist
            assert.dom(inputElement).exists();

            // Get the value
            const isFloat = field?.type === ENUMS.AI_REPORTING_FIELD_TYPE.FLOAT;
            const isInt = field?.type === ENUMS.AI_REPORTING_FIELD_TYPE.INTEGER;

            const value = isAnInOperator
              ? 'test1,test2'
              : isFloat
                ? '123.45'
                : isInt
                  ? '123'
                  : 'test';

            // An exists operator removes the input so when it is changed to another operator, the default value becomes null
            const previousOpIsExistsOp = EXISTS_OPERATORS.includes(
              validOperators[index - 1]
            );

            if (previousOpIsExistsOp) {
              await fillIn(inputElement, value);

              this.set('validateValue', true);
            } else {
              // Fill in the value
              await fillIn(inputElement, value);
            }

            // Check that the value is filled in
            assert.dom(inputElement).hasValue(value);
          }
        }
      }
    );
  }
);
