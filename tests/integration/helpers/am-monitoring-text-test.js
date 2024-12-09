import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';

module('Integration | Helper | am-monitoring-text', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it renders the correct "success" text when monitoring is active ', async function (assert) {
    this.amApp = this.store.createRecord('am-app', {
      id: 1,
      isActive: true,
    });

    await render(hbs`{{am-monitoring-text this.amApp}}`);

    assert.strictEqual(this.element.textContent.trim(), t('activeCapital'));
  });

  test('it renders the correct "error" text when monitoring is inactive ', async function (assert) {
    this.amApp = this.store.createRecord('am-app', {
      id: 1,
      isActive: false,
    });

    await render(hbs`{{am-monitoring-text this.amApp}}`);

    assert.strictEqual(this.element.textContent.trim(), t('inactiveCapital'));
  });
});
