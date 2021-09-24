import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | asvs-details', function (hooks) {
  setupRenderingTest(hooks);

  test('it should render asvs code and title', async function (assert) {
    this.set('asvs', {
      code: '1.1',
      title: 'Test ASVS title',
    });
    await render(hbs`<AsvsDetails @asvs={{this.asvs}}/>`);

    assert.dom(`[data-test-asvs-code]`).hasText(this.asvs.code);
    assert.dom(`[data-test-asvs-title]`).hasText(this.asvs.title);
  });
});
