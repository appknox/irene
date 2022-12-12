import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-chip', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-chip', async function (assert) {
    this.setProperties({
      label: 'Chip',
    });

    await render(hbs`<AkChip @label={{this.label}} />`);

    assert.dom('[data-test-ak-chip]').exists().hasText(this.label);
  });

  test.each(
    'it renders ak-chip in different variants',
    ['', 'filled', 'semi-filled', 'outlined'],
    async function (assert, variant) {
      this.setProperties({
        label: 'Chip',
        variant,
      });

      await render(
        hbs`<AkChip @label={{this.label}} @variant={{this.variant}} />`
      );

      assert
        .dom('[data-test-ak-chip]')
        .exists()
        .hasText(this.label)
        .hasClass(RegExp(`ak-chip-variant-${variant || 'filled'}`));
    }
  );

  test.each(
    'it renders ak-chip in different colors',
    ['', 'default', 'primary', 'secondary', 'success', 'error', 'warn', 'info'],
    async function (assert, color) {
      this.setProperties({
        label: 'Chip',
        color,
      });

      await render(hbs`<AkChip @label={{this.label}} @color={{this.color}} />`);

      assert
        .dom('[data-test-ak-chip]')
        .exists()
        .hasText(this.label)
        .hasClass(RegExp(`ak-chip-color-${color || 'default'}`));
    }
  );

  test.each(
    'it renders ak-chip in different sizes',
    ['', 'medium', 'small'],
    async function (assert, size) {
      this.setProperties({
        label: 'Chip',
        size,
      });

      await render(hbs`<AkChip @label={{this.label}} @size={{this.size}} />`);

      assert
        .dom('[data-test-ak-chip]')
        .exists()
        .hasText(this.label)
        .hasClass(RegExp(`ak-chip-size-${size || 'medium'}`));
    }
  );

  test('it renders ak-chip with button true', async function (assert) {
    this.setProperties({
      label: 'Chip',
    });

    await render(hbs`<AkChip @label={{this.label}} @button={{this.button}} />`);

    assert
      .dom('[data-test-ak-chip]')
      .exists()
      .hasText(this.label)
      .doesNotHaveClass(/ak-chip-button/);

    this.set('button', true);

    assert
      .dom('[data-test-ak-chip]')
      .exists()
      .hasClass(/ak-chip-button/);
  });

  test('test ak-chip click and onDelete', async function (assert) {
    this.setProperties({
      label: 'Chip',
      deleteEvent: null,
      clickEvent: null,
      handleDelete: (event) => {
        this.set('deleteEvent', event);
      },
      handleClick: (event) => {
        this.set('clickEvent', event);
      },
    });

    await render(
      hbs`<AkChip @label={{this.label}} @onDelete={{this.handleDelete}} {{on 'click' this.handleClick}} />`
    );

    assert.dom('[data-test-ak-chip]').exists().hasText(this.label);

    assert.notOk(this.clickEvent);
    assert.notOk(this.deleteEvent);

    await click('[data-test-ak-chip]');

    assert.ok(this.clickEvent);

    this.set('clickEvent', null);

    await click('[data-test-chip-delete-btn]');

    assert.notOk(this.clickEvent);
    assert.ok(this.deleteEvent);
  });
});
