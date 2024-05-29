import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { Response } from 'miragejs';

import Service from '@ember/service';

class ConfigurationStub extends Service {
  frontendData = {};
  themeData = {};
  imageData = {};
  serverData = {
    devicefarmURL: 'https://devicefarm.appknox.com',
  };
}

module('Integration | Component | system-status', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('it renders system status details', async function (assert) {
    await render(hbs`<SystemStatus />`);

    assert.dom('[data-test-system-status]').exists();

    assert
      .dom('[data-test-system-status-title]')
      .exists()
      .containsText('t:systemStatus:()');

    assert.dom('[data-test-system-status-systems]').exists({ count: 3 });

    const rows = this.element.querySelectorAll(
      '[data-test-system-status-systems]'
    );

    assert.dom(rows[0]).containsText('t:storage:()');
    assert.dom(rows[1]).containsText('t:devicefarm:()');
    assert.dom(rows[2]).containsText('t:api:() t:server:()');

    assert
      .dom('[data-test-system-status-operational]')
      .exists()
      .containsText('t:operational:()');

    assert
      .dom('[data-test-system-status-unreachable]')
      .exists()
      .containsText('t:unreachable:()');
  });

  test.each(
    'it renders correct status for devicefarm and api status',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      this.owner.register('service:configuration', ConfigurationStub);

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

      this.server.get('https://devicefarm.appknox.com/devicefarm/ping', () => {
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
        .containsText('t:systemStatus:()');

      if (fail) {
        assert
          .dom('[data-test-system-status-unreachable]')
          .exists({ count: 3 });
      } else {
        assert
          .dom('[data-test-system-status-operational]')
          .exists({ count: 3 });
      }
    }
  );
});
