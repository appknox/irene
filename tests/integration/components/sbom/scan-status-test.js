import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { SbomScanStatus } from 'irene/models/sbom-scan';

module('Integration | Component | sbom/scan-status', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    const sbomScan = this.server.create('sbom-scan');

    const normalized = store.normalize('sbom-scan', sbomScan.toJSON());

    this.setProperties({
      sbomScan: store.push(normalized),
    });
  });

  test.each(
    'it renders the right scan status chip',
    [
      SbomScanStatus.PENDING,
      SbomScanStatus.IN_PROGRESS,
      SbomScanStatus.COMPLETED,
      SbomScanStatus.FAILED,
      null,
    ],
    async function (assert, status) {
      if (status) {
        this.sbomScan.status = status;
      } else {
        this.sbomScan = null;
      }

      await render(hbs`
        <Sbom::ScanStatus @sbomScan={{this.sbomScan}} />
      `);

      assert
        .dom('[data-test-sbom-scanStatus]')
        .exists()
        .hasClass(
          RegExp(
            `ak-chip-color-${status ? this.sbomScan.statusColor : 'default'}`
          )
        )
        .hasText(
          status ? this.sbomScan.statusValue : 't:chipStatus.neverInitiated:()'
        );
    }
  );
});
