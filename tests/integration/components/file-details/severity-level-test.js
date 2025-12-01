import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

module(
  'Integration | Component | file-details/severity-level',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const { file_risk_info } = setupFileModelEndpoints(this.server);

      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const profile = this.server.create('profile', { id: '100' });

      const project = this.server.create('project', {
        id: '1',
        activeProfileId: profile.id,
      });

      const file = this.server.create('file', {
        project: project.id,
        profile: profile.id,
      });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        store,
        file_risk_info,
      });

      await this.owner.lookup('service:organization').load();
    });

    test.each(
      'it renders file-details/severity-level',
      [true, false],
      async function (assert, unknownAnalysisStatus) {
        this.server.get('/v3/projects/:id', (_, req) => {
          return {
            id: req.params.id,
            active_profile_id: '100',
            show_unknown_analysis: unknownAnalysisStatus,
          };
        });

        await render(hbs`
            <FileDetails::SeverityLevel @file={{this.file}} />
        `);

        assert
          .dom('[data-test-fileDetailSeverityLevel-title]')
          .hasText(t('severityLevel'));

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
          unknownAnalysisStatus && {
            value: this.file_risk_info.risk_count_unknown,
            name: t('untested'),
            severityType: 'none',
          },
        ].filter(Boolean);

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
      }
    );
  }
);
