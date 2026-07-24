import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { click, render } from '@ember/test-helpers';

module(
  'Integration | Component | storeknox/fake-apps/findings-group',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.groupData = {
        title: 'Brand Identity Analysis',
        description:
          'Measures how closely the app resembles the protected brand.',
        badge: 'High Match',
        badgeLevel: 'high',
        signals: [
          {
            title: 'Logo Analysis',
            result: 'Strong Match',
            resultLevel: 'high',
            description: 'Logos look identical.',
            numericScore: 0.9,
          },
          {
            title: 'Package Analysis',
            result: 'Low Match',
            resultLevel: 'low',
            description: 'Packages differ.',
            numericScore: 0.2,
          },
        ],
      };
      this.onSignalClick = () => {};
    });

    test('it renders the section title, description, and badge', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::FindingsGroup
          @groupData={{this.groupData}}
          @onSignalClick={{this.onSignalClick}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsGroup-title]')
        .hasText('Brand Identity Analysis');

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsGroup-description]')
        .hasText('Measures how closely the app resembles the protected brand.');

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsGroup-badge]')
        .hasText('High Match');
    });

    test('it renders one signal row per signal', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::FindingsGroup
          @groupData={{this.groupData}}
          @onSignalClick={{this.onSignalClick}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsSignalRow-root]')
        .exists({ count: 2 });
    });

    test('it renders SIGNAL and RESULT column headers', async function (assert) {
      await render(hbs`
        <Storeknox::FakeApps::FindingsGroup
          @groupData={{this.groupData}}
          @onSignalClick={{this.onSignalClick}}
        />
      `);

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsGroup-signalHeader]')
        .hasText(t('storeknox.fakeApps.signal'));

      assert
        .dom('[data-test-storeknoxFakeAppsFindingsGroup-resultHeader]')
        .hasText(t('storeknox.fakeApps.result'));
    });

    test('it calls onSignalClick with the signal and section title when a row is clicked', async function (assert) {
      assert.expect(2);

      this.onSignalClick = (signal, sectionTitle) => {
        assert.strictEqual(signal.title, 'Logo Analysis');
        assert.strictEqual(sectionTitle, 'Brand Identity Analysis');
      };

      await render(hbs`
        <Storeknox::FakeApps::FindingsGroup
          @groupData={{this.groupData}}
          @onSignalClick={{this.onSignalClick}}
        />
      `);

      const firstExpandBtn = document
        .querySelector('[data-test-storeknoxFakeAppsFindingsGroup-root]')
        ?.querySelectorAll(
          '[data-test-storeknoxFakeAppsFindingsSignalRow-expandBtn]'
        )[0];

      await click(firstExpandBtn);
    });
  }
);
