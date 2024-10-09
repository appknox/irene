import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import Service from '@ember/service';

class OrganizationStub extends Service {
  selected = {
    id: 1,
    projectsCount: 1,
  };

  get selectedOrgProjectsCount() {
    return this.selected.projectsCount;
  }
}

module('Integration | Component | app-monitoring-settings', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:organization', OrganizationStub);

    const store = this.owner.lookup('service:store');
    const organizationMe = store.createRecord('organization-me', {
      id: 1,
      is_owner: true,
      is_admin: true,
    });
    class OrganizationMeStub extends Service {
      org = organizationMe;
    }

    this.owner.register('service:me', OrganizationMeStub);
  });

  test('it renders with app monitoring enabled', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: true,
    });

    await render(hbs`<AppMonitoring::Settings @settings={{this.settings}} />`);

    assert
      .dom(`[data-test-app-monitoring-settings-heading]`)
      .hasText(t('appMonitoringHeading'));
    assert
      .dom(`[data-test-app-monitoring-settings-description]`)
      .hasText(t('appMonitoringDescription'));
    assert.dom(`[data-test-toggle-input]`).exists();
    assert.ok(this.element.querySelector(`[data-test-toggle-input]`).checked);
  });

  test('it renders with app monitoring not enabled', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: false,
    });

    await render(hbs`<AppMonitoring::Settings @settings={{this.settings}} />`);
    assert
      .dom(`[data-test-app-monitoring-settings-heading]`)
      .hasText(t('appMonitoringHeading'));
    assert
      .dom(`[data-test-app-monitoring-settings-description]`)
      .hasText(t('appMonitoringDescription'));
    assert.dom(`[data-test-toggle-input]`).exists();

    assert.notOk(
      this.element.querySelector(`[data-test-toggle-input]`).checked
    );
  });

  test('it renders with app monitoring toggle switch disabled', async function (assert) {
    this.set('settings', {
      id: 1,
      enabled: true,
    });

    const me = this.owner.lookup('service:me');
    me.org.is_admin = false;

    await render(hbs`<AppMonitoring::Settings @settings={{this.settings}} />`);

    assert.dom(`[data-test-toggle-input]`).exists();
    assert.dom(`[data-test-toggle-input]`).hasAttribute('disabled');
    assert.ok(this.element.querySelector(`[data-test-toggle-input]`).checked);
  });

  test('should toggle app monitoring enabled', async function (assert) {
    this.server.put('/v2/am_configurations/:id', (schema, req) => ({
      id: 1,
      enabled: false,
      organization: req.params.id,
    }));

    this.set('settings', {
      id: 1,
      enabled: true,
    });

    this.server.get('/v2/am_apps', () => {
      return [];
    });

    const store = this.owner.lookup('service:store');

    const normailizedSettings = store.normalize(
      'amconfiguration',
      this.settings
    );

    this.set('amConfigModel', store.push(normailizedSettings));

    await render(
      hbs`<AppMonitoring::Settings @settings={{this.amConfigModel}} />`
    );

    assert.dom(`[data-test-toggle-input]`).exists();
    assert.ok(this.element.querySelector(`[data-test-toggle-input]`).checked);

    await click('[data-test-toggle-input]');

    assert.notOk(
      this.element.querySelector(`[data-test-toggle-input]`).checked
    );
    assert.notOk(this.amConfigModel.enabled);
  });

  test('it should reload app monitoring data when settings is toggled', async function (assert) {
    assert.expect(3);

    this.server.put('/v2/am_configurations/:id', (schema, req) => ({
      id: 1,
      enabled: false,
      organization: req.params.id,
    }));

    this.set('settings', {
      id: 1,
      enabled: true,
    });

    this.server.get('/v2/am_apps', () => {
      return [];
    });

    const store = this.owner.lookup('service:store');

    class AppMonitoringStub extends Service {
      offset = 10;
      limit = 10;

      reload() {
        assert.ok(true, 'Monitoring data reload function was triggered.');

        return [];
      }
    }

    this.owner.register('service:appmonitoring', AppMonitoringStub);

    const normailizedSettings = store.normalize(
      'amconfiguration',
      this.settings
    );

    this.set('amConfigModel', store.push(normailizedSettings));

    await render(
      hbs`<AppMonitoring::Settings @settings={{this.amConfigModel}} />`
    );

    assert.dom(`[data-test-toggle-input]`).exists();
    assert.ok(this.element.querySelector(`[data-test-toggle-input]`).checked);

    await click('[data-test-toggle-input]');
  });

  test('toggling should be disabled if org project count is less than 1', async function (assert) {
    class OrganizationStub extends Service {
      selected = {
        id: 1,
        projectsCount: 0,
      };
    }
    this.owner.register('service:organization', OrganizationStub);

    this.server.put('/v2/am_configurations/:id', (schema, req) => ({
      id: 1,
      enabled: false,
      organization: req.params.id,
    }));

    this.set('settings', {
      id: 1,
      enabled: false,
    });

    const store = this.owner.lookup('service:store');
    const normailizedSettings = store.normalize(
      'amconfiguration',
      this.settings
    );

    this.set('amConfigModel', store.push(normailizedSettings));

    await render(
      hbs`<AppMonitoring::Settings @settings={{this.amConfigModel}} />`
    );

    assert.dom(`[data-test-toggle-input]`).exists();
    assert.dom(`[data-test-toggle-input]`).hasAttribute('disabled');
    assert.notOk(
      this.element.querySelector(`[data-test-toggle-input]`).checked
    );
  });
});
