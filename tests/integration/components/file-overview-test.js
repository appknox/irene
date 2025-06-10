import { module, test } from 'qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { click, find, render, triggerEvent } from '@ember/test-helpers';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

module(
  'Integration | Component | file-compare/file-overview',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');
    setupMirage(hooks);

    hooks.beforeEach(async function () {
      const { file_risk_info } = setupFileModelEndpoints(this.server);

      this.store = this.owner.lookup('service:store');

      const tags = [1, 2, 3, 4].map(() => this.server.create('tag').toJSON());
      const project = this.server.create('project', {
        show_unknown_analysis: true,
      });

      const vulnerabilities = this.server.createList('vulnerability', 7);

      // Profile Model
      const profile = this.server.create('profile');

      const normalizedProfile = this.store.normalize(
        'profile',
        profile.toJSON()
      );

      const profileModel = this.store.push(normalizedProfile);

      // File Model
      const file = this.server.create('file');

      const normalizedFile = this.store.normalize('file', {
        ...file.toJSON(),
        project: project.id,
        profile: profile.id,
        tags,
      });

      vulnerabilities.map((v) =>
        this.server.create('analysis', { vulnerability: v.id, file: file.id })
      );

      const fileModel = this.store.push(normalizedFile);

      // Common test props
      this.setProperties({
        file: fileModel,
        profile: profileModel,
        file_risk_info,
      });

      this.server.get('/v3/projects/:id', (schema, req) => {
        return schema.projects.find(req.params.id).toJSON();
      });
    });

    test('it renders', async function (assert) {
      await render(hbs`<FileOverview @file={{this.file}} />`);

      assert.dom('[data-test-fileOverview-root]').exists();
      assert.dom('[data-test-fileOverview-header]').exists();

      const fileIcon = find('[data-test-appLogo-img]');

      assert.strictEqual(fileIcon?.getAttribute('src'), this.file?.iconUrl);

      assert
        .dom('[data-test-fileOverview-fileName]')
        .exists()
        .hasText(this.file.name);

      assert
        .dom('[data-test-fileOverview-packageName]')
        .exists()
        .hasText(`${this.file.project.get('packageName')}`);

      assert.dom('[data-test-fileOverview-selectCheckBox]').exists();

      assert
        .dom('[data-test-fileOverview-openInNewTabLink]')
        .exists()
        .hasAttribute('href', new RegExp(this.file.id))
        .hasAttribute('target', '_blank');

      assert.dom('[data-test-fileOverview-icon]').exists();

      assert
        .dom('[data-test-fileOverview-version]')
        .exists()
        .containsText(t('version'))
        .containsText(this.file.version);

      assert
        .dom('[data-test-fileOverview-versionCodeText]')
        .exists()
        .containsText(`${t('versionCodeTitleCase')} -`);

      assert
        .dom('[data-test-fileOverview-versionCode]')
        .exists()
        .containsText(this.file.versionCode);

      assert.dom('[data-test-fileOverview-scanStatuses]').exists();

      assert
        .dom('[data-test-fileOverview-fileID-text]')
        .containsText(`${t('fileID')} -`);

      assert.dom('[data-test-fileOverview-fileID]').containsText(this.file.id);

      assert.dom('[data-test-fileOverview-platformIcon]').exists();

      assert
        .dom('[  data-test-fileOverview-severityCountChartAndValues]')
        .exists();

      assert.dom('[data-test-fileOverview-chart]').exists();

      // Chart legend data was formulated from the file severity level counts
      const severityValues = [
        {
          value: this.file_risk_info.risk_count_critical,
          name: t('critical'),
          severityType: 'critical',
        },
        {
          value: this.file_risk_info.risk_count_high,
          name: t('high'),
          severityType: 'high',
        },
        {
          value: this.file_risk_info.risk_count_medium,
          name: t('medium'),
          severityType: 'medium',
        },
        {
          value: this.file_risk_info.risk_count_low,
          name: t('low'),
          severityType: 'low',
        },
        {
          value: this.file_risk_info.risk_count_passed,
          name: t('passed'),
          severityType: 'passed',
        },
        {
          value: this.file_risk_info.risk_count_unknown,
          name: t('untested'),
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
      assert.dom('[data-test-fileOverview-tags]').exists();

      this.file.tags.forEach((tag) => {
        assert
          .dom(`[data-test-fileOverview-tag='${tag.name}']`)
          .exists()
          .hasText(tag.name);
      });
    });

    test('it hides fileOverview CTA elements', async function (assert) {
      this.set('hideCTAs', true);
      this.set('hideOpenInNewTabIcon', false);

      await render(
        hbs`<FileOverview
            @hideCTAs={{this.hideCTAs}}
            @file={{this.file}}
            @hideOpenInNewTabIcon={{this.hideOpenInNewTabIcon}}
         />`
      );

      assert.dom('[data-test-fileOverview-selectCheckBox]').doesNotExist();

      assert.dom('[data-test-fileOverview-openInNewTabLink]').doesNotExist();

      this.set('hideCTAs', false);

      assert.dom('[data-test-fileOverview-selectCheckBox]').exists();

      assert.dom('[data-test-fileOverview-openInNewTabLink]').exists();

      this.set('hideOpenInNewTabIcon', true);

      assert.dom('[data-test-fileOverview-selectCheckBox]').exists();

      assert.dom('[data-test-fileOverview-openInNewTabLink]').doesNotExist();
    });

    test('it checks and unchecks the overview select checkbox', async function (assert) {
      this.setProperties({
        selectedFile: null,
        onFileSelect: (fileId) => {
          this.set('selectedFile', fileId);
        },
      });

      await render(
        hbs`<FileOverview
            @file={{this.file}}
            @isSelectedFile={{eq this.file.id this.selectedFile.id}}
            @onFileSelect={{this.onFileSelect}}
          />`
      );

      assert.notEqual(this.selectedFile?.id, this.file.id);

      assert
        .dom('[data-test-fileOverview-selectCheckBox]')
        .exists()
        .isNotChecked();

      await click('[data-test-fileOverview-selectCheckBox]');

      assert.dom('[data-test-fileOverview-selectCheckBox]').isChecked();

      assert.strictEqual(this.selectedFile.id, this.file.id);
    });

    test('it shows file inactive icon if file is inactive', async function (assert) {
      this.file.isActive = false;

      await render(hbs`<FileOverview @file={{this.file}} />`);

      assert.dom('[data-test-fileOverview-fileInactiveIndicator]').exists();

      const tooltipSelector = '[data-test-fileOverview-fileInactive-tooltip]';
      const tooltipContentSelector = '[data-test-ak-tooltip-content]';

      const fileInactiveTooltip = find(tooltipSelector);

      assert.dom(fileInactiveTooltip).exists();

      await triggerEvent(fileInactiveTooltip, 'mouseenter');

      assert.dom(tooltipContentSelector).exists().hasText(t('fileInactive'));

      await triggerEvent(fileInactiveTooltip, 'mouseleave');

      assert.dom(tooltipContentSelector).doesNotExist();
    });

    test('it tests the various scan status states', async function (assert) {
      this.server.get('/v3/projects/:id', (schema, req) => {
        const project = schema.projects.find(req.params.id).toJSON();
        project.is_manual_scan_available = true;

        return project;
      });

      this.file.isActive = false;

      await render(hbs`<FileOverview @file={{this.file}} />`);

      // All scan statuses except manual scan
      const scanStatuses = [
        {
          name: t('static'),
          isDone: this.file.isStaticDone,
        },
        {
          name: t('dynamic'),
          isDone: this.file.isDynamicDone,
        },
        {
          name: t('api'),
          isDone: this.file.isApiDone,
        },
      ];

      scanStatuses.forEach((status) => {
        assert
          .dom(`[data-test-fileOverview-scanStatuses='${status.name}']`)
          .exists();

        const iconName = status.isDone ? 'check-circle' : 'circle-outline';

        assert
          .dom(
            `[data-test-fileOverview-scanStatuses='${status.name}'] [data-test-fileOverview-scanStatus-icon]`
          )
          .hasAttribute('icon', `material-symbols:${iconName}`);
      });

      // Test for manual scan status
      const manualScanContainerSelector =
        '[data-test-fileOverview-manualScanStatus]';

      assert.dom(manualScanContainerSelector).exists();

      if (this.file.isManualDone) {
        assert
          .dom(
            `${manualScanContainerSelector} [data-test-fileOverview-manualScanStatus-doneIcon]`
          )
          .hasAttribute('icon', 'material-symbols:check-circle');
      } else {
        assert
          .dom(
            `${manualScanContainerSelector} [data-test-fileOverview-manualScanStatus-requestedPendingIcon]`
          )
          .hasAttribute(
            'icon',
            this.file.isManualRequested
              ? 'material-symbols:timer'
              : 'material-symbols:circle-outline'
          );
      }

      assert
        .dom('[data-test-fileOverview-manualScanStatus-name]')
        .hasText(t('manual'));
    });

    test('it hides untested legend data for untested analyses if unknown analyis status is false.', async function (assert) {
      this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
        return {
          id: req.params.id,
          status: false,
        };
      });

      await render(hbs`<FileOverview @file={{this.file}} />`);

      const legendContainer = `[data-test-fileOverview-chartSeverity="${t('untested')}"]`;

      assert.dom(legendContainer).doesNotExist();

      assert
        .dom(
          `${legendContainer} [data-test-fileOverview-chartSeverity-colorIndicator]`
        )
        .doesNotExist();

      assert
        .dom(`${legendContainer} [data-test-fileOverview-chartSeverityTitle]`)
        .doesNotExist();

      assert
        .dom(`${legendContainer} [data-test-fileOverview-chartSeverityCount]`)
        .doesNotExist();
    });

    test('it shows no tags message if file has no tags', async function (assert) {
      this.file.tags = [];

      await render(
        hbs`
        <FileOverview @file={{this.file}} />
        `
      );

      assert
        .dom('[data-test-fileOverview-tags-empty]')
        .exists()
        .hasText(t('fileCompare.noTagsMessage'));
    });

    test('it renders yielded content', async function (assert) {
      await render(
        hbs`
        <FileOverview @file={{this.file}}>
          <AkButton data-test-yielded-content>Button</AkButton>
        </FileOverview>`
      );

      assert.dom('[data-test-yielded-content]').exists();
    });
  }
);
