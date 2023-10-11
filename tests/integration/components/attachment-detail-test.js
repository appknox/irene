import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { fileExtension } from 'irene/helpers/file-extension';
import Service from '@ember/service';

class WindowStub extends Service {
  url = null;

  open(url) {
    this.url = url;
  }
}

module('Integration | Component | attachment-detail', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    // Store service
    const store = this.owner.lookup('service:store');

    const attachment = this.server.create('attachment');

    this.attachment = store.push(
      store.normalize('attachment', attachment.toJSON())
    );
  });

  test('it renders', async function (assert) {
    await render(hbs`<AttachmentDetail @attachment={{this.attachment}} />`);

    assert
      .dom(`[data-test-attachmentDetail-btn="${this.attachment.uuid}"]`)
      .exists();

    assert
      .dom(`[data-type="${fileExtension([this.attachment.name])}"]`)
      .exists();

    assert
      .dom('[data-test-attachmentDetail-label]')
      .exists()
      .containsText(`${this.attachment.uuid}_${this.attachment.name}`);

    assert.dom('[data-test-attachmentDetail-downloadIcon]').exists();
  });

  test('it downloads an attachment', async function (assert) {
    const DOWNLOAD_URL = 'www.downloadurl.com';

    this.server.get('/dummy_attachment_download_url/:id', () => ({
      data: { url: DOWNLOAD_URL },
    }));

    this.owner.register('service:browser/window', WindowStub);

    await render(hbs`<AttachmentDetail @attachment={{this.attachment}} />`);

    await click(`[data-test-attachmentDetail-btn="${this.attachment.uuid}"]`);

    const window = this.owner.lookup('service:browser/window');

    assert.strictEqual(
      window.url,
      DOWNLOAD_URL,
      'opens the right download url'
    );
  });
});
