import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render, click } from '@ember/test-helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { hbs } from 'ember-cli-htmlbars';
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

class OrganizationStub extends Service {
  selected = {
    id: 1,
    features: {
      privacy: true,
    },
  };
}

class StubPrivacyModuleService extends Service {
  showCompleteApiScanNote = false;
  showPiiUpdated = false;
  showNote = false;
  showCompleteDastScanNote = false;
  showGeoUpdated = false;
}

module('Integration | Component | privacy/note', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.owner.register('service:organization', OrganizationStub);
    this.owner.register('service:notifications', NotificationsStub);
    this.owner.register('service:privacy-module', StubPrivacyModuleService);
  });

  test('it renders complete API scan note', async function (assert) {
    const service = this.owner.lookup('service:privacy-module');
    service.showNote = true;
    service.showCompleteApiScanNote = true;

    await render(hbs`<PrivacyModule::AppDetails::Note />`);

    assert.dom('[data-test-ak-notification-banner]').exists();

    assert
      .dom('[data-test-ak-notification-banner-message]')
      .hasText(t('privacyModule.completeApiScanNote'));

    await click('[data-test-ak-notification-banner-close]');

    assert.false(service.showNote, 'Hides banner after clicking close');
  });

  test('it renders pii updated note', async function (assert) {
    const service = this.owner.lookup('service:privacy-module');
    service.showPiiUpdated = true;
    service.showNote = true;

    await render(hbs`<PrivacyModule::AppDetails::Note />`);

    assert.dom('[data-test-ak-notification-banner]').exists();

    assert
      .dom('[data-test-ak-notification-banner-message]')
      .hasText(t('privacyModule.piiUpdatedNote'));

    await click('[data-test-ak-notification-banner-close]');

    assert.false(service.showNote, 'Hides banner after clicking close');
  });

  test('it renders complete DAST scan note', async function (assert) {
    const service = this.owner.lookup('service:privacy-module');
    service.showNote = true;
    service.showCompleteDastScanNote = true;

    await render(hbs`<PrivacyModule::AppDetails::Note />`);

    assert.dom('[data-test-ak-notification-banner]').exists();

    assert
      .dom('[data-test-ak-notification-banner-message]')
      .hasText(t('privacyModule.completeDastScanNote'));

    await click('[data-test-ak-notification-banner-close]');

    assert.false(service.showNote, 'Hides banner after clicking close');
  });

  test('it renders geo location updated note', async function (assert) {
    const service = this.owner.lookup('service:privacy-module');
    service.showGeoUpdated = true;
    service.showNote = true;

    await render(hbs`<PrivacyModule::AppDetails::Note />`);

    assert.dom('[data-test-ak-notification-banner]').exists();

    assert
      .dom('[data-test-ak-notification-banner-message]')
      .hasText(t('privacyModule.geoUpdatedNote'));

    await click('[data-test-ak-notification-banner-close]');

    assert.false(service.showNote, 'Hides banner after clicking close');
  });

  test('it renders multiple message', async function (assert) {
    const service = this.owner.lookup('service:privacy-module');
    service.showCompleteDastScanNote = true;
    service.showCompleteApiScanNote = true;
    service.showNote = true;

    await render(hbs`<PrivacyModule::AppDetails::Note />`);

    assert.dom('[data-test-ak-notification-banner]').exists();

    assert
      .dom('[data-test-ak-notification-banner-message]')
      .hasText(t('privacyModule.completeApiScanNote'));

    await click('[data-test-ak-notification-banner-next]');

    assert
      .dom('[data-test-ak-notification-banner-message]')
      .hasText(t('privacyModule.completeDastScanNote'));
  });
});
