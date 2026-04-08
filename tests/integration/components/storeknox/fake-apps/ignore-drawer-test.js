import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { click, fillIn, findAll, render } from '@ember/test-helpers';
import { Response } from 'miragejs';
import Service from '@ember/service';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }

  setDefaultAutoClear() {}
}

class SkFakeAppsListStub extends Service {
  reloadCalled = false;

  reload() {
    this.reloadCalled = true;
  }
}

module(
  'Integration | Component | storeknox/fake-apps/ignore-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);
      this.owner.register('service:sk-fake-apps-list', SkFakeAppsListStub);

      // Server mocks
      this.server.get('v2/sk_app_detail/:id', (schema, req) => {
        const app = schema.skInventoryApps.find(req.params.id);

        return { ...app.toJSON(), app_metadata: app.app_metadata };
      });

      // Records
      const store = this.owner.lookup('service:store');

      const skInventoryApp = this.server.create('sk-inventory-app');

      const skFakeApp = this.server.create('sk-fake-app', {
        sk_app: skInventoryApp.id,
        ai_classification_label: 'fake_app',
        reviewed_by: null,
        reviewed_on: null,
        ignore_reason: null,
        status: ENUMS.SK_FAKE_APP_STATUS.PENDING,
      });

      this.skFakeAppRecord = store.push(
        store.normalize('sk-fake-app', {
          ...skFakeApp.toJSON(),
          sk_app: skInventoryApp.id,
        })
      );

      this.setProperties({
        skFakeAppRecord: this.skFakeAppRecord,
        skInventoryApp: this.skInventoryApp,
        store,
        open: true,
        onClose: () => this.set('open', false),
        addToInventory: false,
      });
    });

    // --- drawerTitle ---

    test('it shows "Confirmation" title when fakeApp is not yet ignored', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::IgnoreDrawer
          @fakeApp={{this.skFakeAppRecord}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-title]')
        .hasText(t('confirmation'));
    });

    test('it shows "Ignored Details" title when fakeApp is already ignored', async function (assert) {
      this.skFakeAppRecord.set('reviewedBy', 'reviewer@example.com');

      await render(hbs`
        <Storeknox::FakeApps::IgnoreDrawer
          @fakeApp={{this.skFakeAppRecord}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-title]')
        .hasText(t('storeknox.ignoredDetails'));
    });

    // --- isAlreadyIgnored: details view ---

    test('it shows ignore details when fakeApp is already ignored but not added to inventory', async function (assert) {
      const reviewedOn = new Date('2024-06-01');

      this.skFakeAppRecord.setProperties({
        reviewedBy: 'reviewer@example.com',
        reviewedOn,
        ignoreReason: 'Not a real threat',
        status: ENUMS.SK_FAKE_APP_STATUS.IGNORED,
      });

      await render(hbs`
        <Storeknox::FakeApps::IgnoreDrawer
          @fakeApp={{this.skFakeAppRecord}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      const labels = findAll(
        '[data-test-storeknoxFakeAppsIgnoreDrawer-detailLabel]'
      );

      const values = findAll(
        '[data-test-storeknoxFakeAppsIgnoreDrawer-detailValue]'
      );

      assert.dom(labels[0]).hasText(t('storeknox.ignoredOn'));
      assert.dom(values[0]).hasText(dayjs(reviewedOn).format('MMMM D, YYYY'));

      assert.dom(labels[1]).hasText(t('storeknox.ignoredBy'));
      assert.dom(values[1]).hasText('reviewer@example.com');

      assert.dom(labels[2]).hasText(t('reason'));
      assert.dom(values[2]).hasText('Not a real threat');

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-viewInInventoryBtn]')
        .doesNotExist();

      // Confirm/cancel buttons should not exist
      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]')
        .doesNotExist();
    });

    test('it shows "Ignored & Added to Inventory" labels and inventory link when fakeApp is added to inventory', async function (assert) {
      const reviewedOn = new Date('2024-08-10');
      const linkedInventoryApp = this.server.create('sk-inventory-app');

      const linkedRecord = this.store.push(
        this.store.normalize('sk-inventory-app', {
          ...linkedInventoryApp.toJSON(),
          app_metadata: linkedInventoryApp.app_metadata,
        })
      );

      this.skFakeAppRecord.setProperties({
        reviewedBy: 'reviewer@example.com',
        reviewedOn,
        ignoreReason: 'Owned by us',
        status: ENUMS.SK_FAKE_APP_STATUS.ADDED_TO_INVENTORY,
        addedToInventoryApp: linkedRecord,
      });

      await render(hbs`
        <Storeknox::FakeApps::IgnoreDrawer
          @fakeApp={{this.skFakeAppRecord}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      const labels = findAll(
        '[data-test-storeknoxFakeAppsIgnoreDrawer-detailLabel]'
      );

      assert
        .dom(labels[0])
        .hasText(t('storeknox.ignoredAndAddedToInventoryOn'));

      assert
        .dom(labels[1])
        .hasText(t('storeknox.ignoredAndAddedToInventoryBy'));

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-viewInInventoryBtn]')
        .hasText(t('storeknox.viewInInventory'))
        .hasAttribute(
          'href',
          `/dashboard/storeknox/inventory-details/${linkedRecord.id}`
        );
    });

    // --- ignoreConfirmationPrompt ---

    test('it shows the correct prompt when addToInventory is false', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::IgnoreDrawer
          @fakeApp={{this.skFakeAppRecord}}
          @open={{this.open}}
          @onClose={{this.onClose}}
          @addToInventory={{false}}
        />
      `);

      assert.dom('[data-test-storeknoxFakeAppsIgnoreDrawer-prompt]').exists();

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]')
        .hasText(t('storeknox.yesIgnore'));
    });

    test('it shows the correct prompt when addToInventory is true', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::IgnoreDrawer
          @fakeApp={{this.skFakeAppRecord}}
          @open={{this.open}}
          @onClose={{this.onClose}}
          @addToInventory={{true}}
        />
      `);

      assert.dom('[data-test-storeknoxFakeAppsIgnoreDrawer-prompt]').exists();

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]')
        .hasText(t('storeknox.yesIgnoreAndAddToInventory'));
    });

    // --- isIgnoreReasonValid / validation ---

    test('it disables the confirm button when reason is empty', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::IgnoreDrawer
          @fakeApp={{this.skFakeAppRecord}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]')
        .isDisabled();
    });

    test('it enables the confirm button when a reason is entered', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::IgnoreDrawer
          @fakeApp={{this.skFakeAppRecord}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      await fillIn(
        '[data-test-storeknoxFakeAppsIgnoreDrawer-reasonInput]',
        'Legitimate app'
      );

      assert
        .dom('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]')
        .isNotDisabled();
    });

    // --- cancel / close ---

    test('it calls onClose and resets the reason when close button is clicked', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::IgnoreDrawer
          @fakeApp={{this.skFakeAppRecord}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      await fillIn(
        '[data-test-storeknoxFakeAppsIgnoreDrawer-reasonInput]',
        'Some reason'
      );

      await click('[data-test-storeknoxFakeAppsIgnoreDrawer-closeBtn]');

      assert.false(this.open, 'onClose was called');
    });

    test('it calls onClose when cancel button is clicked', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::IgnoreDrawer
          @fakeApp={{this.skFakeAppRecord}}
          @open={{this.open}}
          @onClose={{this.onClose}}
        />
      `);

      await click('[data-test-storeknoxFakeAppsIgnoreDrawer-cancelBtn]');

      assert.false(this.open, 'onClose was called');
    });

    // --- ignore / ignoreAndAddToInventory: success ---

    test.each(
      'it sends ignore_reason to the correct endpoint and shows success notification',
      [
        {
          addToInventory: false,
          endpoint: 'ignore',
          responseStatus: ENUMS.SK_FAKE_APP_STATUS.IGNORED,
          successMsgKey: 'storeknox.fakeAppIgnored',
          checkReload: true,
        },
        {
          addToInventory: true,
          endpoint: 'add_to_inventory',
          responseStatus: ENUMS.SK_FAKE_APP_STATUS.ADDED_TO_INVENTORY,
          successMsgKey: 'storeknox.fakeAppIgnoredAndAddedToInventory',
          checkReload: false,
        },
      ],
      async function (
        assert,
        { addToInventory, endpoint, responseStatus, successMsgKey, checkReload }
      ) {
        let capturedBody = null;
        const ignoreReason = 'Not a real threat';

        this.server.post(
          `/v2/sk_app/:sk_app_id/sk_fake_app/:id/${endpoint}`,
          (schema, req) => {
            capturedBody = JSON.parse(req.requestBody);

            const fakeApp = schema.skFakeApps.find(req.params.id);

            return {
              ...fakeApp.toJSON(),
              status: responseStatus,
              reviewed_by: 'reviewer@example.com',
              reviewed_on: new Date().toISOString(),
              ignore_reason: capturedBody.ignore_reason,
            };
          }
        );

        this.set('addToInventory', addToInventory);

        await render(hbs`
          <Storeknox::FakeApps::IgnoreDrawer
            @fakeApp={{this.skFakeAppRecord}}
            @open={{this.open}}
            @onClose={{this.onClose}}
            @addToInventory={{this.addToInventory}}
          />
        `);

        await fillIn(
          '[data-test-storeknoxFakeAppsIgnoreDrawer-reasonInput]',
          ignoreReason
        );

        await click('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]');

        assert.strictEqual(
          capturedBody?.ignore_reason,
          ignoreReason,
          'sends correct ignore_reason'
        );

        const notify = this.owner.lookup('service:notifications');

        assert.strictEqual(
          notify.successMsg,
          t(successMsgKey),
          'shows correct success notification'
        );

        assert.false(this.open, 'drawer is closed after success');

        if (checkReload) {
          const skFakeAppsListService = this.owner.lookup(
            'service:sk-fake-apps-list'
          );

          assert.true(
            skFakeAppsListService.reloadCalled,
            'list reload was triggered'
          );
        }
      }
    );

    // --- API failure ---

    test.each(
      'it shows an error notification when the API call fails',
      [{ addToInventory: false }, { addToInventory: true }],
      async function (assert, { addToInventory }) {
        const endpoint = addToInventory ? 'add_to_inventory' : 'ignore';

        this.server.post(
          `v2/sk_app/:sk_app_id/sk_fake_app/:id/${endpoint}`,
          () => new Response(500, {}, { detail: 'Server error' })
        );

        this.set('addToInventory', addToInventory);

        await render(hbs`
          <Storeknox::FakeApps::IgnoreDrawer
            @fakeApp={{this.skFakeAppRecord}}
            @open={{this.open}}
            @onClose={{this.onClose}}
            @addToInventory={{this.addToInventory}}
          />
        `);

        await fillIn(
          '[data-test-storeknoxFakeAppsIgnoreDrawer-reasonInput]',
          'Some reason'
        );

        await click('[data-test-storeknoxFakeAppsIgnoreDrawer-confirmBtn]');

        const notify = this.owner.lookup('service:notifications');

        assert.ok(notify.errorMsg, 'shows error notification');

        assert.true(this.open, 'drawer stays open on failure');
      }
    );
  }
);
