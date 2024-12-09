import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { selectFiles } from 'ember-file-upload/test-support';
import { Response } from 'miragejs';

import Service from '@ember/service';

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

class RollbarStub extends Service {
  critical() {}
}

module('Integration | Component | upload-app/via-system', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    await this.owner.lookup('service:organization').load();

    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:rollbar', RollbarStub);

    const organization = this.owner.lookup('service:organization');
    const uploadApp = this.server.create('uploadApp').toJSON();

    this.setProperties({
      organization: organization,
      uploadApp,
    });
  });

  test('it renders upload app', async function (assert) {
    await render(hbs`<UploadApp::ViaSystem />`);

    assert.dom('[data-test-uploadApp-input]').exists();

    assert.dom('[data-test-uploadApp-uploadBtn]').hasText(t('uploadApp'));
  });

  test.each(
    'it should upload app file',
    [{ fail: false }, { fail: true }],
    async function (assert, { fail }) {
      this.server.get('/organizations/:id/upload_app', () => {
        return this.uploadApp;
      });

      this.server.post('/organizations/:id/upload_app', (schema, req) => {
        const data = JSON.parse(req.requestBody);

        return schema.create('uploadApp', data).toJSON();
      });

      this.server.put('/:id/s3_upload_file', () => {
        return fail ? new Response(500) : new Response(200);
      });

      await render(hbs`<UploadApp::ViaSystem />`);

      assert.dom('[data-test-uploadApp-input]').exists();

      assert.dom('[data-test-uploadApp-uploadBtn]').hasText(t('uploadApp'));

      let file = new File(['Test apk file'], 'test.apk', {
        type: 'application/vnd.android.package-archive',
      });

      await selectFiles('[data-test-uploadApp-input]', file);

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(notify.errorMsg, t('errorWhileUploading'));
        assert.dom('[data-test-uploadApp-uploadBtn]').hasText(t('uploadApp'));
      } else {
        assert.strictEqual(notify.successMsg, t('fileUploadedSuccessfully'));
        assert.dom('[data-test-uploadApp-uploadBtn]').hasText(t('uploadApp'));
      }
    }
  );
});
