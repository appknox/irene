import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { render, findAll } from '@ember/test-helpers';

const OPTIONS = ['Banana', 'Apple', 'Cherry', 'Mango'];

module(
  'Integration | Component | ak-select/multi-select-trigger',
  function (hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function () {
      this.setProperties({
        options: OPTIONS,
        selected: [],
        onChange: (next) => this.set('selected', next),
        extra: {
          filterLabel: 'Category',
          iconName: 'filter-list',
        },
      });
    });

    test('it renders the trigger with the filter label and default icon', async function (assert) {
      await render(hbs`
        <AkSelect
          @multiple={{true}}
          @options={{this.options}}
          @selected={{this.selected}}
          @onChange={{this.onChange}}
          @triggerComponent={{component 'ak-select/multi-select-trigger'}}
          @extra={{this.extra}}
          data-test-multi-select as |opt|
        >
          {{opt}}
        </AkSelect>
      `);

      assert
        .dom('[data-test-multi-select] .ember-power-select-multiple-options')
        .exists()
        .hasTextContaining('Category');

      assert
        .dom('[data-test-multi-select] [data-test-ak-icon]')
        .exists()
        .hasAttribute('icon', 'material-symbols:filter-list');
    });

    test('it renders a custom icon when `extra.iconName` is provided', async function (assert) {
      this.set('extra', { filterLabel: 'Status', iconName: 'tune' });

      await render(hbs`
        <AkSelect
          @multiple={{true}}
          @options={{this.options}}
          @selected={{this.selected}}
          @onChange={{this.onChange}}
          @triggerComponent={{component 'ak-select/multi-select-trigger'}}
          @extra={{this.extra}}
          data-test-multi-select as |opt|
        >
          {{opt}}
        </AkSelect>
      `);

      assert
        .dom('[data-test-multi-select] [data-test-ak-icon]')
        .hasAttribute('icon', 'material-symbols:tune');
    });

    test('it falls back to the filter-list icon when `extra.iconName` is missing or empty', async function (assert) {
      this.set('extra', { filterLabel: 'Category' });

      await render(hbs`
        <AkSelect
          @multiple={{true}}
          @options={{this.options}}
          @selected={{this.selected}}
          @onChange={{this.onChange}}
          @triggerComponent={{component 'ak-select/multi-select-trigger'}}
          @extra={{this.extra}}
          data-test-multi-select as |opt|
        >
          {{opt}}
        </AkSelect>
      `);

      assert
        .dom('[data-test-multi-select] [data-test-ak-icon]')
        .hasAttribute('icon', 'material-symbols:filter-list');
    });

    test('it hides the selection summary when nothing is selected', async function (assert) {
      await render(hbs`
        <AkSelect
          @multiple={{true}}
          @options={{this.options}}
          @selected={{this.selected}}
          @onChange={{this.onChange}}
          @triggerComponent={{component 'ak-select/multi-select-trigger'}}
          @extra={{this.extra}}
          data-test-multi-select as |opt|
        >
          {{opt}}
        </AkSelect>
      `);

      const triggerText =
        document
          .querySelector(
            '[data-test-multi-select] .ember-power-select-multiple-options'
          )
          ?.textContent?.trim() ?? '';

      assert.strictEqual(
        triggerText,
        'Category',
        'only the filter label is shown when nothing is selected'
      );

      assert.notOk(
        triggerText.includes('-'),
        'separator dash is hidden when there is no selection'
      );
    });

    test('it shows the label alone when exactly one item is selected', async function (assert) {
      this.set('selected', ['Banana']);

      await render(hbs`
        <AkSelect
          @multiple={{true}}
          @options={{this.options}}
          @selected={{this.selected}}
          @onChange={{this.onChange}}
          @triggerComponent={{component 'ak-select/multi-select-trigger'}}
          @extra={{this.extra}}
          data-test-multi-select as |opt|
        >
          {{opt}}
        </AkSelect>
      `);

      assert
        .dom('[data-test-multi-select] .ember-power-select-multiple-options')
        .hasTextContaining('Category')
        .hasTextContaining('Banana');
    });

    test('it summarises multiple selections as "<first> + N" sorted alphabetically', async function (assert) {
      this.set('selected', ['Banana', 'Apple', 'Cherry']);

      await render(hbs`
        <AkSelect
          @multiple={{true}}
          @options={{this.options}}
          @selected={{this.selected}}
          @onChange={{this.onChange}}
          @triggerComponent={{component 'ak-select/multi-select-trigger'}}
          @extra={{this.extra}}
          data-test-multi-select as |opt|
        >
          {{opt}}
        </AkSelect>
      `);

      assert
        .dom('[data-test-multi-select] .ember-power-select-multiple-options')
        .hasTextContaining('Apple + 2');
    });

    test('it ignores empty strings and non-string entries when summarising', async function (assert) {
      this.set('selected', ['', '   ', 'Banana', null, 42]);

      await render(hbs`
        <AkSelect
          @multiple={{true}}
          @options={{this.options}}
          @selected={{this.selected}}
          @onChange={{this.onChange}}
          @triggerComponent={{component 'ak-select/multi-select-trigger'}}
          @extra={{this.extra}}
          data-test-multi-select as |opt|
        >
          {{opt}}
        </AkSelect>
      `);

      const triggerText =
        document
          .querySelector(
            '[data-test-multi-select] .ember-power-select-multiple-options'
          )
          ?.textContent?.trim() ?? '';

      assert.ok(
        triggerText.includes('Banana'),
        'valid string selection is summarised'
      );

      assert.notOk(
        / \+ \d+/.test(triggerText),
        'empty / non-string entries do not contribute to the "+ N" suffix'
      );
    });

    test('it applies the medium label class when `extra.fontSize` is "medium"', async function (assert) {
      this.set('extra', {
        filterLabel: 'Category',
        iconName: 'filter-list',
        fontSize: 'medium',
      });

      await render(hbs`
        <AkSelect
          @multiple={{true}}
          @options={{this.options}}
          @selected={{this.selected}}
          @onChange={{this.onChange}}
          @triggerComponent={{component 'ak-select/multi-select-trigger'}}
          @extra={{this.extra}}
          data-test-multi-select as |opt|
        >
          {{opt}}
        </AkSelect>
      `);

      assert
        .dom(
          '[data-test-multi-select] .ember-power-select-multiple-options [data-test-ak-typography]'
        )
        .exists();

      const labels = findAll(
        '[data-test-multi-select] .ember-power-select-multiple-options [data-test-ak-typography]'
      );

      assert.ok(
        labels.some((el) => /trigger-label-medium/i.test(el.className)),
        'at least one label uses the medium size class'
      );
    });

    test('it defaults to the small label class when `extra.fontSize` is not set', async function (assert) {
      this.set('extra', { filterLabel: 'Category', iconName: 'filter-list' });

      await render(hbs`
        <AkSelect
          @multiple={{true}}
          @options={{this.options}}
          @selected={{this.selected}}
          @onChange={{this.onChange}}
          @triggerComponent={{component 'ak-select/multi-select-trigger'}}
          @extra={{this.extra}}
          data-test-multi-select as |opt|
        >
          {{opt}}
        </AkSelect>
      `);

      const labels = findAll(
        '[data-test-multi-select] .ember-power-select-multiple-options [data-test-ak-typography]'
      );

      assert.ok(
        labels.some((el) => /trigger-label-small/i.test(el.className)),
        'at least one label uses the small size class by default'
      );
    });
  }
);
