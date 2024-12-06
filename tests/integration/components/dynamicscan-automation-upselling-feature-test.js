import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupBrowserFakes } from 'ember-browser-services/test-support';

module('Integration | Component | file-chart-abc', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);
  setupBrowserFakes(hooks, { window: true, localStorage: true });

  hooks.beforeEach(async function () {
    const window = this.owner.lookup('service:browser/window');

    window.localStorage.clear();

    this.setProperties({
      window,
    });
  });

  test('it renders', async function (assert) {
    await render(hbs`<DynamicscanAutomationUpsellingFeature />`);

    assert.dom('[data-test-upselling-text]').exists();

    assert.dom('[data-test-upselling-upgrade-now-button]').exists();

    assert.dom('[data-test-upselling-upgrade-clicked-text]').doesNotExist();

    // Initially, the local storage should be empty
    assert.strictEqual(
      this.window.localStorage.getItem('automatedDastRequest'),
      null
    );
  });

  test('it stores the value in local storage', async function (assert) {
    this.server.post('/v2/feature_request/automated_dast', () => {
      return 200;
    });

    await render(hbs`<DynamicscanAutomationUpsellingFeature />`);

    await click('[data-test-upselling-upgrade-now-button]');

    assert.dom('[data-test-upselling-text]').doesNotExist();

    assert.dom('[data-test-upselling-upgrade-now-button]').doesNotExist();

    assert.strictEqual(
      this.window.localStorage.getItem('automatedDastRequest'),
      'true'
    );

    assert.dom('[data-test-upselling-upgrade-clicked-text]').exists();
  });
});
