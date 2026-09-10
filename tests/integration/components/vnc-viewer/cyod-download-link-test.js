import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  link: '[data-test-vncViewer-cyodDownloadLink]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<VncViewer::CyodDownloadLink
  @url={{this.url}}
  @isIos={{this.isIos}}
/>`;

module(
  'Integration | Component | vnc-viewer/cyod-download-link',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        url: 'https://example.com/patched.apk',
        isIos: false,
      });
    });

    test('it links to the android download', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.link)
        .hasText(t('cyod.downloadApk'))
        .hasAttribute('href', 'https://example.com/patched.apk');
    });

    test('it labels an iOS install differently', async function (assert) {
      this.setProperties({
        isIos: true,
        url: 'itms-services://?action=download-manifest&url=https://example.com/m.plist',
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.link)
        .hasText(t('cyod.installIos'))
        .hasAttribute('href', this.url);
    });

    test('it opens in a new tab without leaking the opener', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.link)
        .hasAttribute('target', '_blank')
        .hasAttribute(
          'rel',
          'noopener noreferrer',
          'the download host cannot reach back into the dashboard'
        );
    });

    test('it renders nothing without a url', async function (assert) {
      this.set('url', null);

      await render(TEMPLATE);

      assert
        .dom(selectors.link)
        .doesNotExist('an absent url offers no dead link');
    });
  }
);
