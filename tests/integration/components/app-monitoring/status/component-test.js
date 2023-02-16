import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Integration | Component | app-monitoring/status', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it should render error', async function (assert) {
    await render(
      hbs`<AppMonitoring::Status @condition='error' @label="Test"  />`
    );

    assert.dom(`[data-test-am-status=error]`).exists();
    assert.dom(`[data-test-am-status=error]`).containsText('Test');
  });

  test('it should render warn', async function (assert) {
    await render(
      hbs`<AppMonitoring::Status @condition='warn' @label="Test" />`
    );

    assert.dom(`[data-test-am-status=warn]`).exists();
    assert.dom(`[data-test-am-status=warn]`).containsText('Test');
  });

  test('it should render success', async function (assert) {
    await render(
      hbs`<AppMonitoring::Status @condition='success' @label="Test" />`
    );

    assert.dom(`[data-test-am-status=success]`).exists();
    assert.dom(`[data-test-am-status=success]`).containsText('Test');
  });

  test('it should render yielded string', async function (assert) {
    await render(
      hbs`<AppMonitoring::Status @condition='error' @label="TestRandom" />`
    );

    assert.dom(`[data-test-am-status=error]`).exists();
    assert.dom(`[data-test-am-status=error]`).containsText('TestRandom');
  });
});
