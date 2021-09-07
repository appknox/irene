import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | gdpr-details', function (hooks) {
  setupRenderingTest(hooks);

  test('it should render gdpr code and title', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('gdpr', {
      code: 'Art-25-GDPR',
      title: 'Data protection by design and by default',
    });

    await render(hbs`<GdprDetails @gdpr={{this.gdpr}}/>`);

    assert.dom(`[data-test-gdpr-code]`).hasText(this.gdpr.code);
    assert.dom(`[data-test-gdpr-title]`).hasText(this.gdpr.title);
  });
});
