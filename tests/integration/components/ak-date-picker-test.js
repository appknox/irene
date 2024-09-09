import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { calendarSelect } from 'ember-power-calendar/test-support/helpers';
import dayjs from 'dayjs';

import {
  SINGLE_QUICK_SELECT_OPTIONS,
  RANGE_QUICK_SELECT_OPTIONS,
  MULTIPLE_QUICK_SELECT_OPTIONS,
} from 'irene/utils/ak-date-picker-options';

const defaultQuickSelects = {
  single: ['clear'],
  multiple: ['clear', 'today'],
  range: ['clear', 'last7Days', 'last30Days', 'last3Months', 'last6Months'],
};

const customOptions = [
  {
    label: 'Last 3 days',
    value: ((start, end) => ({
      date: { start: start.toDate(), end: end.toDate() },
      dayjs: {
        start,
        end,
      },
    }))(
      dayjs().startOf('day').subtract(3, 'days').add(1, 'day'),
      dayjs().startOf('day')
    ),
  },
];

module('Integration | Component | ak-date-picker', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders and opens popover on trigger click', async function (assert) {
    await render(hbs`
      <AkDatePicker>
        <button type='button' data-test-akDatePicker-trigger>
          open date picker
        </button>
      </AkDatePicker>
    `);

    // Check if the trigger element is rendered
    assert
      .dom('[data-test-akDatePicker-trigger]')
      .exists('Trigger element exists')
      .isNotDisabled()
      .hasText('open date picker');

    // Check if the popover is initially closed
    assert
      .dom('[data-test-akDatePicker-popover]')
      .doesNotExist('Popover is closed initially');

    // Click the trigger to open the popover
    await click('[data-test-akDatePicker-trigger]');

    // Check if the popover is now open
    assert
      .dom('[data-test-akDatePicker-popover]')
      .exists('Popover is open after clicking trigger');

    // Click the backdrop to close the popover
    await click('[data-test-ak-popover-backdrop]');

    // Check if the popover is closed
    assert
      .dom('[data-test-akDatePicker-popover]')
      .doesNotExist('Popover is closed after clicking backdrop');
  });

  test.each(
    'it selects date in the date picker',
    [{}, { range: true }, { multiple: true }],
    async function (assert, { range, multiple }) {
      assert.expect(range ? 9 : multiple ? 15 : 4);

      // Set up the initial selected value
      this.setProperties({
        range,
        multiple,
        selected: null,
        onSelect: (value, calendar, event) => {
          assert.ok(calendar);
          assert.ok(event);

          if (range) {
            assert.ok(value.dayjs.start);

            // on first select this will be null
            if (value.dayjs.end) {
              assert.ok(value.dayjs.end);
            }
          } else if (multiple) {
            assert.ok(value.dayjs);
            assert.ok(Array.isArray(value.dayjs));
          } else {
            assert.ok(value.dayjs);
          }

          this.set('selected', value.date);
        },
      });

      // Render the component
      await render(hbs`
        <AkDatePicker
          @range={{this.range}}
          @multiple={{this.multiple}}
          @selected={{this.selected}}
          @onSelect={{this.onSelect}}
        >
          <button type='button' data-test-akDatePicker-trigger>
            open date picker
          </button>
        </AkDatePicker>
      `);

      // Click the trigger to open the popover
      await click('[data-test-akDatePicker-trigger]');

      const assertEqual = (actual, expected, message) =>
        assert.strictEqual(
          dayjs(actual).format('DD/MM/YYYY'),
          dayjs(expected).format('DD/MM/YYYY'),
          message
        );

      // Check if the selected date is stored as expected
      if (range) {
        const startDate = dayjs().subtract(10, 'days').toDate();
        const endDate = dayjs().toDate();

        // to select a date range
        await calendarSelect('[data-test-akDatePicker-calendar]', startDate);
        await calendarSelect('[data-test-akDatePicker-calendar]', endDate);

        assertEqual(
          this.selected.start,
          startDate,
          'Selected start date is set as expected'
        );

        assertEqual(
          this.selected.end,
          endDate,
          'Selected end date is set as expected'
        );
      } else if (multiple) {
        const dates = [
          dayjs().subtract(10, 'days').toDate(),
          dayjs().toDate(),
          dayjs().subtract(2, 'days').toDate(),
        ];

        // to select multiple date
        await calendarSelect('[data-test-akDatePicker-calendar]', dates[0]);
        await calendarSelect('[data-test-akDatePicker-calendar]', dates[1]);
        await calendarSelect('[data-test-akDatePicker-calendar]', dates[2]);

        this.selected.forEach((date, i) => {
          assertEqual(
            date,
            dates[i],
            `'Selected dates[${i}] is set as expected'`
          );
        });
      } else {
        const date = new Date();

        // to select a date
        await calendarSelect('[data-test-akDatePicker-calendar]', date);

        assertEqual(this.selected, date, 'Selected date is set as expected');
      }
    }
  );

  test.each(
    'it selects date from default quick select options',
    [
      {
        options: defaultQuickSelects.single.map(
          (it) => SINGLE_QUICK_SELECT_OPTIONS[it]
        ),
      },
      {
        range: true,
        options: defaultQuickSelects.range.map(
          (it) => RANGE_QUICK_SELECT_OPTIONS[it]
        ),
      },
      {
        multiple: true,
        options: defaultQuickSelects.multiple.map(
          (it) => MULTIPLE_QUICK_SELECT_OPTIONS[it]
        ),
      },
    ],
    async function (assert, { range, multiple, options }) {
      assert.expect(range ? 32 : multiple ? 11 : 7);

      // Set up the initial selected value
      this.setProperties({
        range,
        multiple,
        selected: null,
        onSelect: (value, calendar, event) => {
          assert.ok(calendar);
          assert.ok(event);

          this.set('selected', value?.date ?? null);
        },
      });

      // Render the component
      await render(hbs`
        <AkDatePicker
          @range={{this.range}}
          @multiple={{this.multiple}}
          @selected={{this.selected}}
          @onSelect={{this.onSelect}}
          @closeOnSelect={{false}}
        >
          <button type='button' data-test-akDatePicker-trigger>
            open date picker
          </button>
        </AkDatePicker>
      `);

      // Click the trigger to open the popover
      await click('[data-test-akDatePicker-trigger]');

      assert
        .dom('[data-test-akDatePicker-quickSelectTitle]')
        .hasText('Quick Selection');

      const quickSelectBtns = findAll(
        '[data-test-akDatePicker-quickSelectBtn]'
      );

      assert.strictEqual(quickSelectBtns.length, options.length);

      for (const opt of options) {
        assert
          .dom(`[data-test-akDatePicker-quickSelectBtn="${opt.label}"]`)
          .isNotDisabled()
          .hasText(opt.label);

        await click(`[data-test-akDatePicker-quickSelectBtn="${opt.label}"]`);

        if (range) {
          assert.strictEqual(opt.value.date.start, this.selected.start);
          assert.strictEqual(opt.value.date.end, this.selected.end);
        } else if (multiple) {
          this.selected.forEach((date, i) => {
            assert.strictEqual(opt.value.date[i], date);
          });
        } else {
          assert.strictEqual(opt.value, this.selected?.date ?? null);
        }
      }
    }
  );

  test.each(
    'test ak-date-picker quick select options',
    [
      {
        hideQuickSelectOptions: true,
      },
      {
        quickSelectOptions: ['lastYear', 'thisWeek', 'thisMonth'],
      },
      {
        quickSelectOptions: [
          { key: 'lastYear', label: 'Last Year Custom' },
          { key: 'thisWeek', label: 'Current Week' },
          'thisMonth',
        ],
      },
      {
        quickSelectOptions: ['last7Days', 'last3Months'],
        customQuickSelectOptions: customOptions,
      },
      {
        quickSelectOptions: [],
        customQuickSelectOptions: customOptions,
      },
    ],
    async function (
      assert,
      { hideQuickSelectOptions, quickSelectOptions, customQuickSelectOptions }
    ) {
      // Set up the initial selected value
      this.setProperties({
        hideQuickSelectOptions,
        quickSelectOptions,
        customQuickSelectOptions,
        range: true,
        selected: null,
        onSelect: (value) => {
          this.set('selected', value?.date ?? null);
        },
      });

      // Render the component
      await render(hbs`
        <AkDatePicker
          @hideQuickSelectOptions={{this.hideQuickSelectOptions}}
          @quickSelectTitle='Quick Selection Custom'
          @quickSelectOptions={{this.quickSelectOptions}}
          @customQuickSelectOptions={{this.customQuickSelectOptions}}
          @closeOnSelect={{false}}
          @range={{this.range}}
          @selected={{this.selected}}
          @onSelect={{this.onSelect}}
        >
          <button type='button' data-test-akDatePicker-trigger>
            open date picker
          </button>
        </AkDatePicker>
      `);

      // Click the trigger to open the popover
      await click('[data-test-akDatePicker-trigger]');

      if (hideQuickSelectOptions) {
        assert.dom('[data-test-akDatePicker-quickSelectTitle]').doesNotExist();
        assert.dom('[data-test-akDatePicker-quickSelectBtn]').doesNotExist();
      } else {
        const options = quickSelectOptions.map((it) => {
          if (typeof it === 'string') {
            return RANGE_QUICK_SELECT_OPTIONS[it];
          } else {
            return {
              ...RANGE_QUICK_SELECT_OPTIONS[it.key],
              label: it.label,
            };
          }
        });

        options.push(...(customQuickSelectOptions || []));

        assert
          .dom('[data-test-akDatePicker-quickSelectTitle]')
          .hasText('Quick Selection Custom');

        const quickSelectBtns = findAll(
          '[data-test-akDatePicker-quickSelectBtn]'
        );

        assert.strictEqual(quickSelectBtns.length, options.length);

        for (const opt of options) {
          assert
            .dom(`[data-test-akDatePicker-quickSelectBtn="${opt.label}"]`)
            .isNotDisabled()
            .hasText(opt.label);

          await click(`[data-test-akDatePicker-quickSelectBtn="${opt.label}"]`);

          assert.strictEqual(opt.value.date.start, this.selected.start);
          assert.strictEqual(opt.value.date.end, this.selected.end);
        }
      }
    }
  );
});
