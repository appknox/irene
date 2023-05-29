import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { VulnerabilitySeverity } from 'irene/models/sbom-scan-component-vulnerability';

module(
  'Integration | Component | sbom/scan-details/component-details/vulnerabilities/cvss-score',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    test('it renders the right vulnerability cvss score data', async function (assert) {
      const modelName = 'sbom-scan-component-vulnerability-affect';
      const store = this.owner.lookup('service:store');

      const normalized = store.normalize(
        modelName,
        this.server.create(modelName).toJSON()
      );

      this.sbomScanComponentVulnerabilityAffect = store.push(normalized);

      await render(hbs`
        <Sbom::ScanDetails::ComponentDetails::Vulnerabilities::CvssScore
          @sbomScanComponentVulnerability={{this.sbomScanComponentVulnerabilityAffect.sbVulnerability}}
        />
      `);

      const isUnknown =
        this.sbomScanComponentVulnerabilityAffect.sbVulnerability.severity ===
        VulnerabilitySeverity.UNKNOWN;

      assert
        .dom('[data-test-sbomScanComponentVulnerabilities-cvssScore]')
        .exists()
        .hasText(
          isUnknown
            ? '-'
            : `${this.sbomScanComponentVulnerabilityAffect.sbVulnerability.score}`
        );
    });
  }
);
