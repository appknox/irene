import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const columns = [
  { name: 'A', valuePath: 'A' },
  { name: 'B', valuePath: 'B' },
];

const rows = [
  { A: 'A1', B: 'B1' },
  { A: 'A2', B: 'B2' },
];

module('Integration | Component | ak-table', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-table', async function (assert) {
    this.setProperties({ columns, rows });

    await render(hbs`
        <AkTable as |t|>
          <t.head data-test-thead @columns={{this.columns}} />
          <t.body data-test-tbody @rows={{this.rows}} />
        </AkTable>
    `);

    assert.dom('[data-test-ak-table]').exists();

    const thead = find('[data-test-thead]');

    // checking just first column
    assert.dom('th', thead).exists().hasText('A');

    const tbody = find('[data-test-tbody]');

    assert.dom('td', tbody).exists().hasText('A1');
  });

  test.each(
    'it renders ak-table with different variants',
    [
      ['', /ak-table-variant-semi-bordered/i],
      ['semi-bordered', /ak-table-variant-semi-bordered/i],
      ['full-bordered', /ak-table-variant-full-bordered/i],
    ],
    async function (assert, [variant, className]) {
      this.set('variant', variant);

      await render(hbs`
        <AkTable @variant={{this.variant}} as |t|>
          <t.head data-test-thead @columns={{this.columns}} />
          <t.body data-test-tbody @rows={{this.rows}} />
        </AkTable>
    `);

      assert.dom('[data-test-ak-table]').exists().hasClass(className);
    }
  );

  test.each(
    'it renders ak-table with different border color',
    [
      ['', /ak-table-border-color-light/i],
      ['light', /ak-table-border-color-light/i],
      ['dark', /ak-table-border-color-dark/i],
    ],
    async function (assert, [color, className]) {
      this.set('borderColor', color);

      await render(hbs`
        <AkTable @borderColor={{this.borderColor}} as |t|>
          <t.head data-test-thead @columns={{this.columns}} />
          <t.body data-test-tbody @rows={{this.rows}} />
        </AkTable>
    `);

      assert.dom('[data-test-ak-table]').exists().hasClass(className);
    }
  );

  test.each(
    'it renders ak-table with different table spacing',
    [
      ['', /ak-table-padding-default/i],
      [false, /ak-table-padding-default/i],
      [true, /ak-table-padding-dense/i],
    ],
    async function (assert, [dense, className]) {
      this.set('dense', dense);

      await render(hbs`
        <AkTable @dense={{this.dense}} as |t|>
          <t.head data-test-thead @columns={{this.columns}} />
          <t.body data-test-tbody @rows={{this.rows}} />
        </AkTable>
    `);

      assert.dom('[data-test-ak-table]').exists().hasClass(className);
    }
  );

  test('it renders ak-table with hoverable row', async function (assert) {
    this.set('hoverable', false);

    await render(hbs`
        <AkTable @hoverable={{this.hoverable}} as |t|>
          <t.head data-test-thead @columns={{this.columns}} />
          <t.body data-test-tbody @rows={{this.rows}} />
        </AkTable>
    `);

    assert
      .dom('[data-test-ak-table]')
      .exists()
      .doesNotHaveClass(/ak-table-hoverable/i);

    this.set('hoverable', true);

    assert.dom('[data-test-ak-table]').hasClass(/ak-table-hoverable/i);
  });
});
