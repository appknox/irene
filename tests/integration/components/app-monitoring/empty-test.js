import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | app-monitoring/empty', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the correct error header and body messages', async function (assert) {
    this.setProperties({
      errorHeaderText: 'Error Header Text',
      errorBodyText: 'Error Body Text',
    });

    await render(
      hbs`<AppMonitoring::Empty @header={{this.errorHeaderText}} @body={{this.errorBodyText}} />`
    );

    assert.dom('[data-test-am-error-container]').exists();
    assert.dom('[data-test-am-error-illustration]').exists();
    assert
      .dom('[data-test-am-error-container]')
      .containsText(this.errorHeaderText)
      .containsText(this.errorBodyText);
  });
});
