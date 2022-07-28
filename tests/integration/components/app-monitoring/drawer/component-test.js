import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import styles from 'irene/components/app-monitoring/drawer/index.scss';
import { module, test } from 'qunit';

module('Integration | Component | app-monitoring/drawer', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    this.prodScanRoute = this.owner.lookup(
      'route:authenticated/app-monitoring'
    );

    this.appDetails = this.prodScanRoute.createProdScanTableData(1)[0];
    this.closeDrawer = function () {
      return;
    };
  });

  test('it renders with the right data', async function (assert) {
    this.appDetails.scannedOnDate = 'April 18, 2016';

    await render(hbs`
      <AppMonitoring::Drawer
        @showRightDrawer={{true}}
        @appDetails={{this.appDetails}}
        @closeModalHandler={{this.closeDrawer}}
      />
    `);

    assert.dom(`[data-test-modal-container]`).exists();
    assert.dom(`[data-test-header-close-icon]`).exists();
    assert.dom(`[data-test-header-title]`).exists();
    assert.dom(`[data-test-app-name]`).hasText(this.appDetails.name);
    assert
      .dom(`[data-test-app-namespace]`)
      .hasText(this.appDetails.package_name);

    assert
      .dom(`[data-test-app-platform]`)
      .hasClass(styles[`platform-${this.appDetails.platform}`]);

    assert
      .dom(`[data-test-app-last-scanned-version]`)
      .hasText(this.appDetails.version);

    assert
      .dom(`[data-test-app-prod-version]`)
      .hasText(this.appDetails.production_version);

    assert
      .dom(`[data-test-app-file-link]`)
      .hasText(`${this.appDetails.file_id}`);

    assert
      .dom(`[data-test-app-scanned-on]`)
      .hasText(this.appDetails.scannedOnDate);
    if (this.appDetails.app_url) {
      assert.dom(`[data-test-app-store-btn]`).exists();
    }
  });

  test('it hides the footer if no app url is provided', async function (assert) {
    this.appDetails.app_url = '';

    await render(hbs`
    <AppMonitoring::Drawer
      @showRightDrawer={{true}}
      @appDetails={{this.appDetails}}
      @closeModalHandler={{this.closeDrawer}}
      />
      `);

    assert.dom(`[data-test-drawer-footer]`).doesNotExist();
  });

  test('it displays a "-" instead of the file id the when no file_id is provided', async function (assert) {
    this.appDetails.file_id = '';

    await render(hbs`
    <AppMonitoring::Drawer
      @showRightDrawer={{true}}
      @appDetails={{this.appDetails}}
      @closeModalHandler={{this.closeDrawer}}
      />
      `);

    assert.dom(`[data-test-app-no-file-id]`).hasText('-');
  });

  test('the footer button displays the right label depending on the app platform', async function (assert) {
    this.appDetails.platform = 'apple';
    this.appDetails.app_url = 'https://localhost:4200';

    await render(hbs`
    <AppMonitoring::Drawer
      @showRightDrawer={{true}}
      @appDetails={{this.appDetails}}
      @closeModalHandler={{this.closeDrawer}}
      />
      `);

    assert.dom(`[data-test-drawer-footer]`).exists('Footer exists');
    assert
      .dom(`[data-test-app-store-btn]`)
      .hasTextContaining(
        'AppStore',
        "Contains 'AppStore' for ios applications."
      );

    this.appDetails.platform = 'android';

    await render(hbs`
    <AppMonitoring::Drawer
      @showRightDrawer={{true}}
      @appDetails={{this.appDetails}}
      @closeModalHandler={{this.closeDrawer}}
      />
      `);

    assert
      .dom(`[data-test-app-store-btn]`)
      .hasTextContaining(
        'PlayStore',
        "Contains 'PlayStore' for android applications."
      );
  });

  test('it hides drawer when "showRightDrawer" property is set to false', async function (assert) {
    await render(hbs`
    <AppMonitoring::Drawer
      @showRightDrawer={{false}}
      @appDetails={{this.appDetails}}
      @closeModalHandler={{this.closeDrawer}}
      />
      `);

    assert
      .dom(`[data-test-modal-container]`)
      .doesNotHaveClass(
        'open',
        "Drawer container element does not have a 'open' class"
      );

    assert
      .dom(`[data-test-modal-container]`)
      .hasStyle(
        { opacity: '0', zIndex: '-1' },
        'Has a style of { opacity: 1, zIndex: -1 }'
      );

    assert
      .dom(`[data-test-modal-content]`)
      .doesNotHaveClass(
        'open',
        "Drawer content element does not have a 'open' class"
      );
  });
});
