import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { faker } from '@faker-js/faker';
import Service from '@ember/service';
import { capitalize } from '@ember/string';

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
    this.successMsg = msg;
  }
}

module(
  'Integration | Component | project-settings/general-settings/proxy-settings',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.get('/profiles/:id/proxy_settings', (schema, req) => {
        return schema.proxySettings.find(`${req.params.id}`)?.toJSON();
      });

      const store = this.owner.lookup('service:store');
      this.owner.register('service:notifications', NotificationsStub);

      // Profile Model
      const profile = this.server.create('profile');
      const normalizedProfile = store.normalize('profile', profile.toJSON());
      const profileModel = store.push(normalizedProfile);

      this.setProperties({
        profile: profileModel,
      });
    });

    test('it renders', async function (assert) {
      const proxySettings = this.server.create('proxy-setting', { id: 1 });

      await render(hbs`
      <ProjectSettings::GeneralSettings::ProxySettings @profile={{this.profile}} />
    `);

      assert
        .dom('[data-test-projectSettings-genSettings-proxySettings-root]')
        .exists();

      assert
        .dom(
          '[data-test-projectSettings-genSettings-proxySettings-hostTextField]'
        )
        .exists()
        .hasValue(proxySettings.host);

      assert
        .dom(
          '[data-test-projectSettings-genSettings-proxySettings-portTextField]'
        )
        .exists()
        .hasValue(String(proxySettings.port));

      assert
        .dom(
          '[data-test-projectSettings-genSettings-proxySettings-saveProxyBtn]'
        )
        .exists()
        .containsText(t('save'));

      assert
        .dom(
          '[data-test-projectSettings-genSettings-proxySettings-proxyToggleLabel]'
        )
        .exists()
        .containsText(t('proxyEnable'));

      assert
        .dom(
          '[data-test-projectSettings-genSettings-proxySettings-proxyToggle]'
        )
        .exists();

      const toggleSelector =
        '[data-test-projectSettings-genSettings-proxySettings-proxyToggle] [data-test-toggle-input]';

      if (proxySettings.enabled) {
        assert.dom(toggleSelector).exists().isChecked();
      } else {
        assert.dom(toggleSelector).exists().isNotChecked();
      }
    });

    test.each(
      'it saves changes to proxy values if inputs are valid',
      [
        [faker.internet.ip(), '5050'],
        ['', ''],
      ],
      async function (assert, [host, port]) {
        this.server.delete('/profiles/:id/proxy_settings', (schema, req) => {
          const proxySetting = schema.proxySettings
            .find(`${req.params.id}`)
            ?.toJSON();

          this.set('proxyCleared', true);

          return { ...proxySetting, host: '', port: '', enabled: false };
        });

        this.server.put('/profiles/:id/proxy_settings', (schema, req) => {
          const reqBody = JSON.parse(req.requestBody);
          const { enabled, host, port } = reqBody;

          this.setProperties({ host, port });

          const proxySetting = schema.proxySettings
            .find(`${req.params.id}`)
            ?.toJSON();

          return { ...proxySetting, enabled, host, port };
        });

        this.server.create('proxy-setting', { id: 1 });

        await render(hbs`
          <ProjectSettings::GeneralSettings::ProxySettings @profile={{this.profile}} />
        `);

        await fillIn(
          '[data-test-projectSettings-genSettings-proxySettings-hostTextField]',
          host
        );

        await fillIn(
          '[data-test-projectSettings-genSettings-proxySettings-portTextField]',
          port
        );

        await click(
          '[data-test-projectSettings-genSettings-proxySettings-saveProxyBtn]'
        );

        if (host && port) {
          const notify = this.owner.lookup('service:notifications');
          assert.strictEqual(notify.successMsg, t('proxySettingsSaved'));

          assert.strictEqual(this.host, host);
          assert.strictEqual(this.port, port);
        } else {
          assert.true(this.proxyCleared, 'Proxy values were cleared');
        }
      }
    );

    test.each(
      'it throws an error if host and ports are invalid',
      [
        ['abs093893', '1000000000', 'Port must be in the range 1 - 65535'],
        ['', '1000000000', "Host can't be empty"],
        ['abs093893', '', "Port can't be empty"],
      ],
      async function (assert, [host, port, error]) {
        this.setProperties({ host, port });

        this.server.create('proxy-setting', { id: 1 });

        await render(hbs`
          <ProjectSettings::GeneralSettings::ProxySettings @profile={{this.profile}} />
        `);

        await fillIn(
          '[data-test-projectSettings-genSettings-proxySettings-hostTextField]',
          this.host
        );

        await fillIn(
          '[data-test-projectSettings-genSettings-proxySettings-portTextField]',
          this.port
        );

        await click(
          '[data-test-projectSettings-genSettings-proxySettings-saveProxyBtn]'
        );

        const notify = this.owner.lookup('service:notifications');
        assert.strictEqual(notify.errorMsg, error);
      }
    );

    test('it toggles proxy status', async function (assert) {
      this.server.put('/profiles/:id/proxy_settings', (schema, req) => {
        const reqBody = JSON.parse(req.requestBody);
        const { enabled, host, port } = reqBody;

        const proxySetting = schema.proxySettings
          .find(`${req.params.id}`)
          ?.toJSON();

        return { ...proxySetting, enabled, host, port };
      });

      // Disabled by default
      this.server.create('proxy-setting', { id: 1, enabled: false });

      await render(hbs`
        <ProjectSettings::GeneralSettings::ProxySettings @profile={{this.profile}} />
      `);

      const toggleSelector =
        '[data-test-projectSettings-genSettings-proxySettings-proxyToggle] [data-test-toggle-input]';

      assert.dom(toggleSelector).exists().isNotChecked();

      await click(toggleSelector);

      const notify = this.owner.lookup('service:notifications');
      assert.strictEqual(
        notify.successMsg,
        `${t('proxyTurned')}${capitalize(t('ON'))}`
      );
      assert.dom(toggleSelector).exists().isChecked();

      await click(toggleSelector);

      assert.strictEqual(
        notify.successMsg,
        `${t('proxyTurned')}${capitalize(t('OFF'))}`
      );
      assert.dom(toggleSelector).exists().isNotChecked();
    });
  }
);
