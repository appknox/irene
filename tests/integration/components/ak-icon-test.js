import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-icon', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-icon', async function (assert) {
    this.setProperties({
      iconName: 'delete',
    });

    await render(hbs`<AkIcon @iconName={{this.iconName}} />`);

    assert.dom('[data-test-ak-icon]').exists();
  });

  test.each(
    'it renders ak-icon with different colors',
    [
      ['', /ak-icon-color-inherit/i],
      ['textPrimary', /ak-icon-color-textPrimary/i],
      ['textSecondary', /ak-icon-color-textSecondary/i],
      ['primary', /ak-icon-color-primary/i],
      ['secondary', /ak-icon-color-secondary/i],
      ['success', /ak-icon-color-success/i],
      ['error', /ak-icon-color-error/i],
      ['warn', /ak-icon-color-warn/i],
      ['info', /ak-icon-color-info/i],
      ['inherit', /ak-icon-color-inherit/i],
    ],
    async function (assert, [color, expectedClassName]) {
      this.setProperties({
        iconName: 'delete',
        color,
      });

      await render(
        hbs`<AkIcon @iconName={{this.iconName}} @color={{this.color}} />`
      );

      assert.dom('[data-test-ak-icon]').exists().hasClass(expectedClassName);
    }
  );

  test('it renders ak-icon with different sizes', async function (assert) {
    this.setProperties({
      iconName: 'delete',
      size: '',
    });

    await render(
      hbs`<AkIcon @size={{this.size}} @iconName={{this.iconName}} />`
    );

    assert
      .dom('[data-test-ak-icon]')
      .exists()
      .hasClass(/ak-icon-size-medium/i);

    this.set('size', 'small');

    assert.dom('[data-test-ak-icon]').hasClass(/ak-icon-size-small/i);

    this.set('size', 'medium');

    assert.dom('[data-test-ak-icon]').hasClass(/ak-icon-size-medium/i);
  });
});
