import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, click, settled } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
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
    features: { privacy: true },
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
    const file = this.server.create('file', { id: 1, profile: profile.id });

    // Geo-location data
    const geoData = this.server.create('geo-location', {
      countryCode: 'IN',
      countryName: 'India',
      isHighRiskRegion: false,
      hostUrls: [
        {
          ip: '163.70.143.174',
          cidr: '163.70.143.0/24',
          domain: 'instagram.com',
          source: '0',
          source_location: ['String resource:lite_asset_statements'],
        },
      ],
    });

    this.setProperties({ file, geoData });
  });

  test('it renders the map container', async function (assert) {
    await render(
      hbs`<PrivacyModule::AppDetails::GeoLocation @file={{this.file}} />`
    );
    assert.dom('[data-test-privacy-geo-location-map]').exists();
  });
});
