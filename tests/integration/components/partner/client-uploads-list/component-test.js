import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
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
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      await this.server.createList('organization', 2);
      await this.owner.lookup('service:organization').load();
    });

    test('it should show no content message for 0 file count', async function (assert) {
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
      assert.dom('[data-test-no-uploads]').exists();
      assert.dom('[data-test-no-uploads]').hasText(t('noClientUploads'));
    });

    test('it should show error message on api error', async function (assert) {
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
          return new Response(500);
        }
      );
      this.set('clientId', 1);
      this.set('projectId', 1);

      await render(
        hbs`<Partner::ClientUploadsList @clientId={{this.clientId}} @projectId={{this.projectId}}/>`
      );
      assert.dom('[data-test-load-error]').exists();
      assert.dom('[data-test-load-error]').hasText(t('errorCouldNotLoadData'));
    });

    test('it should show table headers correctly', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            list_files: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      this.server.createList('partner/partnerclient-project-file', 5);
      this.server.get(
        'v2/partnerclients/:clientId/projects/:projectId/files',
        (schema) => {
          const data = schema['partner/partnerclientProjectFiles'].all();
          return serializer(data, true);
        }
      );
      this.set('clientId', 1);
      this.set('projectId', 1);

      await render(
        hbs`<Partner::ClientUploadsList @clientId={{this.clientId}} @projectId={{this.projectId}}/>`
      );
      assert.strictEqual(
        this.element.querySelectorAll(
          '[data-test-table-header] > [data-test-table-header-item]'
        ).length,
        3,
        'Should have 3 headers by default'
      );
      assert.dom(`[data-test-table-header-app]`).hasText(t('app'));
      assert.dom(`[data-test-table-header-version]`).hasText(t('version'));
      assert.dom(`[data-test-table-header-uploaded]`).hasText(t('uploaded'));
    });

    test('it should render table rows for each file', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            list_files: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      this.server.createList('partner/partnerclient-project-file', 5);
      this.server.get(
        'v2/partnerclients/:clientId/projects/:projectId/files',
        (schema) => {
          const data = schema['partner/partnerclientProjectFiles'].all();
          return serializer(data, true);
        }
      );
      this.set('clientId', 1);
      this.set('projectId', 1);

      await render(
        hbs`<Partner::ClientUploadsList @clientId={{this.clientId}} @projectId={{this.projectId}}/>`
      );
      assert.strictEqual(
        this.element.querySelectorAll(`[data-test-table-body-row]`).length,
        5,
        'Should have 5 rows'
      );
      assert.dom(`[data-test-app] [data-test-app-icon]`).exists();
      assert.dom(`[data-test-app] [data-test-app-info]`).exists();
      assert.dom(`[data-test-version]`).exists();
      assert.dom(`[data-test-versioncode]`).exists();
      assert.dom(`[ data-test-uploaded]`).exists();
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
      const files = this.server.createList(
        'partner/partnerclient-project-file',
        2
      );
      this.server.get(
        'v2/partnerclients/:clientId/projects/:projectId/files',
        (schema) => {
          const data = schema['partner/partnerclientProjectFiles'].all();
          return serializer(data, true);
        }
      );
      this.set('clientId', 1);
      this.set('projectId', 1);

      await render(
        hbs`<Partner::ClientUploadsList @clientId={{this.clientId}} @projectId={{this.projectId}}/>`
      );
      for (let row = 0; row <= files.length - 1; row++) {
        const rowData = files[row];
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-app-icon]`)
          .hasStyle({
            'background-image': `url("${rowData.iconUrl}")`,
          });
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-app-info]`)
          .hasText(rowData.name);
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-app-fileid]`)
          .hasText(`${t('fileID')}: ${rowData.id}`);
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-version]`)
          .hasText(`${t('version')}: ${rowData.version}`);
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-versioncode]`)
          .hasText(`${t('versionCode')}: ${rowData.versionCode}`);
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-uploaded]`)
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
      this.server.createList('partner/partnerclient-project-file', 12);
      this.server.get(
        'v2/partnerclients/:clientId/projects/:projectId/files',
        (schema) => {
          const data = schema['partner/partnerclientProjectFiles'].all();
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

    test('it should render files list section if list_files privilege is set to true', async function (assert) {
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

      assert.dom(`[data-test-upload-list]`).exists();
    });

    test('it should not render anything if the list_files privilege is set to false', async function (assert) {
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

      assert.dom(`[data-test-upload-list]`).doesNotExist();
    });

    test('it should render scan results & report columns if view_reports privilege is set to true', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            list_files: true,
            view_reports: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      dayjs.extend(relativeTime);
      const files = this.server.createList(
        'partner/partnerclient-project-file',
        5
      );
      this.server.get(
        'v2/partnerclients/:clientId/projects/:projectId/files',
        (schema) => {
          const data = schema['partner/partnerclientProjectFiles'].all();
          return serializer(data, true);
        }
      );
      this.set('clientId', 1);
      this.set('projectId', 1);

      await render(
        hbs`<Partner::ClientUploadsList @clientId={{this.clientId}} @projectId={{this.projectId}}/>`
      );
      assert.strictEqual(
        this.element.querySelectorAll(
          '[data-test-table-header] > [data-test-table-header-item]'
        ).length,
        5,
        'Should have 5 headers by default'
      );
      assert.dom(`[data-test-table-header-app]`).hasText(t('app'));
      assert.dom(`[data-test-table-header-version]`).hasText(t('version'));
      assert.dom(`[data-test-table-header-uploaded]`).hasText(t('uploaded'));
      assert.dom(`[data-test-table-header-summary]`).hasText(t('scanResults'));
      assert.dom(`[data-test-table-header-report]`).hasText(t('report'));

      for (let row = 0; row <= files.length - 1; row++) {
        const rowData = files[row];
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-app-icon]`)
          .hasStyle({
            'background-image': `url("${rowData.iconUrl}")`,
          });
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-app-info]`)
          .hasText(rowData.name);
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-app-fileid]`)
          .hasText(`${t('fileID')}: ${rowData.id}`);
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-version]`)
          .hasText(`${t('version')}: ${rowData.version}`);
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-versioncode]`)
          .hasText(`${t('versionCode')}: ${rowData.versionCode}`);
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-uploaded]`)
          .hasText(dayjs(rowData.createdOn).fromNow());
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-summary]`)
          .hasText('');
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-report]`)
          .exists();
      }
    });

    test('it should not render scan results & report columns if view_reports privilege is set to false', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            list_files: true,
            view_reports: false,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      dayjs.extend(relativeTime);
      const files = this.server.createList(
        'partner/partnerclient-project-file',
        5
      );
      this.server.get(
        'v2/partnerclients/:clientId/projects/:projectId/files',
        (schema) => {
          const data = schema['partner/partnerclientProjectFiles'].all();
          return serializer(data, true);
        }
      );
      this.set('clientId', 1);
      this.set('projectId', 1);

      await render(
        hbs`<Partner::ClientUploadsList @clientId={{this.clientId}} @projectId={{this.projectId}}/>`
      );
      assert.strictEqual(
        this.element.querySelectorAll(
          '[data-test-table-header] > [data-test-table-header-item]'
        ).length,
        3,
        'Should have 3 headers by default'
      );

      assert.dom(`[data-test-table-header-summary]`).doesNotExist();
      assert.dom(`[data-test-table-header-report]`).doesNotExist();

      for (let row = 0; row <= files.length - 1; row++) {
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-summary]`)
          .doesNotExist();
        assert
          .dom(`[data-test-table-body-row="${row}"] [data-test-report]`)
          .doesNotExist();
      }
    });
  }
);
