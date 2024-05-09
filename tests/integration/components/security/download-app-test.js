import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { fillIn, click } from '@ember/test-helpers';
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

class WindowStub extends Service {
  url = null;
  target = null;

  open(url, target) {
    this.url = url;
    this.target = target;
  }
}

module('Integration | Component | security/download-app', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:browser/window', WindowStub);

    this.server.get('/hudson-api/apps/3', () => {
      return { url: 'some_download_url.com' };
    });
  });

  test('it shows download app page with elements', async function (assert) {
    await render(hbs`<Security::DownloadApp />`);

    assert.dom('[data-test-download-app-container]').exists();

    assert
      .dom('[data-test-download-app-title]')
      .exists()
      .hasText('Download App');

    assert
      .dom('[data-test-download-app-summary]')
      .exists()
      .hasText('Please enter the id of the file you want to download');
  });

  test('it do not download app which is not present', async function (assert) {
    await render(hbs`<Security::DownloadApp />`);

    assert.dom('[data-test-download-app-input]').exists();

    await fillIn('[data-test-download-app-input]', '4');

    await click('[data-test-download-app-download-button]');

    const notify = this.owner.lookup('service:notifications');

    assert.ok(notify.errorMsg);
  });

  test('it will start downloading app', async function (assert) {
    await render(hbs`<Security::DownloadApp />`);

    assert.dom('[data-test-download-app-input]').exists();

    await fillIn('[data-test-download-app-input]', '3');

    await click('[data-test-download-app-download-button]');

    const window = this.owner.lookup('service:browser/window');

    assert.strictEqual(window.url, 'some_download_url.com');
    assert.strictEqual(window.target, '_blank');
  });
});
