import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { VulnerabilitySeverity } from 'irene/models/sbom-scan-component-vulnerability';

const severityIconMap = {
  [VulnerabilitySeverity.CRITICAL]: 'warning',
  [VulnerabilitySeverity.HIGH]: 'trending-up',
  [VulnerabilitySeverity.MEDIUM]: 'view-stream',
  [VulnerabilitySeverity.LOW]: 'trending-down',
  [VulnerabilitySeverity.INFO]: 'info',
  [VulnerabilitySeverity.NONE]: 'block',
  [VulnerabilitySeverity.UNKNOWN]: 'help',
};

module(
  'Integration | Component | sbom/scan-details/component-details/vulnerabilities/severity',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    test.each(
      'it renders the right vulnerability severity data',
      Object.keys(severityIconMap),
      async function (assert, severity) {
        const modelName = 'sbom-scan-component-vulnerability-affect';
        const store = this.owner.lookup('service:store');

        const normalized = store.normalize(
          modelName,
          this.server.create(modelName).toJSON()
        );

        this.sbomScanComponentVulnerabilityAffect = store.push(normalized);

        this.sbomScanComponentVulnerabilityAffect.sbVulnerability.severity =
          severity;

        await render(hbs`
          <Sbom::ScanDetails::ComponentDetails::Vulnerabilities::Severity
            @sbomScanComponentVulnerability={{this.sbomScanComponentVulnerabilityAffect.sbVulnerability}}
          />
        `);

        assert
          .dom('[data-test-sbomScanComponentVulnerabilities-severity]')
          .exists()
          .hasClass(
            RegExp(
              `severity-chip-${this.sbomScanComponentVulnerabilityAffect.sbVulnerability.severityClass}`
            )
          )
          .hasText(
            this.sbomScanComponentVulnerabilityAffect.sbVulnerability
              .severityDisplayValue
          );
      }
    );
  }
);
