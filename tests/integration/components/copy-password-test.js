import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | copy-password', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders label and password value', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('pdfPassword', 'dYJaLeARhX8E4XiC');
    await render(hbs`<CopyPassword  @pdfPassword={{this.pdfPassword}}/>`);
    assert
      .dom(`[data-test-copy-password="label"]`)
      .hasText(`t:reportPassword:()`);

    assert.dom(`[data-test-copy-password="value"]`).hasText(this.pdfPassword);

    assert.dom(`[data-test-copy-password="copy"]`).hasText(`t:copy:()`);

    assert
      .dom(`[data-test-copy-password="clipboard-target"]`)
      .hasAttribute('data-clipboard-target', '#copy-password');
  });
});
