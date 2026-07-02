import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | knox-iq/status-chip', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  test('renders completed state with checkmark and label', async function (assert) {
    await render(hbs`<KnoxIq::StatusChip @state="completed" />`);

    assert.dom().containsText(t('completed'));
    assert.dom('[data-test-ak-loader]').doesNotExist();
  });

  test('renders running state with loader', async function (assert) {
    await render(hbs`<KnoxIq::StatusChip @state="running" />`);

    assert.dom('[data-test-ak-loader]').exists();
    assert.dom().containsText(t('knoxIq.statusChip.running'));
  });

  test('renders failed state with error label', async function (assert) {
    await render(hbs`<KnoxIq::StatusChip @state="failed" />`);

    assert.dom().containsText(t('knoxIq.statusChip.failed'));
    assert.dom('[data-test-ak-loader]').doesNotExist();
  });
});
