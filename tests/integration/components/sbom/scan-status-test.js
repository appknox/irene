import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { SbomScanStatus } from 'irene/models/sbom-file';

module('Integration | Component | sbom/scan-status', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    const sbomFile = this.server.create('sbom-file');

    const normalized = store.normalize('sbom-file', sbomFile.toJSON());

    this.setProperties({
      sbomFile: store.push(normalized),
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
        this.sbomFile.status = status;
      } else {
        this.sbomFile = null;
      }

      await render(hbs`
        <Sbom::ScanStatus @sbomFile={{this.sbomFile}} />
      `);

      assert
        .dom('[data-test-sbom-scanStatus]')
        .exists()
        .hasClass(
          RegExp(
            `ak-chip-color-${status ? this.sbomFile.statusColor : 'default'}`
          )
        )
        .hasText(
          status ? this.sbomFile.statusValue : t('chipStatus.neverInitiated')
        );
    }
  );
});
