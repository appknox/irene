import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

module('Unit | Adapter | organization-signing-certificate', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const organization = this.server.create('organization');

    class OrganizationStub extends Service {
      selected = organization;
    }

    this.owner.register('service:organization', OrganizationStub);

    this.organization = organization;
    this.adapter = this.owner.lookup(
      'adapter:organization-signing-certificate'
    );
    this.base = `/api/organizations/${organization.id}/signing-certificates`;
  });

  test('urlForQuery points at the organization collection', function (assert) {
    assert.true(this.adapter.urlForQuery().endsWith(`${this.base}/`));
  });

  test('urlForUpload posts to the same collection', function (assert) {
    assert.strictEqual(
      this.adapter.urlForUpload(),
      this.adapter.urlForQuery(),
      'the upload targets the collection, not a member'
    );
  });

  test('urlForDeleteRecord addresses a single certificate', function (assert) {
    assert.true(
      this.adapter.urlForDeleteRecord('42').endsWith(`${this.base}/42/`)
    );
  });

  test('urlForActivate addresses the activate action on a certificate', function (assert) {
    assert.true(
      this.adapter.urlForActivate('42').endsWith(`${this.base}/42/activate/`)
    );
  });

  test('it encodes an id that would otherwise alter the path', function (assert) {
    assert.true(
      this.adapter.urlForDeleteRecord('a/b').endsWith(`${this.base}/a%2Fb/`)
    );
  });

  // ─── activate ──────────────────────────────────────────────────────────────

  test('activate posts to the activate action and pushes the response', async function (assert) {
    assert.expect(4);

    const cert = this.server.create('signing-certificate');
    const store = this.owner.lookup('service:store');

    store.push(
      store.normalize('organization-signing-certificate', cert.toJSON())
    );

    this.server.post(
      '/organizations/:id/signing-certificates/:certId/activate/',
      (schema, req) => {
        assert.strictEqual(req.params.certId, cert.id);
        assert.strictEqual(req.requestBody, '{}', 'posts an empty body');

        return schema.signingCertificates
          .find(req.params.certId)
          .update({ is_active: true })
          .toJSON();
      }
    );

    const record = store.peekRecord(
      'organization-signing-certificate',
      cert.id
    );

    const activated = await this.adapter.activate(record);

    assert.true(activated.isActive, 'the response lands on the record');

    assert.false(
      activated.hasDirtyAttributes,
      'the change is recorded as server state, not a local edit'
    );
  });
});
