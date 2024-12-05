import Service from '@ember/service';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { selectChoose } from 'ember-power-select/test-support';

import ENUMS from 'irene/enums';
import styles from 'irene/components/ak-select/index.scss';

const AkSelectClasses = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

class WindowStub extends Service {
  url = null;
  target = null;

  open(url, target) {
    this.url = url;
    this.target = target;
  }
}

// Checks status checkboxes correspondence
const assertStatusCheckBoxState = (assert, ssCheckboxSelector, checked) => {
  if (checked) {
    assert.dom(ssCheckboxSelector).isChecked();
  } else {
    assert.dom(ssCheckboxSelector).isNotChecked();
  }
};

// Test body
module(
  'Integration | Component | security/file-details-actions',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      // Services
      this.owner.register('service:browser/window', WindowStub);

      const window = this.owner.lookup('service:browser/window');
      const store = this.owner.lookup('service:store');

      // Server Mocks
      this.server.get('/hudson-api/projects/:id', (schema, req) => {
        return schema['security/projects'].find(`${req.params.id}`)?.toJSON();
      });

      this.server.get('/hudson-api/projects', () => {
        return new Response(200);
      });

      const secProj = this.server.create('security/project', {
        id: 1,
        is_manual_scan_available: true,
      });

      const secFile = this.server.create('security/file', {
        id: 1,
        project: secProj.id,
      });

      const secFileModel = store.push(
        store.normalize('security/file', secFile.toJSON())
      );

      this.setProperties({ secFileModel, secProj, window });
    });

    test('it renders file details actions', async function (assert) {
      await render(
        hbs`<Security::FileDetailsActions @file={{this.secFileModel}} />`
      );

      assert.dom('[data-test-securityFileDetailsActions-container]').exists();

      assert
        .dom('[data-test-securityFileDetailsActions-fileInfo]')
        .exists()
        .containsText(this.secFileModel.name)
        .containsText(this.secFileModel.id)
        .containsText(this.secProj.package_name);

      assert
        .dom(
          '[data-test-securityFileDetailsActions-originalAppFormatDownloadBtn]'
        )
        .exists()
        .containsText(`Original ${this.secFileModel.fileFormatDisplay}`);

      assert
        .dom('[data-test-securityFileDetailsActions-modAppFormatDownloadBtn]')
        .exists()
        .containsText('Resigned');

      assert
        .dom(
          '[data-test-securityFileDetailsActions-dashboardFilePageRedirectBtn]'
        )
        .exists()
        .containsText('Visit Dashboard');

      assert.dom('[data-test-securityAnalysisReportBtn-container]').exists();

      assert
        .dom('[data-test-securityFileDetailsActions-scanStatuses-container]')
        .exists()
        .containsText('Scan Statuses')
        .containsText(
          'Update the statuses of different scan types for this file'
        );

      assert
        .dom(
          '[data-test-securityFileDetailsActions-scanStatusesList-container]'
        )
        .exists();
    });

    test.each(
      'it downloads security file binaries',
      ['original', 'modified'],
      async function (assert, type) {
        const downloadURL = `https://www.fakedownload-${type}.com`;
        const isOriginalDownload = type === 'original';

        this.server.get(
          `/hudson-api/apps/:id${isOriginalDownload ? '' : `/${type}`}`,
          () => {
            return { url: downloadURL };
          }
        );

        await render(
          hbs`<Security::FileDetailsActions @file={{this.secFileModel}} />`
        );

        assert
          .dom(
            '[data-test-securityFileDetailsActions-originalAppFormatDownloadBtn]'
          )
          .exists();

        assert
          .dom('[data-test-securityFileDetailsActions-modAppFormatDownloadBtn]')
          .exists();

        if (isOriginalDownload) {
          await click(
            '[data-test-securityFileDetailsActions-originalAppFormatDownloadBtn]'
          );
        } else {
          await click(
            '[data-test-securityFileDetailsActions-modAppFormatDownloadBtn]'
          );
        }

        assert.strictEqual(this.window.url, downloadURL);
        assert.strictEqual(this.window.target, '_blank');
      }
    );

    test('it visits dashboard file page', async function (assert) {
      await render(
        hbs`<Security::FileDetailsActions @file={{this.secFileModel}} />`
      );

      assert
        .dom(
          '[data-test-securityFileDetailsActions-dashboardFilePageRedirectBtn]'
        )
        .exists();

      await click(
        '[data-test-securityFileDetailsActions-dashboardFilePageRedirectBtn]'
      );

      assert.ok(
        this.window.url.includes(`/dashboard/file/${this.secFileModel.id}`)
      );
    });

    test('it toggles file scan statuses', async function (assert) {
      assert.expect(11);

      const scanStatuses = [
        {
          label: 'Is API done',
          checked: this.secFileModel.isApiDone,
        },
        {
          label: 'Is Dynamic done',
          checked: this.secFileModel.isDynamicDone,
        },
      ];

      // Server mocks
      this.server.put('/hudson-api/files/:id', (schema, req) => {
        const reqBody = JSON.parse(req.requestBody);

        return {
          ...schema['security/files'].find(`${req.params.id}`)?.toJSON(),
          ...reqBody,
        };
      });

      await render(
        hbs`<Security::FileDetailsActions @file={{this.secFileModel}} />`
      );

      assert
        .dom(
          '[data-test-securityFileDetailsActions-scanStatusesList-container]'
        )
        .exists();

      for (let idx = 0; idx < scanStatuses.length; idx++) {
        const { label, checked } = scanStatuses[idx];

        assert
          .dom(
            `[data-test-securityFileDetailsActions-scanStatus-label='${label}']`
          )
          .exists()
          .containsText(label);

        const ssCheckboxSelector = `[data-test-securityFileDetailsActions-scanStatusCheckbox='${label}']`;

        assert.dom(ssCheckboxSelector).exists();

        assertStatusCheckBoxState(assert, ssCheckboxSelector, checked);

        await click(ssCheckboxSelector);

        assertStatusCheckBoxState(assert, ssCheckboxSelector, !checked);
      }
    });

    test('it modifies file manual scan status', async function (assert) {
      assert.expect();

      // Sets default as "Not Started"
      this.secFileModel.set('manual', ENUMS.MANUAL.NONE);

      const NEXT_SELECTED_STATUS = ENUMS.MANUAL.REQUESTED;

      const manualScanStatusLabels = {
        [ENUMS.MANUAL.NONE]: 'Not Started',
        [ENUMS.MANUAL.REQUESTED]: 'Requested',
        [ENUMS.MANUAL.ASSESSING]: 'In Progress',
        [ENUMS.MANUAL.DONE]: 'Completed',
      };

      // Server mocks
      this.server.put(`/hudson-api/files/:id`, (schema, req) => {
        const reqBody = JSON.parse(req.requestBody);

        assert.strictEqual(
          NEXT_SELECTED_STATUS,
          Number(reqBody.manual),
          'Sends correct status via the network'
        );

        return {
          ...schema['security/files'].find(`${req.params.id}`)?.toJSON(),
          ...reqBody,
        };
      });

      await render(
        hbs`<Security::FileDetailsActions @file={{this.secFileModel}} />`
      );

      assert
        .dom('[data-test-securityFileDetailsActions-manualScan-container]')
        .exists();

      const manualScanSelectTrigger = `[data-test-securityFileDetailsActions-manualScan-select] .${AkSelectClasses.trigger}`;

      // open status select
      await click(manualScanSelectTrigger);

      let manualScanSelectOptions = findAll('.ember-power-select-option');
      let selectedManualScanIdx = Object.keys(manualScanStatusLabels).indexOf(
        String(this.secFileModel.manual)
      );

      // Affirms "Not Started" is selected
      assert
        .dom(manualScanSelectOptions[selectedManualScanIdx])
        .hasAria('selected', 'true')
        .hasText(manualScanStatusLabels[selectedManualScanIdx]);

      await selectChoose(
        manualScanSelectTrigger,
        manualScanStatusLabels[NEXT_SELECTED_STATUS]
      );

      // open status select
      await click(manualScanSelectTrigger);

      // Affirms "Requested" is selected
      manualScanSelectOptions = findAll('.ember-power-select-option');
      selectedManualScanIdx = Object.keys(manualScanStatusLabels).indexOf(
        String(NEXT_SELECTED_STATUS)
      );

      assert
        .dom(manualScanSelectOptions[selectedManualScanIdx])
        .hasAria('selected', 'true')
        .hasText(manualScanStatusLabels[selectedManualScanIdx]);
    });
  }
);
