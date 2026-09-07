import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { click, render } from '@ember/test-helpers';

module(
  'Integration | Component | storeknox/fake-apps/signal-detail-drawer',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.signal = {
        title: 'Brand Analysis',
        result: 'Strong Match',
        resultLevel: 'high',
        description: 'App titles share high word overlap.',
        numericScore: 0.86,
      };
      this.onClose = () => {};
    });

    test('it does not render content when isOpen is false', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::SignalDetailDrawer
          @isOpen={{false}}
          @sectionTitle='Brand Identity Analysis'
          @signal={{this.signal}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-root]')
        .doesNotExist();
    });

    test('it renders the section title in the drawer header when open', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::SignalDetailDrawer
          @isOpen={{true}}
          @sectionTitle='Brand Identity Analysis'
          @signal={{this.signal}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-title]')
        .hasText('Brand Identity Analysis');
    });

    test('it renders signal content and translated labels', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::SignalDetailDrawer
          @isOpen={{true}}
          @sectionTitle='Brand Identity Analysis'
          @signal={{this.signal}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-signalTitle]')
        .hasText('Brand Analysis');

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-result]')
        .hasText('Strong Match');

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-reasoning]')
        .hasText('App titles share high word overlap.');

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-signalLabel]')
        .hasText(t('storeknox.fakeApps.signal'));

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-resultLabel]')
        .hasText(t('storeknox.fakeApps.result'));

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-reasoningLabel]')
        .hasText(t('storeknox.fakeApps.reasoning'));
    });

    test('it renders medium result level correctly', async function (assert) {
      this.signal = {
        ...this.signal,
        result: 'Partial Match',
        resultLevel: 'medium',
        numericScore: 0.7,
      };

      await render(hbs`
        <Storeknox::FakeApps::SignalDetailDrawer
          @isOpen={{true}}
          @sectionTitle='Brand Identity Analysis'
          @signal={{this.signal}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-result]')
        .hasText('Partial Match');
    });

    test('it renders low result level correctly', async function (assert) {
      this.signal = {
        ...this.signal,
        result: 'Low Match',
        resultLevel: 'low',
        numericScore: 0.2,
      };

      await render(hbs`
        <Storeknox::FakeApps::SignalDetailDrawer
          @isOpen={{true}}
          @sectionTitle='Brand Identity Analysis'
          @signal={{this.signal}}
          @onClose={{this.onClose}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsSignalDetailDrawer-result]')
        .hasText('Low Match');
    });

    test('it calls onClose when the close button is clicked', async function (assert) {
      assert.expect(1);

      this.onClose = () => assert.ok(true, 'onClose called');

      await render(hbs`
        <Storeknox::FakeApps::SignalDetailDrawer
          @isOpen={{true}}
          @sectionTitle='Brand Identity Analysis'
          @signal={{this.signal}}
          @onClose={{this.onClose}}
        />
      `);

      await click('[data-test-storeknoxFakeAppsSignalDetailDrawer-closeBtn]');
    });
  }
);
