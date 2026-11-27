import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module(
  'Integration | Component | ai-reporting/preview/column-value',
  function (hooks) {
    setupRenderingTest(hooks);

    const cases = [
      { value: 0, shown: '0', label: 'a zero count' },
      { value: false, shown: 'false', label: 'false' },
      { value: 12, shown: '12', label: 'a number' },
      { value: null, shown: '', label: 'a missing value' },
    ];

    cases.forEach(({ value, shown, label }) => {
      test(`it shows ${label} as "${shown}"`, async function (assert) {
        this.setProperties({
          column: { name: 'Trackers', val_field: 'trackers', field_type: 'integer' },
          row: { trackers: value },
        });

        await render(
          hbs`<AiReporting::Preview::ColumnValue @column={{this.column}} @value={{this.row}} />`
        );

        assert
          .dom('[data-test-aiReporting-preview-column-value="Trackers"]')
          .hasText(shown);
      });
    });
  }
);
