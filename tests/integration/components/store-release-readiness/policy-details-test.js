import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, click, fillIn, findAll, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

import ENUMS from 'irene/enums';

const SEVERITY = ENUMS.STORE_RELEASE_FINDING_SEVERITY;

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

function pushFinding(test, attrs = {}) {
  const store = test.owner.lookup('service:store');

  const finding = test.server.create('store-release-readiness-finding', {
    title: 'Sample policy violation',
    category: 'Privacy',
    severity: SEVERITY.BLOCKER,
    passed: false,
    is_overridden: false,
    override_comment: null,
    evidence: 'Found unencrypted data at rest',
    remediation_steps: ['Encrypt the data', 'Rotate the key'],
    guideline_reference: 'https://example.test/policy',
    explanation: 'Plain explanation paragraph',
    source: 'Manifest.xml',
    field_checked: 'usesCleartextTraffic',
    expected: 'false',
    ...attrs,
  });

  return store.push(
    store.normalize('store-release-readiness-finding', finding.toJSON())
  );
}

function registerMe(test) {
  const store = test.owner.lookup('service:store');

  const orgMe = store.createRecord('organization-me', {
    is_admin: true,
    is_owner: true,
  });

  class MeStub extends Service {
    org = orgMe;
  }

  test.owner.register('service:me', MeStub);
}

function setAdmin(test, isAdmin) {
  const me = test.owner.lookup('service:me');

  me.org.is_admin = isAdmin;
  me.org.is_owner = isAdmin;
}

module(
  'Integration | Component | store-release-readiness/policy-details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.owner.register('service:notifications', NotificationsStub);
      registerMe(this);
    });

    test('it renders category and title from the finding', async function (assert) {
      this.set(
        'finding',
        pushFinding(this, {
          category: 'Security',
          title: 'Insecure network policy',
        })
      );

      await render(
        hbs`<StoreReleaseReadiness::PolicyDetails @finding={{this.finding}} />`
      );

      assert.dom('[data-test-store-release-readiness-policy-details]').exists();

      assert
        .dom('[data-test-store-release-readiness-policy-details-category]')
        .hasText('Security');

      assert
        .dom('[data-test-store-release-readiness-policy-details-title]')
        .hasText('Insecure network policy');
    });

    test.each(
      'it renders the right status chip for each finding state',
      [
        {
          name: 'failed + blocker → blocker severity chip',
          attrs: { passed: false, severity: SEVERITY.BLOCKER },
          expectedStatus: 'failed',
          expectedSeverityKey: 'storeReleaseReadiness.summaryBlocker',
        },
        {
          name: 'failed + warning → warning severity chip',
          attrs: { passed: false, severity: SEVERITY.WARNING },
          expectedStatus: 'failed',
          expectedSeverityKey: 'storeReleaseReadiness.summaryWarning',
        },
        {
          name: 'passed (not overridden)',
          attrs: { passed: true, is_overridden: false },
          expectedStatus: 'passed',
          expectedSeverityKey: null,
        },
        {
          name: 'passed + overridden → failed-to-pass arrow visible',
          attrs: {
            passed: true,
            is_overridden: true,
            override_comment: 'Accepted risk',
          },
          expectedStatus: 'passed',
          expectedSeverityKey: null,
          overridden: true,
        },
        {
          name: 'untested',
          attrs: { passed: null },
          expectedStatus: 'untested',
          expectedSeverityKey: null,
        },
      ],
      async function (
        assert,
        { attrs, expectedStatus, expectedSeverityKey, overridden }
      ) {
        this.set('finding', pushFinding(this, attrs));

        await render(
          hbs`<StoreReleaseReadiness::PolicyDetails @finding={{this.finding}} />`
        );

        assert
          .dom(
            `[data-test-store-release-readiness-assessment-status="${expectedStatus}"]`
          )
          .exists();

        if (expectedSeverityKey) {
          assert
            .dom('[data-test-store-release-readiness-assessment-severity]')
            .exists()
            .containsText(t(expectedSeverityKey));
        } else {
          assert
            .dom('[data-test-store-release-readiness-assessment-severity]')
            .doesNotExist('No severity chip for non-failed rows');
        }

        if (overridden) {
          assert
            .dom(
              '[data-test-store-release-readiness-assessment-status-failed-to-pass-icon]'
            )
            .exists('Overridden passed shows failed→pass arrow');
        }
      }
    );

    test.each(
      'it renders action chips based on admin role and finding state',
      [
        {
          name: 'admin + failed → failed-edit chip only',
          isAdmin: true,
          attrs: { passed: false, is_overridden: false },
          expectedChips: ['failed-edit'],
          notExpectedChips: ['override-description'],
        },
        {
          name: 'admin + overridden → override-description chip only',
          isAdmin: true,
          attrs: { passed: true, is_overridden: true },
          expectedChips: ['override-description'],
          notExpectedChips: ['failed-edit'],
        },
        {
          name: 'admin + plain passed → no chips',
          isAdmin: true,
          attrs: { passed: true, is_overridden: false },
          expectedChips: [],
          notExpectedChips: ['failed-edit', 'override-description'],
        },
        {
          name: 'non-admin + failed → no chips',
          isAdmin: false,
          attrs: { passed: false, is_overridden: false },
          expectedChips: [],
          notExpectedChips: ['failed-edit', 'override-description'],
        },
        {
          name: 'non-admin + overridden → no chips',
          isAdmin: false,
          attrs: { passed: true, is_overridden: true },
          expectedChips: [],
          notExpectedChips: ['failed-edit', 'override-description'],
        },
      ],
      async function (
        assert,
        { isAdmin, attrs, expectedChips, notExpectedChips }
      ) {
        setAdmin(this, isAdmin);

        this.set('finding', pushFinding(this, attrs));

        await render(
          hbs`<StoreReleaseReadiness::PolicyDetails @finding={{this.finding}} />`
        );

        for (const variant of expectedChips) {
          assert
            .dom(
              `[data-test-store-release-readiness-policy-details-action-chip="${variant}"]`
            )
            .exists(`Action chip "${variant}" rendered`);
        }

        for (const variant of notExpectedChips) {
          assert
            .dom(
              `[data-test-store-release-readiness-policy-details-action-chip="${variant}"]`
            )
            .doesNotExist(`Action chip "${variant}" not rendered`);
        }
      }
    );

    test('clicking the failed-edit chip opens the confirmation drawer and lets the admin override', async function (assert) {
      this.set(
        'finding',
        pushFinding(this, {
          passed: false,
          severity: SEVERITY.BLOCKER,
          is_overridden: false,
        })
      );

      let putBody = null;

      this.server.put(
        '/v2/store-release-readiness/findings/:id/override',
        (schema, req) => {
          putBody = JSON.parse(req.requestBody || '{}');

          const f = schema.storeReleaseReadinessFindings.find(
            String(req.params.id)
          );

          f?.update({
            passed: true,
            is_overridden: true,
            override_comment: putBody.comment,
          });

          return {};
        }
      );

      this.server.get(
        '/v2/store-release-readiness/findings/:id',
        (schema, req) => {
          const f = schema.storeReleaseReadinessFindings.find(
            String(req.params.id)
          );

          return f?.toJSON();
        }
      );

      await render(
        hbs`<StoreReleaseReadiness::PolicyDetails @finding={{this.finding}} />`
      );

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-drawer="confirmation"]'
        )
        .doesNotExist();

      await click(
        '[data-test-store-release-readiness-policy-details-action-chip="failed-edit"]'
      );

      const drawerSelector =
        '[data-test-store-release-readiness-policy-details-drawer="confirmation"]';

      assert.dom(drawerSelector).exists('Confirmation drawer is open');

      assert
        .dom(drawerSelector)
        .containsText(t('storeReleaseReadiness.overrideIgnoreConfirmPrompt'));

      assert
        .dom(
          `${drawerSelector} [data-test-store-release-readiness-policy-details-category]`
        )
        .hasText('Privacy');

      assert
        .dom(
          `${drawerSelector} [data-test-store-release-readiness-policy-details-title]`
        )
        .hasText('Sample policy violation');

      assert
        .dom(
          `${drawerSelector} [data-test-store-release-readiness-policy-details-override-reason-label]`
        )
        .hasText(t('reason'));

      assert
        .dom(
          `${drawerSelector} [data-test-store-release-readiness-policy-details-override-reason-input]`
        )
        .exists();

      assert
        .dom(
          `${drawerSelector} [data-test-store-release-readiness-policy-details-override-reason-save-button]`
        )
        .exists()
        .isDisabled('Save is disabled until reason is entered');

      assert
        .dom(
          `${drawerSelector} [data-test-store-release-readiness-policy-details-override-reason-cancel-button]`
        )
        .exists();

      await fillIn(
        `${drawerSelector} [data-test-store-release-readiness-policy-details-override-reason-input]`,
        'Accepting the risk for now'
      );

      assert
        .dom(
          `${drawerSelector} [data-test-store-release-readiness-policy-details-override-reason-save-button]`
        )
        .isNotDisabled();

      const notifications = this.owner.lookup('service:notifications');

      await click(
        `${drawerSelector} [data-test-store-release-readiness-policy-details-override-reason-save-button]`
      );

      await waitUntil(() => notifications.successMsg !== null, {
        timeout: 5000,
      });

      assert.deepEqual(
        putBody,
        { comment: 'Accepting the risk for now' },
        'Override PUT receives the trimmed comment'
      );

      assert.strictEqual(
        notifications.successMsg,
        t('storeReleaseReadiness.overrideIgnoreSuccess'),
        'Success notification fired'
      );
    });

    test('clicking the override-description chip opens the ignored drawer in read-only mode', async function (assert) {
      this.set(
        'finding',
        pushFinding(this, {
          passed: true,
          is_overridden: true,
          override_comment: 'Whitelisted by security review',
        })
      );

      await render(
        hbs`<StoreReleaseReadiness::PolicyDetails @finding={{this.finding}} />`
      );

      await click(
        '[data-test-store-release-readiness-policy-details-action-chip="override-description"]'
      );

      const drawerSelector =
        '[data-test-store-release-readiness-policy-details-drawer="ignored"]';

      assert.dom(drawerSelector).exists('Ignored drawer is open');

      assert
        .dom(drawerSelector)
        .doesNotIncludeText(
          t('storeReleaseReadiness.overrideIgnoreConfirmPrompt'),
          'Read-only ignored drawer does not show the confirm prompt'
        );

      assert
        .dom(
          `${drawerSelector} [data-test-store-release-readiness-policy-details-override-reason-value]`
        )
        .exists()
        .hasText('Whitelisted by security review');

      assert
        .dom(
          `${drawerSelector} [data-test-store-release-readiness-policy-details-override-reason-input]`
        )
        .doesNotExist('No editable input in read-only mode');

      assert
        .dom(
          `${drawerSelector} [data-test-store-release-readiness-policy-details-override-reason-save-button]`
        )
        .doesNotExist('No save button in read-only mode');

      assert
        .dom(
          `${drawerSelector} [data-test-store-release-readiness-policy-details-override-reason-cancel-button]`
        )
        .doesNotExist('No cancel button in read-only mode');
    });

    test('body content for failed (admin) renders structured explanation table and remediation', async function (assert) {
      this.set(
        'finding',
        pushFinding(this, {
          passed: false,
          severity: SEVERITY.BLOCKER,
          evidence: 'Found unencrypted data at rest',
          source: 'Manifest.xml',
          field_checked: 'usesCleartextTraffic',
          expected: 'false',
          explanation: 'Cleartext traffic must be disabled.',
          remediation_steps: ['Encrypt the data', 'Rotate the key'],
          guideline_reference: 'https://example.test/policy',
        })
      );

      await render(
        hbs`<StoreReleaseReadiness::PolicyDetails @finding={{this.finding}} />`
      );

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-intro-heading="violation"]'
        )
        .hasText(t('storeReleaseReadiness.violationDetails'));

      assert
        .dom('[data-test-store-release-readiness-policy-details-violation]')
        .hasText('Found unencrypted data at rest');

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-intro-heading="policyReference"]'
        )
        .hasText(t('storeReleaseReadiness.policyReference'));

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-policy-reference]'
        )
        .hasAttribute('href', 'https://example.test/policy');

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-evidence-heading]'
        )
        .hasText(t('storeReleaseReadiness.evidence'));

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-explanation-table]'
        )
        .exists();

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-explanation-row]'
        )
        .exists({ count: 5 });

      const values = findAll(
        '[data-test-store-release-readiness-policy-details-explanation-value]'
      );

      assert.strictEqual(values[0].textContent.trim(), 'Manifest.xml');
      assert.strictEqual(values[1].textContent.trim(), 'usesCleartextTraffic');
      assert.strictEqual(values[2].textContent.trim(), 'false');
      assert.strictEqual(
        values[3].textContent.trim(),
        'Found unencrypted data at rest'
      );
      assert.strictEqual(
        values[4].textContent.trim(),
        'Cleartext traffic must be disabled.'
      );

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-remediation-heading]'
        )
        .hasText(t('storeReleaseReadiness.remediation'));

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-remediation-step]'
        )
        .exists({ count: 2 });
    });

    test('body content for plain passed (no admin chips) hides the explanation table and remediation', async function (assert) {
      this.set(
        'finding',
        pushFinding(this, {
          passed: true,
          is_overridden: false,
          explanation: 'Everything looks good.',
          guideline_reference: 'https://example.test/policy',
        })
      );

      await render(
        hbs`<StoreReleaseReadiness::PolicyDetails @finding={{this.finding}} />`
      );

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-intro-heading="evidence"]'
        )
        .exists()
        .hasText(t('storeReleaseReadiness.evidence'));

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-intro-heading="violation"]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-intro-heading="policyReference"]'
        )
        .exists();

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-evidence-heading]'
        )
        .exists();

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-explanation-table]'
        )
        .doesNotExist(
          'Structured explanation table is hidden for plain passed'
        );

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-remediation-heading]'
        )
        .doesNotExist('Remediation section is hidden for plain passed');

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-action-chip="failed-edit"]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-store-release-readiness-policy-details-action-chip="override-description"]'
        )
        .doesNotExist();
    });
  }
);
