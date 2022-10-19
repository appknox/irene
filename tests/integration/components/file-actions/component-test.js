import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | file-actions', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    const project = store.createRecord('project', { id: 1 });

    this.file = store.createRecord('user', {
      id: 1,
      project: project,
      name: 'MFVA',
    });

    this.server.get('/vulnerabilities', () => {
      return { data: [] };
    });
  });

  test('it shows manual scan status select box if manualscan feature is disabled', async function (assert) {
    class OrganizationStub extends Service {
      selected = {
        id: 1,
        features: {
          manualscan: true,
        },
      };
    }

    this.owner.register('service:organization', OrganizationStub);

    await render(hbs`<FileActions @file={{this.file}} />`);
    assert.dom('[data-test-file-actions-container]').exists();
    assert
      .dom('[data-test-file-actions-name-id]')
      .exists()
      .hasTextContaining(`${this.file.name}`)
      .hasTextContaining(`${this.file.id}`);

    assert.dom('[data-test-manual-scan-statuses]').exists();
  });

  test('it hides manual scan status select box if manualscan feature is enabled', async function (assert) {
    class OrganizationStub extends Service {
      selected = {
        id: 1,
        features: {
          manualscan: false,
        },
      };
    }

    this.owner.register('service:organization', OrganizationStub);

    await render(hbs`<FileActions @file={{this.file}} />`);
    assert.dom('[data-test-manual-scan-statuses]').doesNotExist();
  });
});
