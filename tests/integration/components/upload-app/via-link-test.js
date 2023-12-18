import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
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

module('Integration | Component | upload-app/via-link', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);

    const store = this.owner.lookup('service:store');

    await this.owner.lookup('service:organization').load();

    this.owner.register('service:notifications', NotificationsStub);

    this.setProperties({
      store,
    });
  });

  test('it renders', async function (assert) {
    await render(hbs`<UploadApp::ViaLink />`);

    assert.dom('[data-test-uploadAppViaLink-btn]').exists().isNotDisabled();
  });

  test('it renders upload via link modal', async function (assert) {
    await render(hbs`<UploadApp::ViaLink />`);

    assert.dom('[data-test-uploadAppViaLink-btn]').isNotDisabled();
    assert.dom('[data-test-ak-modal-header]').doesNotExist();

    await click('[data-test-uploadAppViaLink-btn]');

    assert
      .dom('[data-test-ak-modal-header]')
      .hasText('t:uploadAppModule.linkUploadPopupHeader:()');

    assert
      .dom('[data-test-uploadAppViaLinkModal-linkInput]')
      .isNotDisabled()
      .hasAttribute('placeholder', 't:uploadAppModule.linkPastePlaceholder:()')
      .hasNoValue();

    assert
      .dom('[data-test-uploadAppViaLinkModal-linkInputHelperText]')
      .hasText(
        't:uploadAppModule.supportedStores:() : t:uploadAppModule.stores:()'
      );

    assert
      .dom('[data-test-uploadAppViaLinkModal-validFormatText]')
      .hasText('t:uploadAppModule.validURLFormatTitle:()');

    assert
      .dom('[data-test-uploadAppViaLinkModal-playstoreValidUrl]')
      .hasText('https://play.google.com/store/apps/details?id={package_name}');

    assert
      .dom('[data-test-uploadAppViaLinkModal-appstoreValidUrl]')
      .hasText(
        'https://apps.apple.com/{country_code}/app/{app_slug}/id{app_id}'
      );

    assert
      .dom('[data-test-uploadAppViaLinkModal-confirmBtn]')
      .isDisabled()
      .hasText('t:upload:()');
  });

  test.each(
    'test upload app via link validation',
    [
      ['test', 'URL should have valid Playstore or Appstore Domain'],
      [
        'https://example.com',
        'URL should have valid Playstore or Appstore Domain',
      ],
      [
        'https://play.google.com/store/apps/details',
        'Playstore url should be valid, the expected format is : https://play.google.com/store/apps/details?id={package_name}',
      ],
      [
        'https://apps.apple.com/in/app/example/i',
        'Appstore url should be valid, the expected format is : https://apps.apple.com/{country_code}/app/{app_slug}/id{app_id}',
      ],
    ],
    async function (assert, [storeUrl, errorMessage]) {
      await render(hbs`<UploadApp::ViaLink />`);

      assert.dom('[data-test-uploadAppViaLink-btn]').isNotDisabled();
      assert.dom('[data-test-ak-modal-header]').doesNotExist();

      await click('[data-test-uploadAppViaLink-btn]');

      assert
        .dom('[data-test-ak-modal-header]')
        .hasText('t:uploadAppModule.linkUploadPopupHeader:()');

      assert
        .dom('[data-test-uploadAppViaLinkModal-linkInput]')
        .isNotDisabled()
        .hasNoValue();

      await fillIn('[data-test-uploadAppViaLinkModal-linkInput]', storeUrl);

      assert.dom('[data-test-helper-text]').hasText(errorMessage);

      assert.dom('[data-test-uploadAppViaLinkModal-confirmBtn]').isDisabled();
    }
  );

  test.each(
    'test upload app via link',
    [true, false],
    async function (assert, fail) {
      assert.expect(fail ? 11 : 10);

      const appLink =
        'https://play.google.com/store/apps/details?id=com.example.app';

      this.server.post('/organizations/:id/upload_app_url', (_, req) => {
        if (fail) {
          return new Response(500);
        }

        const data = JSON.parse(req.requestBody);

        assert.strictEqual(data.url, appLink);

        return new Response(200);
      });

      await render(hbs`<UploadApp::ViaLink />`);

      assert.dom('[data-test-uploadAppViaLink-btn]').isNotDisabled();
      assert.dom('[data-test-ak-modal-header]').doesNotExist();

      await click('[data-test-uploadAppViaLink-btn]');

      assert
        .dom('[data-test-ak-modal-header]')
        .hasText('t:uploadAppModule.linkUploadPopupHeader:()');

      assert
        .dom('[data-test-uploadAppViaLinkModal-linkInput]')
        .isNotDisabled()
        .hasNoValue();

      assert
        .dom('[data-test-uploadAppViaLinkModal-confirmBtn]')
        .isDisabled()
        .hasText('t:upload:()');

      await fillIn('[data-test-uploadAppViaLinkModal-linkInput]', appLink);

      assert
        .dom('[data-test-uploadAppViaLinkModal-confirmBtn]')
        .isNotDisabled();

      await click('[data-test-uploadAppViaLinkModal-confirmBtn]');

      if (fail) {
        assert.dom('[data-test-ak-modal-header]').exists();

        assert
          .dom('[data-test-uploadAppViaLinkModal-linkInput]')
          .hasValue(appLink);

        const notify = this.owner.lookup('service:notifications');

        assert.ok(notify.errorMsg);
      } else {
        // should close modal on success
        assert.dom('[data-test-ak-modal-header]').doesNotExist();
      }
    }
  );
});
