import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { VulnerabilitySeverity } from 'irene/models/sbom-vulnerability';

module(
  'Integration | Component | sbom/component-details/vulnerabilities/cvss-score',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    test('it renders the right vulnerability cvss score data', async function (assert) {
      const modelName = 'sbom-vulnerability-audit';
      const store = this.owner.lookup('service:store');

      const normalized = store.normalize(
        modelName,
        this.server.create(modelName).toJSON()
      );

      this.sbomVulnerabilityAudit = store.push(normalized);

      await render(hbs`
        <Sbom::ComponentDetails::Vulnerabilities::CvssScore
          @sbomVulnerability={{this.sbomVulnerabilityAudit.sbVulnerability}}
        />
      `);

      const isUnknown =
        this.sbomVulnerabilityAudit.sbVulnerability.severity ===
        VulnerabilitySeverity.UNKNOWN;

      assert
        .dom('[data-test-sbomComponentVulnerabilities-cvssScore]')
        .exists()
        .hasText(
          isUnknown
            ? '-'
            : `${this.sbomVulnerabilityAudit.sbVulnerability.score}`
        );
    });
  }
);
