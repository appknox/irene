import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';

module(
  'Integration | Component | storeknox/inventory-details/app-details/actions-list/button',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const appMetadata = this.server.create('sk-app-metadata', {
        platform: ENUMS.PLATFORM.ANDROID,
      });

      const skInventoryApp = this.server.create('sk-inventory-app', {
        app_metadata: appMetadata,
      });

      const skInventoryAppArchived = this.server.create(
        'sk-inventory-app',
        'withArchivedStatus',
        {
          app_metadata: appMetadata,
          archived_on: dayjs().subtract(6, 'months').toISOString(),
        }
      );

      this.skInventoryAppRecord = store.push(
        store.normalize('sk-inventory-app', {
          ...skInventoryApp.toJSON(),
          app_metadata: appMetadata.toJSON(),
        })
      );

      this.skInventoryAppArchivedRecord = store.push(
        store.normalize('sk-inventory-app', {
          ...skInventoryAppArchived.toJSON(),
          app_metadata: appMetadata.toJSON(),
        })
      );
    });

    // --- label ---

    test('it renders the label text', async function (assert) {
      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Scan App'
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-root]')
        .containsText('Scan App');
    });

    // --- leftIconName ---

    test('it renders the info icon by default', async function (assert) {
      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-leftIcon]')
        .hasAttribute('icon', 'material-symbols:info');
    });

    test('it renders the info icon and applies feature-in-progress class when featureInProgress is true', async function (assert) {
      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
          @showDisabledState={{true}}
          @featureInProgress={{true}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-leftIcon]')
        .hasAttribute('icon', 'material-symbols:info');

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-root]')
        .hasClass(/feature-in-progress/)
        .hasClass(/disabled-state/);
    });

    test('it renders the history icon and applies disabled-state class when showDisabledState is true and featureInProgress is false', async function (assert) {
      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
          @showDisabledState={{true}}
          @featureInProgress={{false}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-leftIcon]')
        .hasAttribute('icon', 'material-symbols:history');

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-root]')
        .hasClass(/disabled-state/)
        .doesNotHaveClass(/feature-in-progress/);
    });

    // --- showLoadingState (right icon slot) ---

    test('it renders the right arrow icon by default', async function (assert) {
      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-rightIcon]')
        .exists();

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-rightIconLoader]')
        .doesNotExist();
    });

    test('it renders the loader and applies status-initializing class when statusIsInitializing is true and showDisabledState is false', async function (assert) {
      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
          @statusIsInitializing={{true}}
          @showDisabledState={{false}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-rightIconLoader]')
        .exists();

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-rightIcon]')
        .doesNotExist();

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-root]')
        .hasClass(/status-initializing/);
    });

    test('it renders the arrow icon when statusIsInitializing and showDisabledState are both true', async function (assert) {
      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
          @statusIsInitializing={{true}}
          @showDisabledState={{true}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-rightIcon]')
        .exists();

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-rightIconLoader]')
        .doesNotExist();

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-root]')
        .hasClass(/status-initializing/)
        .hasClass(/disabled-state/);
    });

    // --- hideRightIcon ---

    test('it hides the right icon when hideRightIcon is true', async function (assert) {
      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
          @hideRightIcon={{true}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-rightIcon]')
        .doesNotExist();

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-rightIconLoader]')
        .doesNotExist();
    });

    // --- needsAction ---

    test('it applies the needs-action class when needsAction is true', async function (assert) {
      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
          @needsAction={{true}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-root]')
        .hasClass(/needs-action/);
    });

    test('it does not apply the needs-action class by default', async function (assert) {
      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-root]')
        .doesNotHaveClass(/needs-action/);
    });

    // --- disabled ---

    test('it passes disabled to the button', async function (assert) {
      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
          @disabled={{true}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-root]')
        .isDisabled();
    });

    test('it renders the button as enabled by default', async function (assert) {
      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-root]')
        .isNotDisabled();
    });

    // --- isArchived ---

    test('it does not apply the archived class for a non-archived app', async function (assert) {
      this.set('skInventoryAppRecord', this.skInventoryAppRecord);

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-root]')
        .doesNotHaveClass(/archived/);
    });

    test('it applies the archived class for an archived app', async function (assert) {
      this.set('skInventoryAppRecord', this.skInventoryAppArchivedRecord);

      await render(hbs`
        <Storeknox::InventoryDetails::AppDetails::ActionsList::Button
          @label='Action'
          @skInventoryApp={{this.skInventoryAppRecord}}
        />
      `);

      assert
        .dom('[data-test-storeknoxInventoryDetails-actionBtn-root]')
        .hasClass(/archived/);
    });
  }
);
