import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { FindingExposure } from 'irene/utils/sbom-reachability';

// ─── Selectors ───
const selectors = {
  root: '[data-test-sbomRemediation]',
  title: '[data-test-sbomRemediation-title]',
  toggle: '[data-test-sbomRemediation-toggle]',
  action: '[data-test-sbomRemediation-action]',
  body: '[data-test-sbomRemediation-body]',
  findTitle: '[data-test-sbomRemediation-findTitle]',
  findText: '[data-test-sbomRemediation-findText]',
  detailsToggle: '[data-test-sbomRemediation-detailsToggle]',
  substeps: '[data-test-sbomRemediation-substeps]',
  upgradeText: '[data-test-sbomRemediation-upgradeText]',
  transitiveUpgrade: '[data-test-sbomRemediation-transitiveUpgrade]',
  upgradeTitle: '[data-test-sbomRemediation-upgradeTitle]',
  chain: '[data-test-sbomRemediation-chain]',
  patchNote: '[data-test-sbomRemediation-patchNote]',
  cocoapodsCaution: '[data-test-sbomRemediation-cocoapodsCaution]',
  retestTitle: '[data-test-sbomRemediation-retestTitle]',
  retestRow: '[data-test-sbomRemediation-retestRow]',
  retestEntry: '[data-test-sbomRemediation-retestEntry]',
  retestCaller: '[data-test-sbomRemediation-retestCaller]',
  retestLib: '[data-test-sbomRemediation-retestLib]',
  coverage: '[data-test-sbomRemediation-coverage]',
  versionLink: '[data-test-sbomRemediation-versionLink]',
  version: '[data-test-sbomRemediation-version]',
  substep: (letter) => `[data-test-sbomRemediation-substep="${letter}"]`,
  chainLink: '[data-test-sbomRemediation-chainLink]',
  code: (id) => `[data-test-sbomRemediation-codeBlock="${id}"]`,
};

const expand = () => click(selectors.toggle);
const expandDetails = async () => {
  await expand();
  await click(selectors.detailsToggle);
};

const TEMPLATE = hbs`
  <Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Remediation
    @sbomVulnerabilityAudit={{this.audit}}
    @sbomComponent={{this.component}}
    @componentAudits={{this.componentAudits}}
  />
`;

// A range whose `less_than` is the first unaffected version.
const FIXED_AT = (version) => [
  {
    version: null,
    version_range: JSON.stringify({ version: '0', less_than: version }),
  },
];

module(
  'Integration | Component | sbom/component-details/vulnerabilities/detail-wrapper/remediation',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');

      this.buildAudit = (reachability, versions) =>
        store.push(
          store.normalize(
            'sbom-vulnerability-audit',
            this.server
              .create('sbom-vulnerability-audit', { reachability, versions })
              .toJSON()
          )
        );

      this.buildComponent = (attrs) =>
        store.createRecord('sbom-component', {
          name: 'xercesimpl',
          version: '2.12.0',
          bomRef: 'maven::xerces:xercesimpl',
          isDependency: false,
          ...attrs,
        });
    });

    test('it renders nothing when the finding is not reachable', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.NONE_OBSERVED },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
    });

    test('it renders nothing without a fix version', async function (assert) {
      // No usable range means nothing to bump to, so the section is withheld.
      this.audit = this.buildAudit({ exposure: FindingExposure.CONFIRMED }, []);
      this.component = this.buildComponent();

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
    });

    test('it renders for a potentially reachable finding', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.POTENTIAL },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);

      assert.dom(selectors.title).hasText(t('sbomModule.remediation.title'));
      assert.dom(selectors.action).hasText(
        t('sbomModule.remediation.action', {
          component: 'xercesimpl',
          current: '2.12.0',
        })
      );
      assert.dom(selectors.versionLink).hasText('2.12.2');

      await expand();

      assert
        .dom(selectors.findTitle)
        .hasText(t('sbomModule.remediation.steps.find'));
      assert
        .dom(selectors.findText)
        .hasText(t('sbomModule.remediation.find.maven'));
      assert
        .dom(selectors.upgradeTitle)
        .hasText(t('sbomModule.remediation.steps.upgrade'));
      assert.dom(selectors.upgradeText).hasText(
        t('sbomModule.remediation.upgradeBody', {
          component: 'xercesimpl',
          version: '2.12.2',
        })
      );
      assert
        .dom(selectors.coverage)
        .hasText(t('sbomModule.remediation.coverage.single'));
    });

    test('it is collapsed by default and toggles open and closed', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);

      assert.dom(selectors.toggle).hasAttribute('aria-expanded', 'false');
      assert.dom(selectors.body).doesNotExist();
      assert.dom(selectors.code('upgrade')).doesNotExist();

      await expand();

      assert.dom(selectors.toggle).hasAttribute('aria-expanded', 'true');
      assert.dom(selectors.body).exists();
      assert
        .dom(selectors.toggle)
        .hasAttribute(
          'aria-controls',
          this.element.querySelector(selectors.body).id
        );
      assert.dom(selectors.code('upgrade')).exists();

      await expand();

      assert.dom(selectors.toggle).hasAttribute('aria-expanded', 'false');
      assert.dom(selectors.body).doesNotExist();
    });

    test('the version link sits outside the toggle', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);

      // Following the link must never toggle the section.
      assert.dom(`${selectors.toggle} ${selectors.versionLink}`).doesNotExist();
      assert.dom(selectors.versionLink).exists();
    });

    test('the header omits the current version when it is unknown', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent({ version: null });

      await render(TEMPLATE);

      assert.dom(selectors.action).hasText(
        t('sbomModule.remediation.actionNoCurrent', {
          component: 'xercesimpl',
        })
      );
    });

    test('detailed steps are hidden until asked for', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);
      await expand();

      assert
        .dom(selectors.detailsToggle)
        .hasAttribute('aria-expanded', 'false')
        .hasText(t('sbomModule.remediation.showDetailedSteps'));
      assert.dom(selectors.substeps).doesNotExist();
      assert.dom(selectors.code('insight')).doesNotExist();

      await click(selectors.detailsToggle);

      assert
        .dom(selectors.detailsToggle)
        .hasAttribute('aria-expanded', 'true')
        .hasText(t('sbomModule.remediation.hideDetailedSteps'));
      assert.dom(selectors.substeps).exists();

      await click(selectors.detailsToggle);

      assert.dom(selectors.substeps).doesNotExist();
    });

    test('nothing is fabricated when the coordinate is missing', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent({ bomRef: null });

      await render(TEMPLATE);
      await expand();

      assert.dom(selectors.upgradeText).exists();
      assert.dom(selectors.code('upgrade')).doesNotExist();
      assert.dom(selectors.detailsToggle).doesNotExist();
      assert.dom(selectors.versionLink).doesNotExist();
      assert.dom(selectors.version).hasText('2.12.2');
    });

    test('it renders nothing without a component name', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent({ name: '' });

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
    });

    test('a transitive maven finding is pinned with a constraint', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent({
        isDependency: true,
        via: 'com.adobe.xmp/xmpcore',
        viaVersion: '5.1.0',
      });

      await render(TEMPLATE);
      await expand();

      assert.dom(selectors.findText).hasText(
        t('sbomModule.remediation.find.transitive', {
          component: 'xercesimpl',
          parent: 'com.adobe.xmp/xmpcore',
        })
      );
      assert.dom(selectors.transitiveUpgrade).includesText('xmpcore');
      assert.dom(selectors.chain).exists();

      const links = this.element.querySelectorAll(selectors.chainLink);

      assert.strictEqual(links.length, 2);
      assert.dom(links[0]).doesNotHaveClass(/chain-link-last/);
      assert.dom(links[1]).hasClass(/chain-link-last/);
      assert.dom(links[1]).hasText('xercesimpl');

      assert.dom(selectors.code('upgrade')).includesText('constraints');
      assert.dom(selectors.code('upgrade')).includesText('because');
      assert.dom(selectors.patchNote).exists();

      // The detailed walkthrough searches for the parent, not the component.
      await click(selectors.detailsToggle);

      assert.dom(selectors.substep('a')).includesText('xmpcore');
      assert.dom(selectors.code('declared')).includesText('xmpcore:5.1.0');
    });

    test('a direct maven finding is bumped in place', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);
      await expand();

      assert.dom(selectors.chain).doesNotExist();
      assert.dom(selectors.transitiveUpgrade).doesNotExist();
      assert.dom(selectors.code('upgrade')).doesNotIncludeText('constraints');
      assert
        .dom(selectors.code('upgrade'))
        .includesText('xerces:xercesimpl:2.12.2');
    });

    test('cocoapods carries its conflict caution', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('4.0.1')
      );
      this.component = this.buildComponent({
        name: 'AFNetworking',
        version: '4.0.0',
        bomRef: 'cocoapods::AFNetworking',
      });

      await render(TEMPLATE);
      await expand();

      assert
        .dom(selectors.findText)
        .hasText(t('sbomModule.remediation.find.cocoapods'));
      assert.dom(selectors.cocoapodsCaution).exists();
      assert.dom(selectors.code('upgrade')).includesText('pod update');
      // Gradle guidance must not leak into a pod.
      assert.dom(selectors.detailsToggle).doesNotExist();
    });

    test('retest lists the entry point when a witness exists', async function (assert) {
      this.audit = this.buildAudit(
        {
          exposure: FindingExposure.CONFIRMED,
          witness_path: [
            {
              caller: 'Lcom/example/MainActivity;->onCreate()',
              callee: 'Lxerces/Parser;->parse()',
            },
          ],
        },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);
      await expand();

      assert
        .dom(selectors.retestTitle)
        .hasText(t('sbomModule.remediation.steps.retest'));
      assert.dom(selectors.retestEntry).hasText('MainActivity.onCreate()');
    });

    test('maven detailed steps are lettered a to d with keyboard shortcuts', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);
      await expandDetails();

      ['a', 'b', 'c', 'd'].forEach((letter) =>
        assert.dom(selectors.substep(letter)).exists()
      );
      assert.dom(selectors.substep('e')).doesNotExist();

      assert.dom(`${selectors.substep('a')} kbd`).exists({ count: 2 });
      assert.dom(`${selectors.substep('a')} kbd`).hasText('Ctrl+F');
      assert
        .dom(selectors.code('declared'))
        .includesText('xerces:xercesimpl:2.12.0');
      assert
        .dom(selectors.substep('b'))
        .includesText(t('sbomModule.remediation.maven.catalogTitle'));
      assert.dom(selectors.substep('b')).includesText('libs.versions.toml');
      assert.dom(selectors.substep('b')).includesText('libs.xercesimpl');
      assert
        .dom(`${selectors.substep('c')} ${selectors.code('insight')}`)
        .exists();
      assert.dom(selectors.substep('d')).includesText('import xerces');
    });

    test('non-maven ecosystems have no lettered sub-steps', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('1.2.6')
      );
      this.component = this.buildComponent({
        name: 'minimist',
        version: '1.2.5',
        bomRef: 'npm::minimist',
      });

      await render(TEMPLATE);
      await expand();

      assert
        .dom(selectors.findText)
        .hasText(t('sbomModule.remediation.find.npm'));
      assert.dom(selectors.detailsToggle).doesNotExist();
      assert.dom(selectors.substep('a')).doesNotExist();
      assert.dom(selectors.versionLink).doesNotExist();
      assert.dom(selectors.version).hasText('1.2.6');
    });

    test('a maven fix version links to Maven Central', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);

      assert.dom(selectors.versionLink).hasText('2.12.2');
      assert
        .dom(selectors.versionLink)
        .hasAttribute(
          'href',
          'https://central.sonatype.com/artifact/xerces/xercesimpl/2.12.2'
        )
        .hasAttribute('target', '_blank')
        .hasAttribute('rel', 'noopener noreferrer');
    });

    test('one upgrade covers every vulnerability of the component', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.12.1')
      );
      const other = this.buildAudit(
        { exposure: FindingExposure.NONE_OBSERVED },
        FIXED_AT('2.12.10')
      );
      this.component = this.buildComponent();
      this.componentAudits = [this.audit, other];

      await render(TEMPLATE);
      await expand();

      // 2.12.10 is higher than 2.12.1; a string compare would pick 2.12.1.
      assert.dom(selectors.versionLink).hasText('2.12.10');
      assert
        .dom(selectors.coverage)
        .includesText(
          t('sbomModule.remediation.ownFix', { version: '2.12.1' })
        );
      assert
        .dom(selectors.coverage)
        .includesText(t('sbomModule.remediation.coverage.all', { count: 2 }));
      assert
        .dom(selectors.code('upgrade'))
        .includesText('xerces:xercesimpl:2.12.10');
    });

    test('coverage reports vulnerabilities the upgrade cannot fix', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.12.2')
      );
      const unfixed = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        []
      );
      this.component = this.buildComponent();
      this.componentAudits = [this.audit, unfixed];

      await render(TEMPLATE);
      await expand();

      assert.dom(selectors.coverage).hasText(
        t('sbomModule.remediation.coverage.partial', {
          fixed: 1,
          total: 2,
        })
      );
    });

    test('retest shows entry, app caller and library', async function (assert) {
      this.audit = this.buildAudit(
        {
          exposure: FindingExposure.CONFIRMED,
          witness_path: [
            {
              caller: 'Lcom/example/SettingsActivity;->onCreate()V',
              callee: 'Lcom/example/BackupHelper;->restore()V',
            },
            {
              caller: 'Lcom/example/BackupHelper;->restore()V',
              callee: 'Lorg/apache/commons/text/StringSubstitutor;->replace()V',
            },
            {
              caller: 'Lorg/apache/commons/text/StringSubstitutor;->replace()V',
              callee:
                'Lorg/apache/commons/text/lookup/ScriptStringLookup;->lookup()V',
            },
          ],
        },
        FIXED_AT('1.10.0')
      );
      // The maven group is the Java package prefix, so the library is found.
      this.component = this.buildComponent({
        name: 'commons-text',
        version: '1.9',
        bomRef: 'maven::org.apache.commons:commons-text',
      });

      await render(TEMPLATE);
      await expand();

      assert.dom(selectors.retestRow).exists({ count: 1 });
      assert.dom(selectors.retestEntry).hasText('SettingsActivity.onCreate()');
      assert.dom(selectors.retestCaller).hasText('BackupHelper.restore()');
      assert.dom(selectors.retestLib).hasText('commons-text 1.9');
    });

    test('retest guesses no app caller when the group is not the package', async function (assert) {
      // xercesImpl: group `xerces`, classes in `org.apache.xerces`.
      this.audit = this.buildAudit(
        {
          exposure: FindingExposure.CONFIRMED,
          witness_path: [
            {
              caller: 'Lcom/example/SettingsActivity;->onCreate()V',
              callee: 'Lcom/example/BackupHelper;->restore()V',
            },
            {
              caller: 'Lcom/example/BackupHelper;->restore()V',
              callee: 'Lorg/apache/xerces/parsers/DOMParser;->parse()V',
            },
            {
              caller: 'Lorg/apache/xerces/parsers/DOMParser;->parse()V',
              callee: 'Lorg/apache/xerces/impl/XMLScanner;->scan()V',
            },
          ],
        },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);
      await expand();

      assert.dom(selectors.retestRow).exists({ count: 1 });
      assert.dom(selectors.retestEntry).hasText('SettingsActivity.onCreate()');
      assert.dom(selectors.retestCaller).doesNotExist();
      assert.dom(selectors.retestLib).hasText('xercesimpl 2.12.0');
    });

    test('remediation shows for a reachable verdict without an exposure', async function (assert) {
      this.audit = this.buildAudit(
        { verdict: 'REACHABLE' },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);

      assert.dom(selectors.root).exists();
    });

    test('remediation is withheld when no fix is above the version in use', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.CONFIRMED },
        FIXED_AT('2.11.0')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
    });

    test('retest prefers the last APP-owned frame as the caller', async function (assert) {
      this.audit = this.buildAudit(
        {
          exposure: FindingExposure.CONFIRMED,
          witness_nodes: [
            { signature: 'com.example.App.onCreate()', owner: { kind: 'APP' } },
            { signature: 'com.example.Cache.init()', owner: { kind: 'APP' } },
            { signature: 'okio.Buffer.read()', owner: { kind: 'COMPONENT' } },
            {
              signature: 'xerces.impl.Parser.parse()',
              owner: { kind: 'COMPONENT' },
            },
          ],
        },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);
      await expand();

      assert.dom(selectors.retestEntry).hasText('App.onCreate()');
      assert.dom(selectors.retestCaller).hasText('Cache.init()');
    });

    test('retest step is hidden when no witness data exists', async function (assert) {
      this.audit = this.buildAudit(
        { exposure: FindingExposure.POTENTIAL },
        FIXED_AT('2.12.2')
      );
      this.component = this.buildComponent();

      await render(TEMPLATE);
      await expand();

      assert.dom(selectors.retestTitle).doesNotExist();
      assert.dom(selectors.retestRow).doesNotExist();
    });
  }
);
