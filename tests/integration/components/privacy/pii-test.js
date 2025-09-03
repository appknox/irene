import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, findAll, click } from '@ember/test-helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { setupRequiredEndpoints } from 'irene/tests/helpers/acceptance-utils';

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

module('Integration | Component | privacy/pii', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.owner.register('service:organization', OrganizationStub);
    this.owner.register('service:notifications', NotificationsStub);

    // Setup required endpoints
    const { organization, currentOrganizationMe } =
      await setupRequiredEndpoints(this.server);

    // Update organization with AI features
    organization.update({ ai_features: { pii: true } });

    const profile = this.server.create('profile');

    // File Model
    const file = this.server.create('file', {
      id: 1,
      profile: profile.id,
    });

    // PII Request Model
    this.server.create('pii-request', {
      id: 1,
    });

    // PII Model
    const pii = this.server.createList('pii', 5);

    // Server Mocks
    this.server.get('/v2/files/:id', (schema, req) => {
      const data = schema.files.find(`${req.params.id}`)?.toJSON();

      return { ...data };
    });

    this.server.get('/organizations/:id/ai_features', () => {
      return { pii: true };
    });

    this.server.get('/v2/files/:id/pii_request', () => {
      return { id: 2, file: 1, status: 2 };
    });

    this.server.get('/v2/pii_request/:requestId/pii_data', (schema) => {
      let pii = schema.piis.all().models;

      return {
        count: pii.length,
        next: null,
        previous: null,
        results: pii.map((t) => t.attrs),
      };
    });

    this.setProperties({
      pii,
      file,
      currentOrganizationMe,
      queryParams: {
        app_limit: 10,
        app_offset: 0,
      },
    });
  });

  test('it exists', async function (assert) {
    await render(
      hbs(
        `<PrivacyModule::AppDetails::Pii @queryParams={{this.queryParams}} @file={{this.file}}/>`
      )
    );

    assert.dom('[data-test-privacyModule-pii-piiDetectedTxt]').exists();

    assert.dom('[data-test-privacyModule-pii-list]').exists();
  });

  test('it shows empty when no data', async function (assert) {
    this.server.get('/v2/pii_request/:requestId/pii_data', () => {
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    });

    await render(
      hbs(
        `<PrivacyModule::AppDetails::Pii @queryParams={{this.queryParams}} @file={{this.file}}/>`
      )
    );

    assert.dom('[data-test-privacyModule-pii-piiDetectedTxt]').doesNotExist();

    assert.dom('[data-test-privacyModule-status]').exists();

    assert
      .dom('[data-test-privacyModule-status-header]')
      .hasText(t('privacyModule.emptyPiiHeader'));

    assert
      .dom('[data-test-privacyModule-status-desc]')
      .hasText(t('privacyModule.emptyPiiDesc'));
  });

  test('it shows correct data of pii', async function (assert) {
    await render(
      hbs(
        `<PrivacyModule::AppDetails::Pii @queryParams={{this.queryParams}} @file={{this.file}}/>`
      )
    );

    const expectedCategory = this.pii[0].type;

    const allPiiCategory = findAll('[data-test-privacyModule-pii-category]');

    assert.dom(allPiiCategory[0]).hasText(expectedCategory);

    const expectedData = this.pii[0].pii_data[0].value;

    const allPiiDataValue = findAll('[data-test-privacyModule-pii-data-value]');

    assert.dom(allPiiDataValue[0]).hasText(expectedData);
  });

  test('it opens drawer and shows data', async function (assert) {
    await render(
      hbs(
        `<PrivacyModule::AppDetails::Pii @queryParams={{this.queryParams}} @file={{this.file}}/>`
      )
    );

    const expectedCategory = this.pii[0].type;

    const expectedData = this.pii[0].pii_data[0].value;

    const allPiiCategory = findAll('[data-test-privacyModule-pii-category]');

    await click(allPiiCategory[0]);

    const allDataFound = findAll(
      '[data-test-privacyModule-pii-drawer-data-found]'
    );

    assert
      .dom('[data-test-privacyModule-pii-drawer-header]')
      .hasText(t('privacyModule.piiDetails'));

    assert
      .dom('[data-test-privacyModule-pii-drawer-category-label]')
      .hasText(t('privacyModule.piiCategory'));

    assert
      .dom('[data-test-privacyModule-pii-drawer-category]')
      .hasText(expectedCategory);

    assert
      .dom('[data-test-privacyModule-pii-drawer-data-found-label]')
      .hasText(t('privacyModule.piiDataFound'));

    assert.dom(allDataFound[0]).hasText(expectedData);
  });

  test('it shows data even when feature is toggle off', async function (assert) {
    this.server.get('/organizations/:id/ai_features', () => {
      return { pii: false };
    });

    await render(
      hbs(
        `<PrivacyModule::AppDetails::Pii @queryParams={{this.queryParams}} @file={{this.file}}/>`
      )
    );

    assert.dom('[data-test-privacyModule-pii-piiDetectedTxt]').exists();

    assert.dom('[data-test-privacyModule-pii-list]').exists();
  });

  test('it shows turn on feature when feature is toggle off', async function (assert) {
    this.currentOrganizationMe.update({ is_owner: true });

    this.server.get('/v2/files/:id/pii_request', () => {
      return new Response(
        404,
        {},
        {
          errors: [
            {
              status: '404',
              title: 'Not Found',
            },
          ],
        }
      );
    });

    this.server.get('/organizations/:id/ai_features', () => {
      return { pii: false };
    });

    await render(
      hbs(
        `<PrivacyModule::AppDetails::Pii @queryParams={{this.queryParams}} @file={{this.file}}/>`
      )
    );

    assert.dom('[data-test-privacyModule-pii-piiDetectedTxt]').doesNotExist();

    assert.dom('[data-test-privacyModule-pii-list]').doesNotExist();

    assert
      .dom('[data-test-privacyModule-pii-contact-org-header]')
      .doesNotExist();

    assert
      .dom('[data-test-privacyModule-pii-turn-on-feature-header]')
      .hasText(t('turnOnFeatureOrgSettings'));

    assert
      .dom('[data-test-privacyModule-pii-turn-on-feature-desc]')
      .hasText(t('privacyModule.turnOnSettingsDesc'));

    assert
      .dom('[data-test-privacyModule-pii-turn-on-feature-button]')
      .hasText(t('goToOrgSettings'));
  });

  test('it shows contact org when feature is toggle off', async function (assert) {
    this.currentOrganizationMe.update({ is_owner: false });

    this.server.get('/v2/files/:id/pii_request', () => {
      return new Response(
        404,
        {},
        {
          errors: [
            {
              status: '404',
              title: 'Not Found',
            },
          ],
        }
      );
    });

    this.server.get('/organizations/:id/ai_features', () => {
      return { pii: false };
    });

    await render(
      hbs(
        `<PrivacyModule::AppDetails::Pii @queryParams={{this.queryParams}} @file={{this.file}}/>`
      )
    );

    assert.dom('[data-test-privacyModule-pii-piiDetectedTxt]').doesNotExist();

    assert.dom('[data-test-privacyModule-pii-list]').doesNotExist();

    assert
      .dom('[data-test-privacyModule-pii-contact-org-header]')
      .doesNotExist();

    assert
      .dom('[data-test-privacyModule-pii-turn-on-feature-header]')
      .hasText(t('turnOnFeatureOrgSettings'));

    assert
      .dom('[data-test-privacyModule-pii-turn-on-feature-desc]')
      .hasText(t('privacyModule.turnOnSettingsDesc'));

    assert
      .dom('[data-test-privacyModule-pii-turn-on-feature-button]')
      .doesNotExist();
  });

  test('it does not shows data when feature is toggle on', async function (assert) {
    this.server.get('/v2/files/:id/pii_request', () => {
      return new Response(
        404,
        {},
        {
          errors: [
            {
              status: '404',
              title: 'Not Found',
            },
          ],
        }
      );
    });

    this.server.get('/organizations/:id/ai_features', () => {
      return { pii: true };
    });

    await render(
      hbs(
        `<PrivacyModule::AppDetails::Pii @queryParams={{this.queryParams}} @file={{this.file}}/>`
      )
    );

    assert.dom('[data-test-privacyModule-pii-piiDetectedTxt]').doesNotExist();

    assert.dom('[data-test-privacyModule-pii-list]').doesNotExist();

    assert
      .dom('[data-test-privacyModule-pii-reupload-desc]')
      .hasText(t('privacyModule.piiReupload'));
  });
});
