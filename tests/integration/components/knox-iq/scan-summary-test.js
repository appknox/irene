import { find, render, waitFor } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import Service from '@ember/service';

import { setupFileExploitabilityMirageEndpoint } from 'irene/tests/helpers/knoxiq-test-utils';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

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

module('Integration | Component | knox-iq/scan-summary', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    this.server.createList('organization', 1);
    this.owner.register('service:notifications', NotificationsStub);

    const store = this.owner.lookup('service:store');
    const project = this.server.create('project', { id: '1' });
    const profile = this.server.create('profile');
    const file = this.server.create('file', { project: project.id });

    this.file = store.push(
      store.normalize('file', {
        ...file.toJSON(),
        project: project.id,
        profile: profile.id,
      })
    );

    const { file_risk_info } = setupFileModelEndpoints(this.server);

    this.file_risk_info = file_risk_info;

    this.server.get('/v3/projects/:id', (schema, req) => ({
      id: req.params.id,
    }));

    await this.owner.lookup('service:organization').load();
  });

  test('shows pending accent when no scan has completed', async function (assert) {
    setupFileExploitabilityMirageEndpoint(this.server, {
      exploitability_count_high: 3,
      exploitability_count_medium: 1,
      exploitability_count_low: 5,
      exploitability_count_passed: 0,
      exploitability_count_unknown: 0,
    });

    await render(hbs`
      <KnoxIq::ScanSummary
        @file={{this.file}}
        @hasAnyKnoxiqScanCompleted={{false}}
      />
    `);

    assert.dom('[data-test-knoxiq-scan-summary]').exists();

    assert.ok(
      find('[data-test-knoxiq-scan-summary-accent]')?.className.includes(
        'pending'
      ),
      'accent bar class should contain "pending"'
    );
  });

  test('shows done accent when at least one scan has completed', async function (assert) {
    setupFileExploitabilityMirageEndpoint(this.server, {
      exploitability_count_high: 1,
      exploitability_count_medium: 0,
      exploitability_count_low: 0,
      exploitability_count_passed: 0,
      exploitability_count_unknown: 0,
    });

    await render(hbs`
      <KnoxIq::ScanSummary
        @file={{this.file}}
        @hasAnyKnoxiqScanCompleted={{true}}
      />
    `);

    assert.ok(
      find('[data-test-knoxiq-scan-summary-accent]')?.className.includes(
        'done'
      ),
      'accent bar class should contain "done"'
    );
  });

  test('displays correct exploitability counts from the API', async function (assert) {
    setupFileExploitabilityMirageEndpoint(this.server, {
      exploitability_count_high: 4,
      exploitability_count_medium: 2,
      exploitability_count_low: 7,
      exploitability_count_passed: 0,
      exploitability_count_unknown: 0,
    });

    await render(hbs`
      <KnoxIq::ScanSummary
        @file={{this.file}}
        @hasAnyKnoxiqScanCompleted={{false}}
      />
    `);

    await waitFor(
      '[data-test-knoxiq-scan-summary-exploitability-count="high"]',
      { timeout: 5000 }
    );

    assert
      .dom('[data-test-knoxiq-scan-summary-exploitability-count="high"]')
      .includesText('04');

    assert
      .dom('[data-test-knoxiq-scan-summary-exploitability-count="medium"]')
      .includesText('02');

    assert
      .dom('[data-test-knoxiq-scan-summary-exploitability-count="low"]')
      .includesText('07');
  });

  test('displays severity counts from file-risk data', async function (assert) {
    setupFileExploitabilityMirageEndpoint(this.server);

    await render(hbs`
      <KnoxIq::ScanSummary
        @file={{this.file}}
        @hasAnyKnoxiqScanCompleted={{true}}
      />
    `);

    await waitFor('[data-test-knoxiq-scan-summary-severity-counts]', {
      timeout: 5000,
    });

    const criticalCount = String(
      this.file_risk_info.risk_count_critical
    ).padStart(2, '0');

    assert
      .dom('[data-test-knoxiq-scan-summary-severity-count="critical"]')
      .includesText(criticalCount);
  });
});
