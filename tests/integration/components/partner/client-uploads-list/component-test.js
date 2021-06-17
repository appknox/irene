import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

function serializer(data, many = false) {
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
          name: d.name,
          version: d.version,
          version_code: d.versionCode,
          icon_url: d.iconUrl,
        };
      }),
    };
  }
  return {
    id: data.id,
    data: data.attrs,
    created_on: data.createdOn,
    name: data.name,
    version: data.version,
    version_code: data.versionCode,
    icon_url: data.iconUrl,
  };
}

module(
  'Integration | Component | partner/client-uploads-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      await this.server.createList('organization', 2);
      await this.owner.lookup('service:organization').load();
    });

    test('it should show title and total count as 0', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            list_files: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      this.server.get(
        'v2/partnerclients/:clientId/projects/:projectId/files',
        () => {
          return {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };
        }
      );
      this.set('clientId', 1);
      this.set('projectId', 1);

      await render(
        hbs`<Partner::ClientUploadsList @clientId={{this.clientId}} @projectId={{this.projectId}}/>`
      );
      assert.dom('[data-test-title]').hasText(`t:allUploads:()`);
      assert.dom('[data-test-total-files-count]').hasText('0');
      assert.dom('[data-test-no-uploads]').hasText('t:noClientUploads:()');
    });

    test('it should show title and total count as "" when errored', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            list_files: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      this.server.get(
        'v2/partnerclients/:clientId/projects/:projectId/files',
        () => {
          return Response(500);
        }
      );
      this.set('clientId', 1);
      this.set('projectId', 1);

      await render(
        hbs`<Partner::ClientUploadsList @clientId={{this.clientId}} @projectId={{this.projectId}}/>`
      );
      assert.dom('[data-test-title]').hasText(`t:allUploads:()`);
      assert.dom('[data-test-total-files-count]').hasText('');
      assert.dom('[data-test-no-uploads]').hasText('t:noClientUploads:()');
    });

    test('it should show table with 4 headers', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            list_files: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      this.server.get(
        'v2/partnerclients/:clientId/projects/:projectId/files',
        () => {
          return {
            count: 0,
            next: null,
            previous: null,
            results: [],
          };
        }
      );
      this.set('clientId', 1);
      this.set('projectId', 1);

      await render(
        hbs`<Partner::ClientUploadsList @clientId={{this.clientId}} @projectId={{this.projectId}}/>`
      );
      assert.equal(
        this.element.querySelectorAll('[data-test-table-header] > div').length,
        4,
        'Should have 4 headers'
      );
      assert.dom(`[data-test-table-header-app]`).hasText(`t:app:()`);
      assert.dom(`[data-test-table-header-version]`).hasText(`t:version:()`);
      assert
        .dom(`[data-test-table-header-versioncode]`)
        .hasText(`t:versionCode:()`);
      assert.dom(`[data-test-table-header-uploaded]`).hasText(`t:uploaded:()`);
    });

    test('it should show table body with 5 rows', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            list_files: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      this.server.createList('partner/partnerclient-file', 5);
      this.server.get(
        'v2/partnerclients/:clientId/projects/:projectId/files',
        (schema) => {
          const data = schema['partner/partnerclientFiles'].all();
          return serializer(data, true);
        }
      );
      this.set('clientId', 1);
      this.set('projectId', 1);

      await render(
        hbs`<Partner::ClientUploadsList @clientId={{this.clientId}} @projectId={{this.projectId}}/>`
      );
      assert.equal(
        this.element.querySelectorAll(`[data-test-table-body-row]`).length,
        5,
        'Should have 5 rows'
      );
      assert.dom(`[data-test-row-app] [data-test-row-app-icon]`).exists();
      assert.dom(`[data-test-row-app] [data-test-row-app-info]`).exists();
      assert.dom(`[data-test-row-version]`).exists();
      assert.dom(`[data-test-row-versioncode]`).exists();
      assert.dom(`[ data-test-row-uploaded]`).exists();
      assert.dom(`[ data-test-pagination]`).doesNotExist();
    });

    test('it should contain actual values in each row', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            list_files: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      dayjs.extend(relativeTime);
      const files = this.server.createList('partner/partnerclient-file', 2);
      this.server.get(
        'v2/partnerclients/:clientId/projects/:projectId/files',
        (schema) => {
          const data = schema['partner/partnerclientFiles'].all();
          return serializer(data, true);
        }
      );
      this.set('clientId', 1);
      this.set('projectId', 1);

      await render(
        hbs`<Partner::ClientUploadsList @clientId={{this.clientId}} @projectId={{this.projectId}}/>`
      );
      for (let row = 0; row <= files.length - 1; row++) {
        const rowData = files.objectAt(row);
        console.log('rowData', rowData);
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-row-app-icon]`)
          .hasStyle({
            'background-image': `url("${rowData.iconUrl}")`,
          });
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-row-app-info]`)
          .hasText(rowData.name);

        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-row-version]`)
          .hasText(`${rowData.version}`);
        assert
          .dom(
            `[data-test-table-body-row="${row}"] [data-test-row-versioncode]`
          )
          .hasText(`${rowData.versionCode}`);
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-row-uploaded]`)
          .hasText(dayjs(rowData.createdOn).fromNow());
      }
    });

    test('it should show pagination', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            list_files: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      this.server.createList('partner/partnerclient-file', 10);
      this.server.get(
        'v2/partnerclients/:clientId/projects/:projectId/files',
        (schema) => {
          const data = schema['partner/partnerclientFiles'].all();
          return serializer(data, true);
        }
      );
      this.set('clientId', 1);
      this.set('projectId', 1);

      await render(
        hbs`<Partner::ClientUploadsList @clientId={{this.clientId}} @projectId={{this.projectId}}/>`
      );

      assert.dom(`[ data-test-pagination]`).exists();
    });

    test('it should render table, if privilege is set to true', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            list_files: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();

      await render(hbs`<Partner::ClientUploadsList/>`);

      assert.dom(`[ data-test-total-files-count]`).exists();
      assert.dom(`[data-test-table]`).exists();
      assert.dom(`[data-test-no-privilege]`).doesNotExist();
    });

    test('it should not render table and show a msg when the privilege is set to false', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            list_files: false,
          },
        };
      });
      await this.owner.lookup('service:partner').load();

      await render(hbs`<Partner::ClientUploadsList/>`);

      assert.dom(`[ data-test-total-files-count]`).doesNotExist();
      assert.dom(`[data-test-table]`).doesNotExist();
      assert
        .dom(`[data-test-no-privilege]`)
        .hasText(`t:partnerPrivilege.noListFiles:()`);
    });

    test('it should not render table and show a msg when the privilege is not set', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {},
        };
      });
      await this.owner.lookup('service:partner').load();

      await render(hbs`<Partner::ClientUploadsList/>`);

      assert.dom(`[data-test-total-files-count]`).doesNotExist();
      assert.dom(`[data-test-table]`).doesNotExist();
      assert
        .dom(`[data-test-no-privilege]`)
        .hasText(`t:partnerPrivilege.noListFiles:()`);
    });
  }
);
