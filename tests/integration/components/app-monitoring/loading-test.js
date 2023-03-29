import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | app-monitoring/loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the correct loading content and message', async function (assert) {
    this.setProperties({
      loadingText: 'Loading Text',
    });

    await render(
      hbs`<AppMonitoring::Loading @loadingText={{this.loadingText}}  />`
    );

    assert
      .dom('[data-test-am-loading-container]')
      .containsText(this.loadingText);
    assert.dom('[data-test-am-loading-illustration]').exists();
    assert.dom('[data-test-am-loading-spinner]').exists();
  });
});
