import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

module('Unit | Adapter | project-signing-certificate', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const organization = this.server.create('organization');

    class OrganizationStub extends Service {
      selected = organization;
    }

    this.owner.register('service:organization', OrganizationStub);

    this.organization = organization;
    this.adapter = this.owner.lookup('adapter:project-signing-certificate');
    this.expected = `/api/organizations/${organization.id}/projects/7/signing-certificate/`;
  });

  test('urlForQueryRecord reads the project scope from the query', function (assert) {
    assert.true(
      this.adapter.urlForQueryRecord({ projectId: 7 }).endsWith(this.expected)
    );
  });

  test('the singular endpoint serves read, upload and delete alike', function (assert) {
    assert.strictEqual(
      this.adapter.urlForUpload(7),
      this.adapter.urlForQueryRecord({ projectId: 7 }),
      'no id is appended for the project scope'
    );

    assert.strictEqual(
      this.adapter.urlForRemove(7),
      this.adapter.urlForUpload(7)
    );
  });

  // ─── fetchWithOrgCerts ─────────────────────────────────────────────────────

  test('fetchWithOrgCerts normalizes and pushes both halves of the response', async function (assert) {
    const projectCert = this.server.create('signing-certificate');
    const orgCert = this.server.create(
      'signing-certificate',
      'withActiveStatus'
    );

    this.server.get(
      '/organizations/:id/projects/:projectId/signing-certificate/',
      () => ({
        project_certificate: projectCert.toJSON(),
        organization_certificates: [orgCert.toJSON()],
      })
    );

    const result = await this.adapter.fetchWithOrgCerts(7);

    assert.strictEqual(result.projectCertificate?.id, projectCert.id);
    assert.strictEqual(result.organizationCertificates.length, 1);
    assert.strictEqual(result.organizationCertificates[0].id, orgCert.id);

    const store = this.owner.lookup('service:store');

    assert.strictEqual(
      store.peekRecord('project-signing-certificate', projectCert.id),
      result.projectCertificate,
      'the project cert lands in the store'
    );
  });

  test('fetchWithOrgCerts returns null when the project has no cert of its own', async function (assert) {
    this.server.get(
      '/organizations/:id/projects/:projectId/signing-certificate/',
      () => ({ project_certificate: null, organization_certificates: [] })
    );

    const result = await this.adapter.fetchWithOrgCerts(7);

    assert.strictEqual(result.projectCertificate, null);
    assert.strictEqual(result.organizationCertificates.length, 0);
  });

  // ─── setActive ─────────────────────────────────────────────────────────────

  test('setActive PATCHes is_active and pushes the response', async function (assert) {
    assert.expect(3);

    const cert = this.server.create('signing-certificate');

    this.server.patch(
      '/organizations/:id/projects/:projectId/signing-certificate/',
      (schema, req) => {
        assert.deepEqual(JSON.parse(req.requestBody), { is_active: true });

        return cert.update({ is_active: true }).toJSON();
      }
    );

    const updated = await this.adapter.setActive(7, true);

    assert.true(updated.isActive);

    const store = this.owner.lookup('service:store');

    assert.strictEqual(
      store.peekRecord('project-signing-certificate', cert.id),
      updated
    );
  });
});
