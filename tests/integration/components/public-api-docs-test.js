import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

class OrganizationMeStub extends Service {
  org = { is_owner: false, is_admin: false };
}

module('Integration | Component | public-api-docs', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    await this.owner.lookup('service:organization').load();

    this.owner.register('service:me', OrganizationMeStub);

    // Description
    const infoTitle = 'Public API Documentation';
    const infoDesc = 'Dummy header description for public api docs.';
    const version = 'v1.0.0';

    // API Path
    const apiPathName = '/api/path/1';
    const apiPathSummary = 'List path info';

    // Schema Info
    const schemaName = 'TestSchema';

    const publicApiData = {
      openapi: '3.0.3',
      info: {
        title: infoTitle,
        version,
        description: infoDesc,
      },
      paths: {
        [apiPathName]: {
          get: {
            description: 'List get details of a path.',
            summary: apiPathSummary,
          },
        },
      },

      components: {
        schemas: {
          [schemaName]: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                description: 'Test Schema 1 Description',
              },
            },
            required: ['id'],
          },
        },
      },
    };

    this.server.get('/public_api/schema', () => publicApiData);

    this.setProperties({
      infoTitle,
      infoDesc,
      version,
      apiPathName,
      apiPathSummary,
      schemaName,
      publicApiData,
    });
  });

  test('it renders', async function (assert) {
    await render(hbs`<PublicApiDocs />`);

    await waitUntil(
      () => {
        return find(
          '[data-test-publicApiDocs-description-container]'
        ).textContent.includes(this.infoTitle);
      },
      { timeout: 2000 }
    );

    assert
      .dom('[data-test-publicApiDocs-description-container]')
      .exists()
      .containsText(this.infoTitle)
      .containsText(this.infoDesc)
      .containsText(this.version);
  });

  test.each(
    'it renders service account btn if user is owner or admin',
    [
      { is_owner: false, is_admin: false },
      { is_owner: true, is_admin: true },
    ],
    async function (assert, { is_owner, is_admin }) {
      class OrganizationMeStub extends Service {
        org = { is_owner, is_admin };
      }

      this.owner.register('service:me', OrganizationMeStub);

      await render(hbs`<PublicApiDocs />`);

      assert.dom('[data-test-publicApiDocs-description-container]').exists();

      if (is_admin || is_owner) {
        assert
          .dom('[data-test-publicApiDocs-serviceAccountLink]')
          .exists()
          .containsText(t('goToServiceAccounts'))
          .hasAttribute(
            'href',
            '/dashboard/organization/settings/service-account'
          );
      } else {
        assert
          .dom('[data-test-publicApiDocs-serviceAccountLink]')
          .doesNotExist();
      }
    }
  );

  test('it renders api endpoints', async function (assert) {
    await render(
      hbs`<PublicApiDocs::ApiEndpoints @data={{this.publicApiData}} />`
    );

    await waitUntil(() => {
      return find(
        '[data-test-publicApiDocs-apis-container]'
      ).textContent.includes(this.apiPathName);
    });

    assert
      .dom('[data-test-publicApiDocs-apis-container]')
      .exists()
      .containsText(this.apiPathName)
      .containsText(this.apiPathSummary);
  });

  test('it renders schemas', async function (assert) {
    await render(hbs`<PublicApiDocs::Schemas @data={{this.publicApiData}} />`);

    await waitUntil(() => {
      return find(
        '[data-test-publicApiDocs-schemas-container]'
      ).textContent.includes(this.schemaName);
    });

    assert
      .dom('[data-test-publicApiDocs-schemas-container]')
      .exists()
      .containsText(this.schemaName);
  });
});
