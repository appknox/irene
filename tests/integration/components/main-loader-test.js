/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | main-loader', function (hooks) {
  setupRenderingTest(hooks);

  test('loading renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<MainLoader />`);

    assert.dom('[data-test-main-loader-container]').exists();
    assert.dom('[data-test-main-loader-linear-progress]').exists();
  });
});
