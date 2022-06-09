import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import Service from '@ember/service';
import JSONAPIAdapter from '@ember-data/adapter/json-api';

class SettingsAdapterStub extends JSONAPIAdapter {
  createRecord() {
    return { id: 1, enabled: true };
  }

  updateRecord() {
    return { id: 1, enabled: false };
  }
}

class OrganizationStub extends Service {
  selected = {
    id: 1,
  };
}

class OrganizationMeStub extends Service {
  org = {
    is_owner: true,
    is_admin: true,
  };
}

module('Integration | Component | production-scan-settings', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:organization', OrganizationStub);
    this.owner.register('service:me', OrganizationMeStub);
  });

  test('it renders with production scan enabled', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: true,
    });

    await render(hbs`<ProductionScan::Settings @settings={{this.settings}} />`);

    assert.dom('h6').hasText('Production Scan Setting');
    assert.dom(`[data-test-toggle-input]`).exists();
    assert.ok(this.element.querySelector(`[data-test-toggle-input]`).checked);
  });

  test('it renders with production scan not enabled', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: false,
    });

    await render(hbs`<ProductionScan::Settings @settings={{this.settings}} />`);

    assert.dom('h6').hasText('Production Scan Setting');
    assert.dom(`[data-test-toggle-input]`).exists();

    assert.notOk(
      this.element.querySelector(`[data-test-toggle-input]`).checked
    );
  });

  test('it renders with production scan toggle switch disabled', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: true,
    });

    const me = this.owner.lookup('service:me');
    me.org.is_owner = false;

    await render(hbs`<ProductionScan::Settings @settings={{this.settings}} />`);

    assert.dom(`[data-test-toggle-input]`).exists();
    assert.dom(`[data-test-toggle-input]`).hasAttribute('disabled');
  });

  test('should toggle production scan enabled', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: true,
    });

    this.owner.register('adapter:production-scan/setting', SettingsAdapterStub);

    const store = this.owner.lookup('service:store');

    const settings = store.createRecord(
      'production-scan/setting',
      this.settings
    );
    settings.save();

    await render(hbs`<ProductionScan::Settings @settings={{this.settings}} />`);

    assert.dom(`[data-test-toggle-input]`).exists();
    assert.ok(this.element.querySelector(`[data-test-toggle-input]`).checked);

    await click('[data-test-toggle-input]');

    assert.notOk(
      this.element.querySelector(`[data-test-toggle-input]`).checked
    );
    assert.notOk(settings.enabled);
  });
});
