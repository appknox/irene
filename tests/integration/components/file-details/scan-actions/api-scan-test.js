import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';
import { Response } from 'miragejs';
import faker from 'faker';

import ENUMS from 'irene/enums';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }
}

module(
  'Integration | Component | file-details/scan-actions/api-scan',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const profile = this.server.create('profile', { id: '100' });

      const file = this.server.create('file', {
        project: '1',
        profile: profile.id,
      });

      const capturedApis = [
        ...this.server.createList('capturedapi', 3, { is_active: false }),
        ...this.server.createList('capturedapi', 7, { is_active: true }),
      ];

      this.server.create('project', {
        file: file.id,
        id: '1',
        platform: ENUMS.PLATFORM.ANDROID,
      });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        capturedApis,
        store,
      });

      await this.owner.lookup('service:organization').load();
      this.owner.register('service:notifications', NotificationsStub);
    });

    test.each(
      'test different states of api scan',
      [
        { status: ENUMS.SCAN_STATUS.RUNNING },
        { status: ENUMS.SCAN_STATUS.COMPLETED },
        { status: ENUMS.SCAN_STATUS.UNKNOWN },
        { status: ENUMS.SCAN_STATUS.UNKNOWN, disabled: true },
      ],
      async function (assert, { status, disabled }) {
        this.file.apiScanStatus = status;

        if (status === ENUMS.SCAN_STATUS.COMPLETED) {
          this.file.isApiDone = true;
        } else {
          this.file.isApiDone = false;
        }

        this.file.isDynamicDone = !disabled;

        // make sure file is active
        this.file.isActive = true;

        this.server.get('/v2/projects/:id', (schema, req) => {
          return schema.projects.find(`${req.params.id}`)?.toJSON();
        });

        await render(hbs`
            <FileDetails::ScanActions::ApiScan @file={{this.file}} />
        `);

        if (this.file.isRunningApiScan) {
          assert
            .dom('[data-test-apiScan-btn]')
            .hasText(`t:scanning:() : ${this.file.apiScanProgress}%`);
        } else if (this.file.isApiDone) {
          assert.dom('[data-test-apiScan-btn]').hasText('t:completed:()');
        } else {
          assert
            .dom('[data-test-apiScan-btn]')
            [disabled ? 'isDisabled' : 'isNotDisabled']()
            .hasText('t:start:()');
        }
      }
    );

    test('it api scan modal with captured api count 0', async function (assert) {
      this.file.isDynamicDone = true;
      this.file.isApiDone = false;

      // make sure file is active
      this.file.isActive = true;

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/files/1/capturedapis', () => {
        return [];
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/profiles/:id/proxy_settings', (_, req) => {
        return { id: req.params.id, host: '', port: '', enabled: false };
      });

      await render(hbs`
        <FileDetails::ScanActions::ApiScan @file={{this.file}} />
      `);

      assert
        .dom('[data-test-apiScan-btn]')
        .isNotDisabled()
        .hasText('t:start:()');

      await click('[data-test-apiScan-btn]');

      assert
        .dom('[data-test-ak-modal-header]')
        .hasText('t:modalCard.apiScan.title:()');

      assert
        .dom('[data-test-capturedApi-emptyTitle]')
        .hasText('t:capturedApiEmptyTitle:()');

      assert
        .dom('[data-test-capturedApi-emptyDescription]')
        .hasText('t:capturedApiEmptyDesc:()');

      assert.dom('[data-test-proxySettingsView-container]').doesNotExist();

      assert.dom('[data-test-apiScanModal-startBtn]').doesNotExist();

      assert
        .dom('[data-test-apiScanModal-closeBtn]')
        .isNotDisabled()
        .hasText('t:close:()');

      await click('[data-test-apiScanModal-closeBtn]');

      assert.dom('[data-test-ak-modal-header]').doesNotExist();
    });

    test.each(
      'it api scan modal with captured api count greater than 0',
      [false, true],
      async function (assert, withApiProxySetting) {
        this.file.isDynamicDone = true;
        this.file.isApiDone = false;

        // make sure file is active
        this.file.isActive = true;

        this.server.get('/v2/projects/:id', (schema, req) => {
          return schema.projects.find(`${req.params.id}`)?.toJSON();
        });

        this.server.get('/v2/files/1/capturedapis', (schema, req) => {
          const results = req.queryParams.is_active
            ? schema.db.capturedapis.where({ is_active: true })
            : schema.capturedapis.all().models;

          return { count: results.length, previous: null, next: null, results };
        });

        this.server.get('/profiles/:id', (schema, req) =>
          schema.profiles.find(`${req.params.id}`)?.toJSON()
        );

        this.server.get('/profiles/:id/proxy_settings', (_, req) => {
          return {
            id: req.params.id,
            host: withApiProxySetting ? faker.internet.ip() : '',
            port: withApiProxySetting ? faker.internet.port() : '',
            enabled: false,
          };
        });

        await render(hbs`
        <FileDetails::ScanActions::ApiScan @file={{this.file}} />
      `);

        assert
          .dom('[data-test-apiScan-btn]')
          .isNotDisabled()
          .hasText('t:start:()');

        await click('[data-test-apiScan-btn]');

        assert
          .dom('[data-test-ak-modal-header]')
          .hasText('t:modalCard.apiScan.title:()');

        assert
          .dom('[data-test-apiScanModal-warnAlert]')
          .hasText('t:modalCard.apiScan.warning:()');

        assert
          .dom('[data-test-apiScanModal-description]')
          .hasText('t:modalCard.apiScan.description:()');

        assert
          .dom('[data-test-capturedApi-title]')
          .hasText('t:capturedApiTitle:()');

        const selected = this.capturedApis.filter((it) => it.is_active);

        assert
          .dom('[data-test-capturedApi-apiCount]')
          .hasText(
            `t:selected:() (${selected.length}/${this.capturedApis.length})`
          );

        const apiEndpoints = findAll(
          '[data-test-capturedApi-endpointContainer]'
        );

        assert.strictEqual(apiEndpoints.length, 10);

        // first 3 api not selected
        assert
          .dom(
            '[data-test-capturedApi-endpointSelectCheckbox]',
            apiEndpoints[0]
          )
          .isNotDisabled()
          .isNotChecked();

        assert
          .dom('[data-test-capturedApi-endpointMethodChip]', apiEndpoints[0])
          .hasText(this.capturedApis[0].request.method);

        assert
          .dom('[data-test-capturedApi-endpointMethodChip]', apiEndpoints[0])
          .hasText(this.capturedApis[0].request.method);

        const { scheme, path, host, port } = this.capturedApis[0].request;

        assert
          .dom('[data-test-capturedApi-endpointUrl]', apiEndpoints[0])
          .hasText(`${scheme}://${host}:${port}${path}`);

        const proxySetting = this.store.peekRecord(
          'proxy-setting',
          this.file.profile.get('id')
        );

        if (proxySetting.hasProxyUrl) {
          assert.dom('[data-test-proxySettingsView-container]').exists();

          assert
            .dom(
              '[data-test-proxySettingsView-enableApiProxyToggle] [data-test-toggle-input]'
            )
            .isNotDisabled()
            .isNotChecked();

          assert
            .dom('[data-test-proxySettingsView-enableApiProxyLabel]')
            .hasText('t:enable:() t:proxySettingsTitle:()');

          assert
            .dom('[data-test-proxySettingsView-editSettings]')
            .hasTagName('a')
            .hasAttribute('href', '/project/1/settings')
            .hasText('t:edit:()');

          assert
            .dom('[data-test-proxySettingsView-proxySettingRoute]')
            .hasText(
              `t:proxySettingsRouteVia:() ${proxySetting.host}:${proxySetting.port}`
            );
        } else {
          assert.dom('[data-test-proxySettingsView-container]').doesNotExist();
        }

        assert
          .dom('[data-test-apiScanModal-startBtn]')
          .isNotDisabled()
          .hasText('t:modalCard.apiScan.start:()');

        assert.dom('[data-test-apiScanModal-closeBtn]').doesNotExist();
      }
    );

    test('test toggle api endpoint selection', async function (assert) {
      this.file.isDynamicDone = true;
      this.file.isApiDone = false;

      // make sure file is active
      this.file.isActive = true;

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/files/1/capturedapis', (schema, req) => {
        const results = req.queryParams.is_active
          ? schema.db.capturedapis.where({ is_active: true })
          : schema.capturedapis.all().models;

        return { count: results.length, previous: null, next: null, results };
      });

      this.server.put('/capturedapis/:id', (schema, req) => {
        const data = JSON.parse(req.requestBody);

        schema.db.capturedapis.update(`${req.params.id}`, {
          is_active: data.is_active,
        });

        return new Response(200);
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/profiles/:id/proxy_settings', (_, req) => {
        return {
          id: req.params.id,
          host: '',
          port: '',
          enabled: false,
        };
      });

      await render(hbs`
        <FileDetails::ScanActions::ApiScan @file={{this.file}} />
      `);

      assert
        .dom('[data-test-apiScan-btn]')
        .isNotDisabled()
        .hasText('t:start:()');

      await click('[data-test-apiScan-btn]');

      assert
        .dom('[data-test-ak-modal-header]')
        .hasText('t:modalCard.apiScan.title:()');

      const selected = this.capturedApis.filter((it) => it.is_active);

      assert
        .dom('[data-test-capturedApi-apiCount]')
        .hasText(
          `t:selected:() (${selected.length}/${this.capturedApis.length})`
        );

      const apiEndpoints = findAll('[data-test-capturedApi-endpointContainer]');

      assert.strictEqual(apiEndpoints.length, 10);

      // first 3 api not selected
      assert
        .dom('[data-test-capturedApi-endpointSelectCheckbox]', apiEndpoints[0])
        .isNotDisabled()
        .isNotChecked();

      await click(
        apiEndpoints[0].querySelector(
          '[data-test-capturedApi-endpointSelectCheckbox]'
        )
      );

      assert
        .dom('[data-test-capturedApi-endpointSelectCheckbox]', apiEndpoints[0])
        .isNotDisabled()
        .isChecked();

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.successMsg, 't:capturedApiSaveSuccessMsg:()');

      // should be +1
      assert
        .dom('[data-test-capturedApi-apiCount]')
        .hasText(
          `t:selected:() (${selected.length + 1}/${this.capturedApis.length})`
        );

      await click(
        apiEndpoints[0].querySelector(
          '[data-test-capturedApi-endpointSelectCheckbox]'
        )
      );

      assert
        .dom('[data-test-capturedApi-endpointSelectCheckbox]', apiEndpoints[0])
        .isNotDisabled()
        .isNotChecked();

      // should be back to initial state
      // assert
      //   .dom('[data-test-capturedApi-apiCount]')
      //   .hasText(
      //     `t:selected:() (${selected.length}/${this.capturedApis.length})`
      //   );
    });

    test('test run api scan', async function (assert) {
      this.file.isDynamicDone = true;
      this.file.isApiDone = false;

      // make sure file is active
      this.file.isActive = true;

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/v2/files/1/capturedapis', (schema, req) => {
        const results = req.queryParams.is_active
          ? schema.db.capturedapis.where({ is_active: true })
          : schema.capturedapis.all().models;

        return { count: results.length, previous: null, next: null, results };
      });

      this.server.get('/profiles/:id', (schema, req) =>
        schema.profiles.find(`${req.params.id}`)?.toJSON()
      );

      this.server.get('/profiles/:id/proxy_settings', (_, req) => {
        return {
          id: req.params.id,
          host: '',
          port: '',
          enabled: false,
        };
      });

      this.server.post('/v2/files/:id/start_apiscan', () => new Response(201));

      await render(hbs`
        <FileDetails::ScanActions::ApiScan @file={{this.file}} />
      `);

      assert
        .dom('[data-test-apiScan-btn]')
        .isNotDisabled()
        .hasText('t:start:()');

      await click('[data-test-apiScan-btn]');

      assert
        .dom('[data-test-ak-modal-header]')
        .hasText('t:modalCard.apiScan.title:()');

      assert
        .dom('[data-test-apiScanModal-startBtn]')
        .isNotDisabled()
        .hasText('t:modalCard.apiScan.start:()');

      await click('[data-test-apiScanModal-startBtn]');

      const notify = this.owner.lookup('service:notifications');

      assert.strictEqual(notify.successMsg, 't:startingApiScan:()');
      assert.dom('[data-test-ak-modal-header]').doesNotExist();
    });
  }
);
