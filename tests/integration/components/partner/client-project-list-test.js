import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

function registrationRequestSerializer(data, many = false) {
  if (many === true) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data.models.map((d) => {
        return {
          id: d.id,
          data: d.attrs,
          created_on: d.createdOn,
          package_name: d.packageName,
          platform: d.platform,
        };
      }),
    };
  }
  return {
    id: data.id,
    data: data.attrs,
    created_on: data.createdOn,
    package_name: data.packageName,
    platform: data.platform,
  };
}

module(
  'Integration | Component | partner/client-project-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      await this.server.createList('organization', 2);
      await this.owner.lookup('service:organization').load();
    });

    test('it should show header with title and total count as 0', async function (assert) {
      this.server.get('v2/partnerclients/:clientId/projects', () => {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      });
      this.set('clientId', 1);

      await render(
        hbs`<Partner::ClientProjectList @clientId={{this.clientId}}/>`
      );
      assert.dom('[data-test-title]').hasText(`t:projects:()`);
      assert.dom('[data-test-total-projects-count]').hasText('0');
      assert.dom('[data-test-no-upload-msg]').hasText('t:noClientUploads:()');
    });

    test('it should show 3 table headers ', async function (assert) {
      this.server.get('v2/partnerclients/:clientId/projects', () => {
        return {
          count: 0,
          next: null,
          previous: null,
          results: [],
        };
      });
      this.set('clientId', 1);

      await render(
        hbs`<Partner::ClientProjectList @clientId={{this.clientId}}/>`
      );
      assert.equal(
        this.element.querySelectorAll(`[data-test-table-header] > div`).length,
        3,
        '3 table header exist'
      );
      assert.dom('[data-test-table-header-platform]').hasText(`t:platform:()`);
      assert
        .dom(`[data-test-table-header-package_name]`)
        .hasText(`t:packageName:()`);
      assert
        .dom(`[data-test-table-header-created_on]`)
        .hasText(`t:createdOn:()`);
    });

    test('it should show header with title and total count as "" when the api got errored', async function (assert) {
      this.server.get('v2/partnerclients/:clientId/projects', () => {
        return Response(500);
      });
      await render(hbs`<Partner::ClientProjectList />`);
      assert.dom('[data-test-title]').hasText(`t:projects:()`);
      assert.dom('[data-test-total-projects-count]').hasText('');
      assert.dom('[data-test-no-upload-msg]').hasText('t:noClientUploads:()');
    });

    test('it should show header with title, total count as 5 and contain 5 project rows', async function (assert) {
      this.server.createList('partner/partnerclient-project', 5);

      this.server.get('v2/partnerclients/:clientId/projects', (schema) => {
        const data = schema['partner/partnerclientProjects'].all();
        return registrationRequestSerializer(data, true);
      });
      this.set('clientId', 1);

      await render(
        hbs`<Partner::ClientProjectList @clientId={{this.clientId}}/>`
      );
      assert.dom('[data-test-title]').hasText(`t:projects:()`);
      assert.dom('[data-test-total-projects-count]').hasText('5');
      assert.equal(
        this.element.querySelectorAll(`[data-test-table-row]`).length,
        5,
        '5 project rows exists'
      );
    });

    test('it should render pagination container', async function (assert) {
      this.server.createList('partner/partnerclient-project', 10);

      this.server.get('v2/partnerclients/:clientId/projects', (schema) => {
        const data = schema['partner/partnerclientProjects'].all();
        return registrationRequestSerializer(data, true);
      });
      this.set('clientId', 1);

      await render(
        hbs`<Partner::ClientProjectList @clientId={{this.clientId}}/>`
      );
      assert.dom(`[data-test-pagination]`).exists();
    });
  }
);
