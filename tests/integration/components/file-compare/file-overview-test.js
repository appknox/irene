import { module, test } from 'qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { click, find, render, triggerEvent } from '@ember/test-helpers';

module(
  'Integration | Component | file-compare/file-overview',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      this.store = this.owner.lookup('service:store');

      const tags = [1, 2, 3, 4].map(() => this.server.create('tag').toJSON());
      const project = this.server.create('project');
      const vulnerabilities = this.server.createList('vulnerability', 7);
      const analyses = vulnerabilities.map((v) =>
        this.server.create('analysis', { vulnerability: v.id }).toJSON()
      );

      // File Model
      const file = this.server.create('file');
      const normalizedFile = this.store.normalize('file', {
        ...file.toJSON(),
        project: project.id,
        analyses,
        tags,
      });
      const fileModel = this.store.push(normalizedFile);

      // Profile Model
      const profile = this.server.create('profile');
      const normalizedProfile = this.store.normalize(
        'profile',
        profile.toJSON()
      );
      const profileModel = this.store.push(normalizedProfile);

      // Common test props
      this.setProperties({
        file: fileModel,
        profile: profileModel,
      });

      // Common server mocks
      this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
        return {
          id: req.params.id,
          status: true,
        };
      });

      this.server.get('/v2/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });
    });

    test('it renders', async function (assert) {
      await render(
        hbs`<FileCompare::FileOverview @file={{this.file}} @profileId={{this.profile.id}} />`
      );

      assert.dom('[data-test-fileCompare-fileOverview-root]').exists();
      assert.dom('[data-test-fileCompare-fileOverview-header]').exists();

      const fileIcon = find('[data-test-fileCompare-fileOverview-iconUrl]');

      assert.strictEqual(fileIcon?.getAttribute('src'), this.file?.iconUrl);

      assert
        .dom('[data-test-fileCompare-fileOverview-fileName]')
        .exists()
        .hasText(this.file.name);

      assert
        .dom('[data-test-fileCompare-fileOverview-packageName]')
        .exists()
        .hasText(`${this.file.project.get('packageName')}`);

      assert
        .dom('[data-test-fileCompare-fileOverview-selectCheckBox]')
        .exists();

      assert
        .dom('[data-test-fileCompare-fileOverview-openInNewTabLink]')
        .exists()
        .hasAttribute('href', new RegExp(this.file.id))
        .hasAttribute('target', '_blank');

      assert.dom('[data-test-fileCompare-fileOverview-icon]').exists();

      assert
        .dom('[data-test-fileCompare-fileOverview-version]')
        .exists()
        .containsText('t:version:()')
        .containsText(this.file.version);

      assert
        .dom('[data-test-fileCompare-fileOverview-versionCode]')
        .exists()
        .containsText('T:versionCode:()')
        .containsText(this.file.versionCode);

      assert.dom('[data-test-fileCompare-fileOverview-scanStatuses]').exists();

      assert
        .dom('[data-test-fileCompare-fileOverview-fileID]')
        .containsText('t:fileID:()')
        .containsText(this.file.id);

      assert.dom('[data-test-fileCompare-fileOverview-platformIcon]').exists();

      assert
        .dom(
          '[  data-test-fileCompare-fileOverview-severityCountChartAndValues]'
        )
        .exists();

      assert.dom('[data-test-fileCompare-fileOverview-chart]').exists();

      // Chart legend data was formulated from the file severity level counts
      const severityValues = [
        {
          value: this.file.countRiskCritical,
          name: 't:critical:()',
          severityType: 'critical',
        },
        {
          value: this.file.countRiskHigh,
          name: 't:high:()',
          severityType: 'high',
        },
        {
          value: this.file.countRiskMedium,
          name: 't:medium:()',
          severityType: 'medium',
        },
        {
          value: this.file.countRiskLow,
          name: 't:low:()',
          severityType: 'low',
        },
        {
          value: this.file.countRiskNone,
          name: 't:passed:()',
          severityType: 'passed',
        },
        {
          value: this.file.countRiskUnknown,
          name: 't:untested:()',
          severityType: 'none',
        },
      ];

      severityValues.forEach((st) => {
        const container = find(
          `[data-test-fileChart-severityCountGroup="${st.name}"]`
        );

        assert
          .dom(
            '[data-test-fileChartSeverityLevel-severityCountIndicator]',
            container
          )
          .hasClass(new RegExp(`severity-${st.severityType}`));

        assert
          .dom(
            '[data-test-fileChartSeverityLevel-severityCountName]',
            container
          )
          .hasText(st.name);

        assert
          .dom(
            '[data-test-fileChartSeverityLevel-severityCountValue]',
            container
          )
          .hasText(String(st.value));
      });

      // Tags test
      assert.dom('[data-test-fileCompare-fileOverview-tags]').exists();

      this.file.tags.forEach((tag) => {
        assert
          .dom(`[data-test-fileCompare-fileOverview-tag='${tag.name}']`)
          .exists()
          .hasText(tag.name);
      });
    });

    test('it hides fileOverview CTA elements', async function (assert) {
      this.set('hideCTAs', true);
      this.set('hideOpenInNewTabIcon', false);

      await render(
        hbs`<FileCompare::FileOverview 
            @hideCTAs={{this.hideCTAs}} 
            @file={{this.file}} 
            @profileId={{this.profile.id}}
            @hideOpenInNewTabIcon={{this.hideOpenInNewTabIcon}}
         />`
      );

      assert
        .dom('[data-test-fileCompare-fileOverview-selectCheckBox]')
        .doesNotExist();

      assert
        .dom('[data-test-fileCompare-fileOverview-openInNewTabLink]')
        .doesNotExist();

      this.set('hideCTAs', false);

      assert
        .dom('[data-test-fileCompare-fileOverview-selectCheckBox]')
        .exists();

      assert
        .dom('[data-test-fileCompare-fileOverview-openInNewTabLink]')
        .exists();

      this.set('hideOpenInNewTabIcon', true);

      assert
        .dom('[data-test-fileCompare-fileOverview-selectCheckBox]')
        .exists();

      assert
        .dom('[data-test-fileCompare-fileOverview-openInNewTabLink]')
        .doesNotExist();
    });

    test('it checks and unchecks the overview select checkbox', async function (assert) {
      this.setProperties({
        selectedFile: null,
        onFileSelect: (fileId) => {
          this.set('selectedFile', fileId);
        },
      });

      await render(
        hbs`<FileCompare::FileOverview 
            @file={{this.file}} 
            @profileId={{this.profile.id}} 
            @isSelectedFile={{eq this.file.id this.selectedFile.id}}
            @onFileSelect={{this.onFileSelect}} 
          />`
      );

      assert.notEqual(this.selectedFile?.id, this.file.id);

      assert
        .dom('[data-test-fileCompare-fileOverview-selectCheckBox]')
        .exists()
        .isNotChecked();

      await click('[data-test-fileCompare-fileOverview-selectCheckBox]');

      assert
        .dom('[data-test-fileCompare-fileOverview-selectCheckBox]')
        .isChecked();

      assert.strictEqual(this.selectedFile.id, this.file.id);
    });

    test('it shows file inactive icon if file is inactive', async function (assert) {
      this.file.isActive = false;

      await render(
        hbs`<FileCompare::FileOverview @file={{this.file}} @profileId={{this.profile.id}} />`
      );

      assert
        .dom('[data-test-fileCompare-fileOverview-fileInactiveIndicator]')
        .exists();

      const tooltipSelector =
        '[data-test-fileCompare-fileOverview-fileInactive-tooltip]';
      const tooltipContentSelector = '[data-test-ak-tooltip-content]';

      const fileInactiveTooltip = find(tooltipSelector);

      assert.dom(fileInactiveTooltip).exists();

      await triggerEvent(fileInactiveTooltip, 'mouseenter');

      assert.dom(tooltipContentSelector).exists().hasText('t:fileInactive:()');

      await triggerEvent(fileInactiveTooltip, 'mouseleave');

      assert.dom(tooltipContentSelector).doesNotExist();
    });

    test('it tests the various scan status states', async function (assert) {
      this.server.get('/v2/projects/:id', (schema, req) => {
        const project = schema.projects.find(req.params.id).toJSON();
        project.is_manual_scan_available = true;

        return project;
      });

      this.file.isActive = false;

      await render(
        hbs`<FileCompare::FileOverview @file={{this.file}} @profileId={{this.profile.id}} />`
      );

      // All scan statuses except manual scan
      const scanStatuses = [
        {
          name: 't:static:()',
          isDone: this.file.isStaticDone,
        },
        {
          name: 't:dynamic:()',
          isDone: this.file.isDynamicDone,
        },
        {
          name: 't:api:()',
          isDone: this.file.isApiDone,
        },
      ];

      scanStatuses.forEach((status) => {
        assert
          .dom(
            `[data-test-fileCompare-fileOverview-scanStatuses='${status.name}']`
          )
          .exists();

        const iconName = status.isDone ? /check-circle/ : /circle/;

        assert
          .dom(
            `[data-test-fileCompare-fileOverview-scanStatuses='${status.name}'] [data-test-fileCompare-fileOverview-scanStatus-icon]`
          )
          .hasClass(iconName);
      });

      // Test for manual scan status
      const manualScanContainerSelector =
        '[data-test-fileCompare-fileOverview-manualScanStatus]';

      assert.dom(manualScanContainerSelector).exists();

      if (this.file.isManualDone) {
        assert
          .dom(
            `${manualScanContainerSelector} [data-test-fileCompare-fileOverview-manualScanStatus-doneIcon]`
          )
          .hasClass(/check-circle/);
      } else {
        assert
          .dom(
            `${manualScanContainerSelector} [data-test-fileCompare-fileOverview-manualScanStatus-requestedPendingIcon]`
          )
          .hasClass(this.file.isManualRequested ? /timer/ : /circle/);
      }

      assert
        .dom('[data-test-fileCompare-fileOverview-manualScanStatus-name]')
        .hasText('t:manual:()');
    });

    test('it hides untested legend data for untested analyses if unknown analyis status is false.', async function (assert) {
      this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
        return {
          id: req.params.id,
          status: false,
        };
      });

      await render(
        hbs`<FileCompare::FileOverview @file={{this.file}} @profileId={{this.profile.id}} />`
      );

      const legendContainer =
        "[data-test-fileCompare-fileOverview-chartSeverity='t:untested:()']";

      assert.dom(legendContainer).doesNotExist();

      assert
        .dom(
          `${legendContainer} [data-test-fileCompare-fileOverview-chartSeverity-colorIndicator]`
        )
        .doesNotExist();

      assert
        .dom(
          `${legendContainer} [data-test-fileCompare-fileOverview-chartSeverityTitle]`
        )
        .doesNotExist();

      assert
        .dom(
          `${legendContainer} [data-test-fileCompare-fileOverview-chartSeverityCount]`
        )
        .doesNotExist();
    });

    test('it shows no tags message if file has no tags', async function (assert) {
      this.file.tags = [];

      await render(
        hbs`
        <FileCompare::FileOverview @file={{this.file}} @profileId={{this.profile.id}} />
        `
      );

      assert
        .dom('[data-test-fileCompare-fileOverview-tags-empty]')
        .exists()
        .hasText('t:fileCompare.noTagsMessage:()');
    });

    test('it renders yielded content', async function (assert) {
      await render(
        hbs`
        <FileCompare::FileOverview @file={{this.file}} @profileId={{this.profile.id}}>
          <AkButton data-test-yielded-content>Button</AkButton>
        </FileCompare::FileOverview>`
      );

      assert.dom('[data-test-yielded-content]').exists();
    });
  }
);
