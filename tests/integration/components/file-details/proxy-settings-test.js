import Service from '@ember/service';
import { click, find, render, triggerEvent } from '@ember/test-helpers';
import { faker } from '@faker-js/faker';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { Response } from 'miragejs';
import { module, test } from 'qunit';

class NotificationsStub extends Service {
  errorMsg = null;
  infoMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  info(msg) {
    this.infoMsg = msg;
  }
}

module(
  'Integration | Component | file-details/proxy-settings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const profile = this.server.create('profile', { id: '100' });

      const file = this.server.create('file', {
        project: '1',
        profile: profile.id,
        is_active: true,
      });

      this.server.create('project', {
        last_file: file,
        id: '1',
      });

      // server mocks
      this.server.get('/profiles/:id', (schema, req) => {
        return schema.profiles.find(`${req.params.id}`).toJSON();
      });

      this.server.get('/v3/projects/:id', (schema, req) => {
        return schema.projects.find(`${req.params.id}`).toJSON();
      });

      this.owner.register('service:notifications', NotificationsStub);

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        store,
      });
    });

    test('it renders proxy settings', async function (assert) {
      this.server.get('/profiles/:id/proxy_settings', (_, req) => {
        return {
          id: req.params.id,
          host: faker.internet.ip(),
          port: faker.internet.port(),
          enabled: false,
        };
      });

      await render(
        hbs`<FileDetails::ProxySettings @project={{this.file.project}} @profile={{this.file.profile}} />`
      );

      const proxySetting = this.store.peekRecord(
        'proxy-setting',
        this.file.profile.get('id')
      );

      assert.notOk(proxySetting.enabled);

      assert.dom('[data-test-fileDetails-proxySettings-container]').exists();

      assert
        .dom('[data-test-fileDetails-proxySettings-enableApiProxyLabel]')
        .hasText(`${t('enable')} ${t('proxySettingsTitle')}`);

      const proxySettingsToggle =
        '[data-test-fileDetails-proxySettings-enableApiProxyToggle] [data-test-toggle-input]';

      assert.dom(proxySettingsToggle).isNotDisabled().isNotChecked();

      const proxySettingsTooltip = find(
        '[data-test-fileDetails-proxySettings-helpIcon]'
      );

      await triggerEvent(proxySettingsTooltip, 'mouseenter');

      assert
        .dom('[data-test-fileDetails-proxySettings-helpTooltipContent]')
        .exists()
        .containsText(t('proxySettingsRouteVia'))
        .containsText(proxySetting.port)
        .containsText(proxySetting.host);

      await triggerEvent(proxySettingsTooltip, 'mouseleave');
    });

    test.each(
      'it enables api proxy',
      [
        { enabled: false, assertions: 8 },
        { enabled: true, assertions: 8 },
        { enabled: false, assertions: 6, fail: true },
      ],
      async function (assert, { enabled, assertions, fail }) {
        assert.expect(assertions);

        this.server.get('/profiles/:id/proxy_settings', (_, req) => {
          return {
            id: req.params.id,
            host: faker.internet.ip(),
            port: faker.internet.port(),
            enabled,
          };
        });

        this.server.put('/profiles/:id/proxy_settings', (_, req) => {
          if (fail) {
            return new Response(
              501,
              {},
              { detail: 'failed to update proxy settings' }
            );
          }

          const data = JSON.parse(req.requestBody);

          if (enabled) {
            assert.false(data.enabled);
          } else {
            assert.true(data.enabled);
          }

          return {
            id: req.params.id,
            ...data,
          };
        });

        await render(
          hbs`<FileDetails::ProxySettings @project={{this.file.project}} @profile={{this.file.profile}} />`
        );

        const proxySetting = this.store.peekRecord(
          'proxy-setting',
          this.file.profile.get('id')
        );

        assert
          .dom('[data-test-fileDetails-proxySettings-enableApiProxyLabel]')
          .hasText(`${t('enable')} ${t('proxySettingsTitle')}`);

        const proxySettingsToggle =
          '[data-test-fileDetails-proxySettings-enableApiProxyToggle] [data-test-toggle-input]';

        if (enabled) {
          assert.dom(proxySettingsToggle).isNotDisabled().isChecked();
        } else {
          assert.dom(proxySettingsToggle).isNotDisabled().isNotChecked();
        }

        await click(proxySettingsToggle);

        const notify = this.owner.lookup('service:notifications');

        if (fail) {
          assert.dom(proxySettingsToggle).isNotDisabled().isNotChecked();

          assert.strictEqual(
            notify.errorMsg,
            'failed to update proxy settings'
          );
        } else {
          if (enabled) {
            assert.dom(proxySettingsToggle).isNotDisabled().isNotChecked();
          } else {
            assert.dom(proxySettingsToggle).isNotDisabled().isChecked();
          }

          if (enabled) {
            assert.false(proxySetting.enabled);
          } else {
            assert.true(proxySetting.enabled);
          }

          assert.strictEqual(
            notify.infoMsg,
            `${t('proxyTurned')} ${(enabled ? t('off') : t('on')).toUpperCase()}`
          );
        }
      }
    );
  }
);
