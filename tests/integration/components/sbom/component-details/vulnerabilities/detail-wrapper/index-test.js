import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import {
  FindingExposure,
  ReachabilityVerdict,
} from 'irene/utils/sbom-reachability';

const explanationSelector =
  '[data-test-sbomComponentVulnerabilities-detailReachabilityExplanation]';

const insightLinkSelector =
  '[data-test-sbomComponentVulnerabilities-insightLink]';

const sectionSelectors = {
  reachability: '[data-test-sbomComponentVulnerabilities-detailReachability]',
  remediation: '[data-test-sbomRemediation]',
  versions:
    '[data-test-sbomComponentVulnerabilities-affectedFixedVersionTitle]',
  source: '[data-test-sbomComponentVulnerabilities-detailSourceTitle]',
};

const sectionsTemplate = hbs`
  <Sbom::ComponentDetails::Vulnerabilities::DetailWrapper
    @sbomVulnerabilityAudit={{this.sbomVulnerabilityAudit}}
    @sbomComponent={{this.sbomComponent}}
    @expanded={{true}}
    @showAdvisoryMeta={{this.showAdvisoryMeta}}
    @showReachability={{this.showReachability}}
  />
`;

const insightLinkTemplate = hbs`
  <Sbom::ComponentDetails::Vulnerabilities::DetailWrapper
    @sbomVulnerabilityAudit={{this.sbomVulnerabilityAudit}}
    @sbomComponent={{this.sbomComponent}}
    @showInsightLink={{this.showInsightLink}}
    as |dw|
  >
    <button
      data-test-detailWrapper-toggle
      type='button'
      {{on 'click' dw.collapsibleContentHandler}}
    >
      toggle
    </button>
  </Sbom::ComponentDetails::Vulnerabilities::DetailWrapper>
`;

module(
  'Integration | Component | sbom/component-details/vulnerabilities/detail-wrapper',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    test('it passes the component through so reachability names the app', async function (assert) {
      const store = this.owner.lookup('service:store');
      const sbProject = store.createRecord('sbom-project', { name: 'LeafPic' });
      const sbFile = store.createRecord('sbom-file', { sbProject });

      this.sbomComponent = store.createRecord('sbom-component', { sbFile });

      const audit = this.server.create('sbom-vulnerability-audit', {
        reachability: {
          verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
          target: 'Lcom/example/Parser;->parse()',
          blockers: [],
          witness_path: [],
        },
      });

      this.sbomVulnerabilityAudit = store.push(
        store.normalize('sbom-vulnerability-audit', audit.toJSON())
      );

      await render(hbs`
        <Sbom::ComponentDetails::Vulnerabilities::DetailWrapper
          @sbomVulnerabilityAudit={{this.sbomVulnerabilityAudit}}
          @sbomComponent={{this.sbomComponent}}
          as |dw|
        >
          <button
            data-test-detailWrapper-toggle
            type='button'
            {{on 'click' dw.collapsibleContentHandler}}
          >
            toggle
          </button>
        </Sbom::ComponentDetails::Vulnerabilities::DetailWrapper>
      `);

      await click('[data-test-detailWrapper-toggle]');

      assert.dom(explanationSelector).hasText(
        t('sbomModule.reachability.explanationNamed.reachable', {
          app: 'LeafPic',
        })
      );
    });

    module('reachability insight link', function (nestedHooks) {
      nestedHooks.beforeEach(function () {
        const store = this.owner.lookup('service:store');

        const sbProject = store.push({
          data: { id: '11', type: 'sbom-project', attributes: {} },
        });

        const sbFile = store.push({
          data: {
            id: '22',
            type: 'sbom-file',
            attributes: {},
            relationships: {
              sbProject: { data: { id: sbProject.id, type: 'sbom-project' } },
            },
          },
        });

        this.sbomComponent = store.push({
          data: {
            id: '33',
            type: 'sbom-component',
            attributes: {},
            relationships: {
              sbFile: { data: { id: sbFile.id, type: 'sbom-file' } },
            },
          },
        });

        this.pushAudit = (reachability) => {
          const json = this.server
            .create('sbom-vulnerability-audit', { reachability })
            .toJSON();

          json.sb_vulnerability = {
            ...json.sb_vulnerability,
            vulnerability_id: 'CVE-2020-36518',
          };

          this.sbomVulnerabilityAudit = store.push(
            store.normalize('sbom-vulnerability-audit', json)
          );
        };

        this.showInsightLink = true;
      });

      test('it links to the insight with the same segments and the vulnerability id', async function (assert) {
        this.pushAudit({
          verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
          blockers: [],
          witness_path: [],
        });

        await render(insightLinkTemplate);
        await click('[data-test-detailWrapper-toggle]');

        assert
          .dom(insightLinkSelector)
          .hasText(t('sbomModule.reachability.viewInsight'))
          .hasAttribute(
            'href',
            /\/sbom\/apps\/11\/scans\/22\/components\/33\/0\/insights\?vuln=CVE-2020-36518$/
          );
      });

      test('it reuses the parent id of the current component-details route', async function (assert) {
        const router = this.owner.lookup('service:router');
        const params = {
          sbom_project_id: '11',
          sbom_file_id: '22',
          sbom_component_id: '33',
          sbom_component_parent_id: '44',
        };

        Object.defineProperty(router, 'currentRoute', {
          configurable: true,
          value: {
            find: (predicate) => {
              const info = {
                name: 'authenticated.dashboard.sbom.component-details',
                params,
              };

              return predicate(info) ? info : undefined;
            },
          },
        });

        this.pushAudit({
          verdict: ReachabilityVerdict.UNKNOWN,
          blockers: [],
          witness_path: [],
        });

        await render(insightLinkTemplate);
        await click('[data-test-detailWrapper-toggle]');

        assert
          .dom(insightLinkSelector)
          .hasAttribute(
            'href',
            /\/components\/33\/44\/insights\?vuln=CVE-2020-36518$/
          );
      });

      test('it shows the link for an exposure without a verdict', async function (assert) {
        this.pushAudit({
          exposure: FindingExposure.POTENTIAL,
          blockers: [],
          witness_path: [],
        });

        await render(insightLinkTemplate);
        await click('[data-test-detailWrapper-toggle]');

        assert.dom(insightLinkSelector).exists();
      });

      test('it hides the link when the advisory has no reachability result', async function (assert) {
        this.pushAudit(null);

        await render(insightLinkTemplate);
        await click('[data-test-detailWrapper-toggle]');

        assert.dom('[data-test-sbomComponentVulnerabilities-detail]').exists();
        assert.dom(insightLinkSelector).doesNotExist();
      });

      test('it hides the link unless @showInsightLink is set', async function (assert) {
        this.pushAudit({
          verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
          blockers: [],
          witness_path: [],
        });

        this.showInsightLink = undefined;

        await render(insightLinkTemplate);
        await click('[data-test-detailWrapper-toggle]');

        assert.dom('[data-test-sbomComponentVulnerabilities-detail]').exists();
        assert.dom(insightLinkSelector).doesNotExist();
      });
    });

    module('section args', function (nestedHooks) {
      nestedHooks.beforeEach(function () {
        const store = this.owner.lookup('service:store');

        const json = this.server
          .create('sbom-vulnerability-audit', {
            reachability: {
              verdict: ReachabilityVerdict.CONFIRMED_REACHABLE,
              exposure: FindingExposure.CONFIRMED,
              target: 'Lcom/example/Parser;->parse()',
              blockers: [],
              witness_path: [],
            },
            versions: [
              {
                version: null,
                version_range: JSON.stringify({
                  version: '0',
                  less_than: '2.12.2',
                }),
              },
            ],
          })
          .toJSON();

        this.sbomVulnerabilityAudit = store.push(
          store.normalize('sbom-vulnerability-audit', json)
        );

        this.sbomComponent = store.createRecord('sbom-component', {
          name: 'xercesimpl',
          version: '2.12.0',
          bomRef: 'maven::xerces:xercesimpl',
          isDependency: false,
        });
      });

      test('it renders every section by default', async function (assert) {
        await render(sectionsTemplate);

        assert.dom(sectionSelectors.reachability).exists();
        assert.dom(sectionSelectors.remediation).exists();
        assert.dom(sectionSelectors.versions).exists();
        assert.dom(sectionSelectors.source).exists();
      });

      test('it hides reachability and remediation when @showReachability is false', async function (assert) {
        this.showReachability = false;

        await render(sectionsTemplate);

        assert.dom(sectionSelectors.reachability).doesNotExist();
        assert.dom(sectionSelectors.remediation).doesNotExist();
        assert.dom(sectionSelectors.versions).exists();
        assert.dom(sectionSelectors.source).exists();
      });

      test('it hides versions and source when @showAdvisoryMeta is false', async function (assert) {
        this.showAdvisoryMeta = false;

        await render(sectionsTemplate);

        assert.dom(sectionSelectors.versions).doesNotExist();
        assert.dom(sectionSelectors.source).doesNotExist();
        assert.dom(sectionSelectors.reachability).exists();
      });
    });
  }
);
