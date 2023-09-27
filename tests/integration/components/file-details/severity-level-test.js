import { find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module(
  'Integration | Component | file-details/severity-level',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      this.server.createList('organization', 1);

      const store = this.owner.lookup('service:store');

      const profile = this.server.create('profile', { id: '100' });

      const file = this.server.create('file', {
        project: '1',
        profile: profile.id,
      });

      this.setProperties({
        file: store.push(store.normalize('file', file.toJSON())),
        store,
      });

      await this.owner.lookup('service:organization').load();
    });

    test.each(
      'it renders file-details/severity-level',
      [true, false],
      async function (assert, unknownAnalysisStatus) {
        this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
          return { id: req.params.id, status: unknownAnalysisStatus };
        });

        this.server.get('/profiles/:id', (schema, req) =>
          schema.profiles.find(`${req.params.id}`)?.toJSON()
        );

        await render(hbs`
            <FileDetails::SeverityLevel @file={{this.file}} />
        `);

        assert
          .dom('[data-test-fileDetailSeverityLevel-title]')
          .hasText('t:severityLevel:()');

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
          unknownAnalysisStatus && {
            value: this.file.countRiskUnknown,
            name: 't:untested:()',
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
