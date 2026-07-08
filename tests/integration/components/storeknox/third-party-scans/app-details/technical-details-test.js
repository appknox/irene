import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module(
  'Integration | Component | storeknox/third-party-scans/app-details/technical-details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');

      const skApp = this.server.create('sk-third-party-app', {
        findings: [
          {
            rule_id: 'rule-2',
            name: 'Cleartext Traffic',
            description: 'App allows cleartext traffic.',
            severity: 'medium',
            status: 'clean',
            category: 'sensitive_capabilities',
            details: [],
            checks: 'Checks for cleartext traffic configuration.',
            business_impact: 'Would allow traffic interception.',
            is_potential_risk: false,
          },
          {
            rule_id: 'rule-1',
            name: 'Insecure Storage',
            description: 'Sensitive data stored insecurely.',
            severity: 'high',
            status: 'triggered',
            category: 'sensitive_capabilities',
            details: ['Detail one', 'Detail two'],
            checks: 'Checks for the READ_CALL_LOG permission.',
            business_impact: 'May expose who was called and when.',
            is_potential_risk: true,
          },
          {
            rule_id: 'rule-3',
            name: 'Debug Flag',
            description: 'Debuggable flag check skipped.',
            severity: 'info',
            status: 'skipped',
            category: 'app_hardening',
            details: [],
            checks: '',
            business_impact: '',
            is_potential_risk: false,
          },
        ],
      });

      this.app = store.push(
        store.normalize('sk-third-party-app', skApp.toJSON())
      );
    });

    test('it renders the title, description and risk count chips', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::TechnicalDetails
          @app={{this.app}}
        />
      `);

      assert.dom(this.element).containsText(t('storeknox.technicalDetails'));

      assert
        .dom(this.element)
        .containsText(t('storeknox.technicalDetailsDescription'));

      const countChips = this.element.querySelectorAll(
        '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-riskCountChip]'
      );

      const chipLabels = Array.from(countChips).map((chip) =>
        chip.textContent.trim()
      );

      assert.deepEqual(chipLabels, [
        `${t('storeknox.thirdPartyFinding.potentialRisks')} 1`,
        `${t('storeknox.thirdPartyFinding.noRisksDetected')} 2`,
      ]);
    });

    test('it groups findings by category with potential risk counts', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::TechnicalDetails
          @app={{this.app}}
        />
      `);

      const headings = this.element.querySelectorAll(
        '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-categoryHeading]'
      );

      assert.strictEqual(headings.length, 2);

      assert.dom(headings[0]).containsText('Sensitive Capabilities');
      assert.dom(headings[0]).containsText('1 potential risk');

      assert.dom(headings[1]).containsText('App Hardening');
      assert.dom(headings[1]).containsText('0 potential risks');
    });

    test('it shows an info tooltip icon only for known categories', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::TechnicalDetails
          @app={{this.app}}
        />
      `);

      const icons = this.element.querySelectorAll(
        '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-categoryInfoIcon]'
      );

      // sensitive_capabilities has a description; app_hardening does not
      assert.strictEqual(icons.length, 1);
    });

    test('it renders a potential risk chip on each finding row, sorted by severity high to low within a category', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::TechnicalDetails
          @app={{this.app}}
        />
      `);

      const chips = this.element.querySelectorAll(
        '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-riskChip]'
      );

      assert.strictEqual(chips.length, 3);

      const chipLabels = Array.from(chips).map((chip) =>
        chip.textContent.trim()
      );

      // rule-1 (high, potential risk) sorts before rule-2 (medium, no risk)
      assert.deepEqual(chipLabels, [
        t('storeknox.thirdPartyFinding.potentialRisk'),
        t('storeknox.thirdPartyFinding.noRiskDetected'),
        t('storeknox.thirdPartyFinding.noRiskDetected'),
      ]);
    });

    test('it renders category groups expanded with finding names by default', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::TechnicalDetails
          @app={{this.app}}
        />
      `);

      assert.dom(this.element).containsText('Insecure Storage');
      assert.dom(this.element).containsText('Cleartext Traffic');
      assert.dom(this.element).containsText('Debug Flag');
    });

    test('it reveals checks, findings and business impact on expanding a finding', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::TechnicalDetails
          @app={{this.app}}
        />
      `);

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-findingChecks]'
        )
        .doesNotExist();

      await click(
        '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-findingSummary="rule-1"]'
      );

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-findingChecks]'
        )
        .hasText('Checks for the READ_CALL_LOG permission.');

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-findingBusinessImpact]'
        )
        .hasText('May expose who was called and when.');

      assert.dom(this.element).containsText('Detail one');
      assert.dom(this.element).containsText('Detail two');

      assert
        .dom(this.element)
        .containsText(t('storeknox.thirdPartyFinding.whatItChecks'));

      assert
        .dom(this.element)
        .containsText(t('storeknox.thirdPartyFinding.findings'));

      assert
        .dom(this.element)
        .containsText(t('storeknox.thirdPartyFinding.potentialBusinessImpact'));
    });

    test('it shows the description instead of business impact for findings with no potential risk', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::TechnicalDetails
          @app={{this.app}}
        />
      `);

      await click(
        '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-findingSummary="rule-2"]'
      );

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-findingChecks]'
        )
        .hasText('Checks for cleartext traffic configuration.');

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-findingBusinessImpact]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-findingDescription]'
        )
        .hasText('App allows cleartext traffic.');

      assert.dom(this.element).containsText(t('description'));
    });

    test('it hides the description for findings with potential risk', async function (assert) {
      await render(hbs`
        <Storeknox::ThirdPartyScans::AppDetails::TechnicalDetails
          @app={{this.app}}
        />
      `);

      await click(
        '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-findingSummary="rule-1"]'
      );

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-findingDescription]'
        )
        .doesNotExist();

      assert
        .dom(
          '[data-test-storeknoxThirdPartyScansAppDetailsTechnicalDetails-findingBusinessImpact]'
        )
        .hasText('May expose who was called and when.');
    });
  }
);
