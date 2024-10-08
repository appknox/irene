import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const dynamicScanStatusText = {
  '-1': 't:errored:()',
  0: 't:notStarted:()',
  1: 't:deviceInQueue:()',
  2: 't:deviceBooting:()',
  3: 't:deviceDownloading:()',
  4: 't:deviceInstalling:()',
  5: 't:deviceLaunching:()',
  6: 't:deviceHooking:()',
  7: 't:deviceReady:()',
  8: 't:deviceShuttingDown:()',
  9: 't:completed:()',
  10: 't:inProgress:()',
};

const dynamicScanStatusColor = {
  '-1': 'warn',
  0: 'secondary',
  1: 'warn',
  2: 'warn',
  3: 'warn',
  4: 'warn',
  5: 'warn',
  6: 'warn',
  7: 'warn',
  8: 'warn',
  9: 'success',
  10: 'info',
};

module(
  'Integration | Component | file-details/dynamic-scan/status-chip',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    // TODO: Unskip when full DAST feature is ready.
    test.skip(
      'it renders status chip for different dynamic scan status',
      [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      async function (assert, status) {
        const dynamicscan = this.server.create('dynamicscan', {
          id: '1',
          mode: 1,
          status,
          statusText: dynamicScanStatusText[status],
          ended_on: null,
          isDynamicStatusError: status === -1,
          isDynamicStatusInProgress:
            (status > 0 && status < 9) || status === 10,
          isRunning: status === 10,
        });

        const file = this.server.create('file', {
          id: '1',
          isDynamicDone: status === 9,
        });

        this.setProperties({
          file,
          dynamicscan,
        });

        await render(
          hbs`<FileDetails::DynamicScan::StatusChip
                @file={{this.file}}
                @dynamicScan={{this.dynamicscan}}
            />`
        );

        assert.dom('[data-test-fileDetails-dynamicScan-statusChip]').exists();

        const expectedText = dynamicScanStatusText[status];

        assert
          .dom('[data-test-fileDetails-dynamicScan-statusChip]')
          .hasText(expectedText);

        const expectedColor = dynamicScanStatusColor[status];

        assert
          .dom('[data-test-fileDetails-dynamicScan-statusChip]')
          .hasClass(RegExp(`ak-chip-color-${expectedColor}`));

        if (this.dynamicscan.isDynamicStatusInProgress) {
          assert
            .dom('[data-test-fileDetails-dynamicScan-statusChip-loader]')
            .exists();
        } else {
          assert
            .dom('[data-test-fileDetails-dynamicScan-statusChip-loader]')
            .doesNotExist();
        }
      }
    );
  }
);
