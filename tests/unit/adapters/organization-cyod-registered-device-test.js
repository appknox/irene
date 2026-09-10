import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import Service from '@ember/service';

module(
  'Unit | Adapter | organization-cyod-registered-device',
  function (hooks) {
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
        'adapter:organization-cyod-registered-device'
      );
    });

    test('it scopes the device list to the selected organization', function (assert) {
      assert.true(
        this.adapter
          ._buildURL()
          .endsWith(
            `/api/organizations/${this.organization.id}/registered-devices`
          )
      );
    });
  }
);
