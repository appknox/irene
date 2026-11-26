import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { Response } from 'miragejs';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

const DETAILS_FORM = '[data-test-securityManualScanDetails-container]';

module('Integration | Component | security/file-details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(function () {
    this.owner.register('service:notifications', NotificationsStub);

    this.notify = this.owner.lookup('service:notifications');

    this.server.get('/hudson-api/projects/:id', (schema, req) =>
      schema['security/projects'].find(`${req.params.id}`)?.toJSON()
    );

    this.server.get('/hudson-api/projects', () => new Response(200));

    // withoutProject: the file list payload has no project.
    this.createFile = (
      isManualScanAvailable,
      { withoutProject = false } = {}
    ) => {
      const store = this.owner.lookup('service:store');

      const project = this.server.create('security/project', {
        id: 1,
        is_manual_scan_available: isManualScanAvailable,
      });

      const file = this.server.create('security/file', {
        id: 1,
        project: project.id,
        analyses: [],
      });

      const payload = file.toJSON();

      if (withoutProject) {
        delete payload.project;
      }

      this.serverFile = file;

      this.set('file', store.push(store.normalize('security/file', payload)));
    };

    this.renderFileDetails = () =>
      render(hbs`<Security::FileDetails @file={{this.file}} />`);
  });

  test('it shows the manual scan details form when the org has manual scan', async function (assert) {
    this.createFile(true);

    await this.renderFileDetails();

    assert.dom(DETAILS_FORM).exists();

    assert
      .dom('[data-test-securityManualScanDetails-coveredScope] textarea')
      .hasValue('', 'a file with no saved details reads as empty');
  });

  test('it does not show the details form when the org has no manual scan', async function (assert) {
    this.createFile(false);

    await this.renderFileDetails();

    assert.dom(DETAILS_FORM).doesNotExist();
    assert.strictEqual(this.notify.errorMsg, null);
  });

  test('it shows the form for a file opened from the list, before its project is known', async function (assert) {
    this.createFile(true, { withoutProject: true });

    await this.renderFileDetails();

    assert.strictEqual(
      this.notify.errorMsg,
      null,
      'no error while the project is not known yet'
    );

    assert.dom(DETAILS_FORM).exists('appears once the project is known');
  });

  test('it reports a failed load and keeps the page usable', async function (assert) {
    this.createFile(true);

    this.server.get(
      '/hudson-api/files/:id/manual_scan_details',
      () => new Response(500)
    );

    await this.renderFileDetails();

    assert.ok(this.notify.errorMsg, 'tells the user it failed');
    assert.dom(DETAILS_FORM).doesNotExist();

    assert
      .dom('[data-test-securityFileDetailsActions-container]')
      .exists('the rest of the page still renders');
  });
});
