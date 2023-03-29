import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | am-monitoring-condition', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it renders "success" condition when monitoring is active ', async function (assert) {
    this.amApp = this.store.createRecord('am-app', {
      id: 1,
      isActive: true,
    });

    await render(hbs`{{am-monitoring-condition this.amApp}}`);

    assert.strictEqual(this.element.textContent.trim(), 'success');
  });

  test('it renders "error" condition when monitoring is inactive ', async function (assert) {
    this.amApp = this.store.createRecord('am-app', {
      id: 1,
      isActive: false,
    });

    await render(hbs`{{am-monitoring-condition this.amApp}}`);

    assert.strictEqual(this.element.textContent.trim(), 'error');
  });
});
