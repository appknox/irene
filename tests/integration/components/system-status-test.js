import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { Response } from 'miragejs';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { SocketIO, Server } from 'mock-socket';
import { faker } from '@faker-js/faker';

import Service from '@ember/service';

class ConfigurationStub extends Service {
  frontendData = {};
  themeData = {};
  imageData = {};
  serverData = {
    devicefarmURL: 'https://devicefarm.app.com',
    websocket: 'https://socket.app.test',
  };
}

class WebsocketStub extends Service {
  getSocketInstance() {
    return new SocketIO('https://socket.app.test');
  }

  closeSocketConnection() {}
}

module('Integration | Component | system-status', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.create('user');

    this.owner.register('service:configuration', ConfigurationStub);
    this.owner.register('service:websocket', WebsocketStub);
  });

  test('it renders system status details', async function (assert) {
    await render(hbs`<SystemStatus />`);

    assert.dom('[data-test-system-status]').exists();

    assert
      .dom('[data-test-system-status-title]')
      .exists()
      .containsText(t('systemStatus'));

    assert.dom('[data-test-system-status-systems]').exists({ count: 3 });

    const rows = this.element.querySelectorAll(
      '[data-test-system-status-systems]'
    );

    assert.dom(rows[0]).containsText(t('storage'));
    assert.dom(rows[1]).containsText(t('devicefarm'));
    assert.dom(rows[2]).containsText(`${t('api')} ${t('server')}`);

    assert
      .dom('[data-test-system-status-operational]')
      .exists()
      .containsText(t('operational'));

    assert
      .dom('[data-test-system-status-unreachable]')
      .exists()
      .containsText(t('unreachable'));
  });

  test.each(
    'it renders correct status for devicefarm and api status',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      this.server.get('/status', () => {
        return fail
          ? new Response(403)
          : new Response(
              200,
              {},
              {
                data: {
                  storage: 'some_amazon_aws_storage_url.com',
                },
              }
            );
      });

      this.server.get('https://devicefarm.app.com/devicefarm/ping', () => {
        return fail
          ? new Response(404)
          : new Response(200, {}, { ping: 'pong' });
      });

      this.server.get('/ping', () => {
        return fail
          ? new Response(404)
          : new Response(200, {}, { ping: 'pong' });
      });

      await render(hbs`<SystemStatus />`);

      assert.dom('[data-test-system-status]').exists();

      assert
        .dom('[data-test-system-status-title]')
        .exists()
        .containsText(t('systemStatus'));

      const statusEntities = [
        {
          id: 'storage',
          label: 't:storage:()',
          message: 't:proxyWarning:()',
        },
        {
          id: 'devicefarm',
          label: 't:devicefarm:()',
        },
        {
          id: 'api-server',
          label: 't:api:() t:server:()',
        },
      ];

      for (const { id, label, message } of statusEntities) {
        const row = find(`[data-test-system-status-rows="${id}"]`);

        assert
          .dom(row.querySelector('[data-test-system-status-systems]'))
          .hasText(label);

        if (fail) {
          assert
            .dom(row.querySelector('[data-test-system-status-unreachable]'))
            .hasText(
              message ? 't:unreachable:() ' + message : 't:unreachable:()'
            );
        } else {
          assert
            .dom(row.querySelector('[data-test-system-status-operational]'))
            .hasText('t:operational:()');
        }
      }
    }
  );

  test.each(
    'websocket connection test',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      assert.expect(5);

      await authenticateSession({
        authToken: faker.git.commitSha(),
        user_id: '1',
      });

      const configuration = this.owner.lookup('service:configuration');

      const mockServer = new Server(configuration.serverData.websocket);

      this.server.get('/users/:id', (schema, req) => {
        return schema.users.find(req.params.id);
      });

      this.server.post('/websocket_health_check', () => {
        mockServer.emit(
          'websocket_health_check',
          JSON.stringify({ is_healthy: !fail })
        );
      });

      await render(hbs`<SystemStatus />`);

      assert.dom('[data-test-system-status]').exists();

      assert
        .dom('[data-test-system-status-title]')
        .exists()
        .containsText('t:systemStatus:()');

      const websocketRow = find('[data-test-system-status-rows="websocket"]');

      assert
        .dom(websocketRow.querySelector('[data-test-system-status-systems]'))
        .hasText('t:realtimeServer:()');

      if (fail) {
        assert
          .dom(
            websocketRow.querySelector('[data-test-system-status-unreachable]')
          )
          .hasText('t:unreachable:()');
      } else {
        assert
          .dom(
            websocketRow.querySelector('[data-test-system-status-operational]')
          )
          .hasText('t:operational:()');
      }

      mockServer.stop();
    }
  );
});
