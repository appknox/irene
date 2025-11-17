import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, click, waitUntil } from '@ember/test-helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }
  success(msg) {
    this.successMsg = msg;
  }
}

class OrganizationStub extends Service {
  selected = {
    id: 1,
    features: {
      privacy: true,
    },
  };
}

module('Integration | Component | privacy/geo-location', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.owner.register('service:organization', OrganizationStub);
    this.owner.register('service:notifications', NotificationsStub);

    const profile = this.server.create('profile');

    // File Model
    const file = this.server.create('file', {
      id: 1,
      profile: profile.id,
    });

    // Tracker Request Model
    const geoLocationData = this.server.create('geo-location', {
      countryCode: 'IN',
      country_name: 'India',
      is_high_risk_region: false,
      hostUrls: [
        {
          ip: '192.0.2.1',
          cidr: '192.0.2.0/24',
          domain: 'example.com',
          source: '0',
          source_location: ['String resource:lite_asset_statements'],
        },
      ],
    });

    // Server Mocks
    this.server.get('/v2/files/:id', (schema, req) => {
      return schema.files.find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/v2/files/:id/geo_request', () => {
      return { id: 2, file: 1, status: 2 };
    });

    this.server.get('/v2/geo_request/:requestId/geo_data', (schema) => {
      return schema.geoLocations.all().models;
    });

    this.setProperties({
      file,
      geoLocationData,
    });
  });

  test('it exists', async function (assert) {
    await render(
      hbs(`<PrivacyModule::AppDetails::GeoLocation @file={{this.file}}/>`)
    );

    assert.dom('[data-test-privacy-geo-location-map]').exists();
  });

  test('it has complete flow', async function (assert) {
    await render(
      hbs(`<PrivacyModule::AppDetails::GeoLocation @file={{this.file}}/>`)
    );

    const chartEl = this.element.querySelector(
      '[data-test-privacy-geo-location-map]'
    );

    // Wait until __chart__ is attached
    await waitUntil(() => chartEl.__chart__);

    const chart = chartEl.__chart__;

    assert.ok(chart, 'chart instance is available');

    // simulate hover and tooltip
    chart.dispatchAction({ type: 'highlight', name: 'IN' });
    chart.dispatchAction({ type: 'showTip', name: 'IN' });

    const seriesData = chart.getOption().series[0].data;
    const indiaData = seriesData.find((d) => d.name === 'IN');

    // Call the component action directly
    chartEl.__component__.openCountryInfoDrawer(indiaData);

    await waitUntil(
      () =>
        !!document.querySelector('[data-test-privacy-geo-location-map-drawer]')
    );

    assert
      .dom('[data-test-privacy-geo-location-map-drawer]')
      .exists('Drawer opened after selecting India');

    assert.dom('[data-test-privacy-geo-location-drawer-header]').exists();

    assert
      .dom('[data-test-privacy-geo-location-drawer-header]')
      .hasText(t('privacyModule.serverLocationDetails'));

    assert
      .dom('[data-test-privacy-geo-location-drawer-country-name]')
      .hasText(this.geoLocationData.country_name);

    assert
      .dom('[data-test-privacy-geo-location-drawer-host-number]')
      .hasText(String(this.geoLocationData.hostUrls.length));

    assert
      .dom('[data-test-privacy-geo-location-drawer-host-container]')
      .exists();

    assert.dom('[data-test-privacy-geo-location-drawer-close-button]').exists();

    await click('[data-test-privacy-geo-location-drawer-close-button]');

    assert.dom('[data-test-privacy-geo-location-map-drawer]').doesNotExist();
  });
});
