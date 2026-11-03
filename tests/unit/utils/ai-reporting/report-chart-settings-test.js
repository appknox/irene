import { module, test } from 'qunit';

import {
  defaultChartSettings,
  formatChartNumber,
  seriesSettings,
  trendValues,
  withSeries,
  withSetting,
} from 'irene/utils/ai-reporting/report-chart-settings';

const NUMBER = defaultChartSettings().number;

module('Unit | Utility | ai-reporting/report-chart-settings', function () {
  module('formatChartNumber', function () {
    test('by default shows up to two decimals with separators', function (assert) {
      assert.strictEqual(
        formatChartNumber(1234.567, NUMBER),
        (1234.57).toLocaleString()
      );
      assert.strictEqual(formatChartNumber(8, NUMBER), '8');
    });

    test('applies decimals, separators, compact, prefix, suffix and multiply', function (assert) {
      assert.strictEqual(
        formatChartNumber(1234, { ...NUMBER, separators: false }),
        '1234'
      );

      assert.strictEqual(
        formatChartNumber(2, { ...NUMBER, decimals: 2 }),
        (2).toLocaleString(undefined, { minimumFractionDigits: 2 })
      );

      assert.strictEqual(
        formatChartNumber(0.25, { ...NUMBER, multiplyBy: 100, suffix: '%' }),
        '25%'
      );

      assert.strictEqual(
        formatChartNumber(5, { ...NUMBER, prefix: '$' }),
        '$5'
      );

      assert.strictEqual(
        formatChartNumber(1500, { ...NUMBER, compact: true }),
        new Intl.NumberFormat(undefined, {
          notation: 'compact',
          maximumFractionDigits: 2,
        }).format(1500),
        'compact shortens large numbers (1.5K)'
      );
    });

    test('empty values read as a dash and text passes through', function (assert) {
      assert.strictEqual(formatChartNumber(null, NUMBER), '—');
      assert.strictEqual(formatChartNumber('', NUMBER), '—');
      assert.strictEqual(formatChartNumber('2026-07-01', NUMBER), '2026-07-01');
      assert.strictEqual(formatChartNumber('7', NUMBER), '7');
    });
  });

  module('trendValues', function () {
    test('fits a straight line through the values', function (assert) {
      assert.deepEqual(trendValues([1, 2, 3]), [1, 2, 3]);
      assert.deepEqual(trendValues([2, 4, 3, 5]), [2.3, 3.1, 3.9, 4.7]);
    });

    test('one value or none has no trend to fit', function (assert) {
      assert.deepEqual(trendValues([5]), [5]);
      assert.deepEqual(trendValues([]), []);
    });
  });

  module('updates', function () {
    test('withSetting changes one field of a section and keeps the rest', function (assert) {
      const settings = defaultChartSettings();
      const next = withSetting(settings, 'yAxis', { log: true });

      assert.true(next.yAxis.log);
      assert.true(next.yAxis.show, 'other fields are kept');
      assert.false(settings.yAxis.log, 'the old settings are not changed');
      assert.strictEqual(withSetting(settings, 'legend', 'off').legend, 'off');
    });

    test('withSeries merges into one series only', function (assert) {
      const named = withSeries(defaultChartSettings(), 'High', {
        name: 'High risk',
      });
      const colored = withSeries(named, 'High', { color: '#EF8C8C' });

      assert.deepEqual(seriesSettings(colored, 'High'), {
        name: 'High risk',
        color: '#EF8C8C',
      });
      assert.deepEqual(seriesSettings(colored, 'Low'), {});
    });

    test('a data value like "constructor" never reads an inherited property', function (assert) {
      const settings = defaultChartSettings();

      assert.deepEqual(seriesSettings(settings, 'constructor'), {});
      assert.deepEqual(seriesSettings(settings, '__proto__'), {});

      const named = withSeries(settings, '__proto__', { name: 'Odd app' });

      assert.strictEqual(seriesSettings(named, '__proto__').name, 'Odd app');
      assert.strictEqual(
        Object.getPrototypeOf(named.series),
        Object.prototype,
        'the record keeps its normal prototype'
      );
    });

    test('the page can pass the chart words in its own language', function (assert) {
      const settings = defaultChartSettings({ other: 'その他' });

      assert.strictEqual(settings.text.other, 'その他');
      assert.strictEqual(settings.text.trend, 'trend');
    });
  });
});
