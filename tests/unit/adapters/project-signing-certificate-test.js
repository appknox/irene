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
});
