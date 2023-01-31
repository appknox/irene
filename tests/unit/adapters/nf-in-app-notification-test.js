import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Adapter | nf in app notification', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const adapter = this.owner.lookup('adapter:nf-in-app-notification');
    assert.ok(adapter);
  });

  test('it should post mark_all_as_read', async function (assert) {
    const adapter = this.owner.lookup('adapter:nf-in-app-notification');
    assert.expect(1);
    this.server.post(
      'v2/nf_in_app_notifications/mark_all_as_read',
      function (schema, request) {
        assert.ok(true);
        return new Response(200, {}, {});
      }
    );
    await adapter.markAllAsRead();
  });
});
