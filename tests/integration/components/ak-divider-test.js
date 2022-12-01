import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ak-divider', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders ak-divider', async function (assert) {
    await render(hbs`<AkDivider />`);

    assert.dom('[data-test-ak-divider]').exists().hasTagName('hr');
  });

  test('it renders ak-divider different variants', async function (assert) {
    await render(hbs`<AkDivider @variant={{this.variant}} />`);

    assert
      .dom('[data-test-ak-divider]')
      .exists()
      .hasClass(/ak-divider-variant-fullWidth/i);

    this.set('variant', 'fullWidth');

    assert
      .dom('[data-test-ak-divider]')
      .hasClass(/ak-divider-variant-fullWidth/i);

    this.set('variant', 'middle');

    assert.dom('[data-test-ak-divider]').hasClass(/ak-divider-variant-middle/i);
  });

  test('it renders ak-divider different color', async function (assert) {
    await render(hbs`<AkDivider @color={{this.color}} />`);

    assert
      .dom('[data-test-ak-divider]')
      .exists()
      .hasClass(/ak-divider-color-light/i);

    this.set('color', 'light');

    assert.dom('[data-test-ak-divider]').hasClass(/ak-divider-color-light/i);

    this.set('color', 'dark');

    assert.dom('[data-test-ak-divider]').hasClass(/ak-divider-color-dark/i);
  });

  test('it renders ak-divider different tags', async function (assert) {
    await render(hbs`<AkDivider @tag={{this.tag}} />`);

    assert.dom('[data-test-ak-divider]').exists().hasTagName('hr');

    this.set('tag', 'span');

    assert.dom('[data-test-ak-divider]').hasTagName('span');

    this.set('tag', 'li');

    assert.dom('[data-test-ak-divider]').hasTagName('li');
  });
});
