import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | knox-iq/status-card', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  module('component states', function () {
    test('active state: renders title/subtitle, run button enabled, icon has active class', async function (assert) {
      this.title = t('knoxIq.statusCard.readyTitle');
      this.subtitle = t('knoxIq.statusCard.readySubtitle');

      await render(hbs`
        <KnoxIq::StatusCard
          @title={{this.title}}
          @subtitle={{this.subtitle}}
          @state='active'
        />
      `);

      assert
        .dom('[data-test-knoxiq-status-card-title]')
        .containsText(t('knoxIq.statusCard.readyTitle'));

      assert
        .dom('[data-test-knoxiq-status-card-subtitle]')
        .containsText(t('knoxIq.statusCard.readySubtitle'));

      assert
        .dom('[data-test-knoxiq-status-card-runBtn]')
        .doesNotHaveAttribute('disabled');

      assert
        .dom('[data-test-knoxiq-status-card-icon]')
        .hasClass(/status-card-icon-active/);
    });

    test('inactive state: run button has disabled attribute, icon has inactive class', async function (assert) {
      await render(hbs`
        <KnoxIq::StatusCard
          @title='KnoxIQ'
          @subtitle='Complete DAST first'
          @state='inactive'
        />
      `);

      assert
        .dom('[data-test-knoxiq-status-card-runBtn]')
        .hasAttribute('disabled');

      assert
        .dom('[data-test-knoxiq-status-card-icon]')
        .hasClass(/status-card-icon-inactive/);
    });

    test('running state: no run button, AkLoader exists, icon has running class', async function (assert) {
      await render(hbs`
        <KnoxIq::StatusCard
          @title='KnoxIQ'
          @subtitle='Running...'
          @state='running'
        />
      `);

      assert.dom('[data-test-knoxiq-status-card-runBtn]').doesNotExist();
      assert.dom('[data-test-ak-loader]').exists();

      assert
        .dom('[data-test-knoxiq-status-card-icon]')
        .hasClass(/status-card-icon-running/);
    });

    test('completed state: no run button, contains completed text, icon has completed class', async function (assert) {
      await render(hbs`
        <KnoxIq::StatusCard
          @title='KnoxIQ'
          @subtitle='Analysis done'
          @state='completed'
        />
      `);

      assert.dom('[data-test-knoxiq-status-card-runBtn]').doesNotExist();
      assert.dom().containsText(t('completed'));

      assert
        .dom('[data-test-knoxiq-status-card-icon]')
        .hasClass(/status-card-icon-completed/);
    });

    test('failed state: no run button, no ak-loader, icon has failed class, title/subtitle text', async function (assert) {
      this.title = t('knoxIq.statusCard.failedTitle');
      this.subtitle = t('knoxIq.statusCard.failedSubtitle');

      await render(hbs`
        <KnoxIq::StatusCard
          @title={{this.title}}
          @subtitle={{this.subtitle}}
          @state='failed'
        />
      `);

      assert.dom('[data-test-knoxiq-status-card-runBtn]').doesNotExist();
      assert.dom('[data-test-ak-loader]').doesNotExist();

      assert
        .dom('[data-test-knoxiq-status-card-icon]')
        .hasClass(/status-card-icon-failed/);

      assert
        .dom('[data-test-knoxiq-status-card-title]')
        .containsText(t('knoxIq.statusCard.failedTitle'));

      assert
        .dom('[data-test-knoxiq-status-card-subtitle]')
        .containsText(t('knoxIq.statusCard.failedSubtitle'));
    });

    test('run button click fires @onRunKnoxiq action', async function (assert) {
      let fired = false;

      this.onRunKnoxiq = () => {
        fired = true;
      };

      await render(hbs`
        <KnoxIq::StatusCard
          @title='KnoxIQ'
          @subtitle='Run a scan'
          @state='active'
          @onRunKnoxiq={{this.onRunKnoxiq}}
        />
      `);

      await click('[data-test-knoxiq-status-card-runBtn]');

      assert.true(fired);
    });

    test('run button shows loading state after click', async function (assert) {
      this.onRunKnoxiq = () => {};

      await render(hbs`
        <KnoxIq::StatusCard
          @title='KnoxIQ'
          @subtitle='Run a scan'
          @state='active'
          @onRunKnoxiq={{this.onRunKnoxiq}}
        />
      `);

      assert.dom('[data-test-ak-button-loader]').doesNotExist();

      await click('[data-test-knoxiq-status-card-runBtn]');

      assert.dom('[data-test-ak-button-loader]').exists();
      assert.dom('[data-test-knoxiq-status-card-runBtn]').exists();
    });
  });
});
