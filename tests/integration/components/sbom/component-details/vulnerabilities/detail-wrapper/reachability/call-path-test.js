import { click, find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

// ─── Selectors ───
const selectors = {
  root: '[data-test-sbomComponentVulnerabilities-reachabilityCallPath]',
  title: '[data-test-sbomComponentVulnerabilities-reachabilityCallPathTitle]',
  shortNames:
    '[data-test-sbomComponentVulnerabilities-reachabilityCallPathShortNames]',
  fullSignatures:
    '[data-test-sbomComponentVulnerabilities-reachabilityCallPathFullSignatures]',
  narrative:
    '[data-test-sbomComponentVulnerabilities-reachabilityCallPathNarrative]',
  narrativeToggle:
    '[data-test-sbomComponentVulnerabilities-reachabilityCallPathNarrativeToggle]',
  analysisToggle:
    '[data-test-sbomComponentVulnerabilities-reachabilityCallPathAnalysisToggle]',
  analysisDetail:
    '[data-test-sbomComponentVulnerabilities-reachabilityCallPathAnalysisDetail]',
  step: (index) =>
    `[data-test-sbomComponentVulnerabilities-reachabilityCallPathStep="${index}"]`,
  stepSignature: (index) =>
    `[data-test-sbomComponentVulnerabilities-reachabilityCallPathStepSignature="${index}"]`,
  stepPackage: (index) =>
    `[data-test-sbomComponentVulnerabilities-reachabilityCallPathStepPackage="${index}"]`,
  stepNote: (index) =>
    `[data-test-sbomComponentVulnerabilities-reachabilityCallPathStepNote="${index}"]`,
  groupHeader: (index) =>
    `[data-test-sbomComponentVulnerabilities-reachabilityCallPathGroupHeader="${index}"]`,
  entry: '[data-test-sbomComponentVulnerabilities-reachabilityCallPathEntry]',
  fixHere:
    '[data-test-sbomComponentVulnerabilities-reachabilityCallPathFixHere]',
  target: '[data-test-sbomComponentVulnerabilities-reachabilityCallPathTarget]',
  stepMarker: (index) =>
    `[data-test-sbomComponentVulnerabilities-reachabilityCallPathStepMarker="${index}"]`,
  toggle: '[data-test-sbomComponentVulnerabilities-reachabilityCallPathToggle]',
  steps: '[data-test-sbomComponentVulnerabilities-reachabilityCallPathSteps]',
  noTrace:
    '[data-test-sbomComponentVulnerabilities-reachabilityCallPathNoTrace]',
};

const TEMPLATE = hbs`
  <Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Reachability::CallPath
    @finding={{this.finding}}
    @narrative={{this.narrative}}
  />
`;

const APP_OWNER = { kind: 'APP', component_ref: null, label: 'LeafPic' };

const LIB_OWNER = {
  kind: 'COMPONENT',
  component_ref: 'pkg:maven/com.fasterxml.jackson.core/jackson-databind@2.9.8',
  label: 'jackson-databind 2.9.8',
};

const ANNOTATED_FINDING = {
  verdict: 'CONFIRMED_REACHABLE',
  witness_nodes: [
    {
      signature:
        'Lorg/horaapps/leafpic/activities/SettingsActivity;->onCreate()',
      note: 'User opens Settings',
      owner: APP_OWNER,
    },
    {
      signature: 'Lorg/horaapps/leafpic/util/BackupHelper;->restore()',
      note: 'Passes the file stream to Jackson with no depth limit',
      owner: APP_OWNER,
    },
    {
      signature: 'Lcom/fasterxml/jackson/databind/ObjectMapper;->readValue()',
      owner: LIB_OWNER,
    },
    {
      signature:
        'Lcom/fasterxml/jackson/databind/deser/std/UntypedObjectDeserializer$Vanilla;->deserialize()',
      owner: LIB_OWNER,
    },
  ],
};

module(
  'Integration | Component | sbom/component-details/vulnerabilities/detail-wrapper/reachability/call-path',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    test('it renders nothing without a path', async function (assert) {
      this.finding = { verdict: 'NO_PATH_FOUND', witness_path: [] };

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();
    });

    test('it groups frames by owner and labels the library boundary', async function (assert) {
      this.finding = ANNOTATED_FINDING;

      await render(TEMPLATE);

      assert
        .dom(selectors.title)
        .hasText(t('sbomModule.reachability.howYourAppReachesIt'));

      assert
        .dom(selectors.groupHeader(0))
        .hasText(`${t('sbomModule.reachability.yourCode')} · LeafPic`);

      assert.dom(selectors.groupHeader(1)).hasText(
        t('sbomModule.reachability.entersComponent', {
          component: 'jackson-databind 2.9.8',
        })
      );

      assert.dom(selectors.groupHeader(2)).doesNotExist();
    });

    test('it renders short names, packages and notes per frame', async function (assert) {
      this.finding = ANNOTATED_FINDING;

      await render(TEMPLATE);

      assert
        .dom(selectors.stepSignature(0))
        .hasText('SettingsActivity.onCreate()');

      assert
        .dom(selectors.stepPackage(0))
        .hasText('org.horaapps.leafpic.activities');

      assert.dom(selectors.stepNote(0)).hasText('User opens Settings');

      // Nested classes keep their `$` marker in short form.
      assert
        .dom(selectors.stepSignature(3))
        .hasText('UntypedObjectDeserializer$Vanilla.deserialize()');

      // Library frames carry no note in this payload.
      assert.dom(selectors.stepNote(2)).doesNotExist();
    });

    test('it swaps short names for full signatures and hides the package line', async function (assert) {
      this.finding = ANNOTATED_FINDING;

      await render(TEMPLATE);

      await click(selectors.fullSignatures);

      assert
        .dom(selectors.stepSignature(0))
        .hasText('org.horaapps.leafpic.activities.SettingsActivity.onCreate()');

      assert.dom(selectors.stepPackage(0)).doesNotExist();

      await click(selectors.shortNames);

      assert
        .dom(selectors.stepSignature(0))
        .hasText('SettingsActivity.onCreate()');

      assert.dom(selectors.stepPackage(0)).exists();
    });

    test('it marks the entry point, the last app frame and the target', async function (assert) {
      this.finding = ANNOTATED_FINDING;

      await render(TEMPLATE);

      assert.dom(`${selectors.step(0)} ${selectors.entry}`).exists();

      // BackupHelper.restore() is the last app-owned frame before the library.
      assert
        .dom(`${selectors.step(1)} ${selectors.fixHere}`)
        .hasText(t('sbomModule.reachability.fixHere'));
      assert.dom(`${selectors.step(0)} ${selectors.fixHere}`).doesNotExist();

      assert.dom(`${selectors.step(3)} ${selectors.target}`).exists();
    });

    test('it renders the narrative above the path', async function (assert) {
      this.finding = ANNOTATED_FINDING;
      this.narrative = 'When a user imports a backup from Settings…';

      await render(TEMPLATE);

      assert.dom(selectors.narrative).hasText(this.narrative);
    });

    test('a component group with an empty label falls back to third-party code', async function (assert) {
      this.finding = {
        verdict: 'CONFIRMED_REACHABLE',
        witness_nodes: [
          { signature: 'Lcom/example/App;->run()', owner: APP_OWNER },
          {
            signature: 'Lcom/lib/Parser;->parse()',
            owner: { kind: 'COMPONENT', component_ref: null, label: '' },
          },
        ],
      };

      await render(TEMPLATE);

      assert
        .dom(selectors.groupHeader(1))
        .hasText(t('sbomModule.reachability.entersThirdPartyCode'));
    });

    test('a platform group with an empty label falls back to platform code', async function (assert) {
      this.finding = {
        verdict: 'CONFIRMED_REACHABLE',
        witness_nodes: [
          { signature: 'Lcom/example/App;->run()', owner: APP_OWNER },
          {
            signature: 'Landroid/os/Handler;->post()',
            owner: { kind: 'PLATFORM', component_ref: null, label: '' },
          },
        ],
      };

      await render(TEMPLATE);

      assert
        .dom(selectors.groupHeader(1))
        .hasText(t('sbomModule.reachability.platformCode'));
    });

    test('it falls back to a flat ungrouped path without ownership', async function (assert) {
      this.finding = {
        verdict: 'CONFIRMED_REACHABLE',
        witness_path: [
          {
            caller: 'Lcom/example/MainActivity;->onCreate()',
            callee: 'Lcom/example/Parser;->parse()',
          },
        ],
      };

      await render(TEMPLATE);

      assert.dom(selectors.root).exists();
      assert.dom(selectors.groupHeader(0)).doesNotExist();
      assert.dom(selectors.stepSignature(0)).hasText('MainActivity.onCreate()');
      assert.dom(selectors.stepSignature(1)).hasText('Parser.parse()');

      // Ownership is what identifies the app's last frame; without it there
      // is nothing to point at.
      assert.dom(selectors.fixHere).doesNotExist();
    });
    test('it keeps the analyst half out of the reading flow', async function (assert) {
      this.finding = ANNOTATED_FINDING;
      this.narrative =
        'App behavior: The witness starts at onCreate.\n\n' +
        'Analyst assessment: The first uncertain transition is ' +
        'Lcom/a/B;->c()V -> Lcom/d/E;->f()V.';

      await render(TEMPLATE);

      // Only the behavior half reads inline; the raw signatures stay hidden.
      assert
        .dom(selectors.narrative)
        .hasText('The witness starts at onCreate.');
      assert.dom(selectors.analysisDetail).doesNotExist();

      await click(selectors.analysisToggle);

      assert
        .dom(selectors.analysisDetail)
        .includesText('Lcom/a/B;->c()V -> Lcom/d/E;->f()V.');
    });

    test('it clamps a long narrative behind Show more', async function (assert) {
      this.finding = ANNOTATED_FINDING;
      // Long enough to overflow three lines at any panel width: the toggle is
      // driven by measured overflow, not by a character count.
      this.narrative = `App behavior: ${'The witness continues onward. '.repeat(60)}`;

      await render(TEMPLATE);

      assert.dom(selectors.narrativeToggle).hasText(t('showMore'));

      await click(selectors.narrativeToggle);

      assert.dom(selectors.narrativeToggle).hasText(t('showLess'));
    });

    test('a short narrative shows no toggle even when it is wordy', async function (assert) {
      this.finding = ANNOTATED_FINDING;
      // Previously a character threshold put a toggle on text that fitted.
      this.narrative =
        'When a user imports a backup from Settings, the app passes the ' +
        'file straight to the parser, which fails on deeply nested input.';

      await render(TEMPLATE);

      assert.dom(selectors.narrative).hasText(this.narrative);
      assert.dom(selectors.narrativeToggle).doesNotExist();
      assert.dom(selectors.analysisToggle).doesNotExist();
    });

    test('it labels the fix frame "Check here" when the path is not proven', async function (assert) {
      for (const finding of [
        { ...ANNOTATED_FINDING, verdict: 'POTENTIALLY_REACHABLE' },
        { ...ANNOTATED_FINDING, exposure: 'UNKNOWN' },
      ]) {
        this.set('finding', finding);

        await render(TEMPLATE);

        assert
          .dom(`${selectors.step(1)} ${selectors.fixHere}`)
          .hasText(t('sbomModule.reachability.checkHere'))
          .hasClass(/ak-chip-color-warn/)
          .doesNotHaveClass(/ak-chip-color-error/);
      }
    });

    test('a confirmed fix point keeps the error colour', async function (assert) {
      this.finding = { ...ANNOTATED_FINDING, verdict: 'REACHABLE' };

      await render(TEMPLATE);

      assert
        .dom(`${selectors.step(1)} ${selectors.fixHere}`)
        .hasText(t('sbomModule.reachability.fixHere'))
        .hasClass(/ak-chip-color-error/);
    });

    test('it rings the vulnerable frame and colours its name', async function (assert) {
      this.finding = ANNOTATED_FINDING;

      await render(TEMPLATE);

      const marker = getComputedStyle(find(selectors.stepMarker(3)));
      const entryMarker = getComputedStyle(find(selectors.stepMarker(0)));

      assert.notStrictEqual(marker.boxShadow, 'none', 'halo ring');
      assert.strictEqual(entryMarker.boxShadow, 'none', 'no ring elsewhere');

      assert.notStrictEqual(
        getComputedStyle(find(selectors.stepSignature(3))).color,
        getComputedStyle(find(selectors.stepSignature(0))).color,
        'the vulnerable frame uses the error ink'
      );
    });

    test('it shows a dashed no-trace box when targets exist but nothing was traced', async function (assert) {
      this.finding = {
        verdict: 'UNKNOWN',
        target_presence: 'NOT_OBSERVED',
        witness_path: [],
        targets: [{ label: 'Lorg/junit/rules/TemporaryFolder;->create()' }],
      };
      this.narrative = 'junit is listed but none of its classes ship.';

      await render(TEMPLATE);

      assert
        .dom(selectors.title)
        .hasText(t('sbomModule.reachability.howYourAppReachesIt'));
      assert.dom(selectors.narrative).hasText(this.narrative);
      assert
        .dom(selectors.noTrace)
        .hasText(t('sbomModule.reachability.noTrace'));
      assert.dom(selectors.steps).doesNotExist();

      // Nothing to abbreviate without frames.
      assert.dom(selectors.toggle).doesNotExist();
    });

    test('the no-trace copy says "not found" only when the code was not observed', async function (assert) {
      const targets = [{ label: 'Lcom/example/Parser;->parse()' }];

      for (const finding of [
        // Present in the build, but the analysis was blocked.
        { verdict: 'UNKNOWN', target_presence: 'PRESENT', targets },
        // Never analysed.
        { verdict: 'UNSUPPORTED', targets },
        // Potential without a witness and no presence information.
        { verdict: 'POTENTIALLY_REACHABLE', targets },
      ]) {
        this.set('finding', { witness_path: [], ...finding });

        await render(TEMPLATE);

        assert
          .dom(selectors.noTrace)
          .hasText(t('sbomModule.reachability.noTraceRecorded'));
      }
    });

    test('it shows no trace box for a proven absence or a traced path', async function (assert) {
      this.set('finding', {
        verdict: 'NO_PATH_FOUND',
        witness_path: [],
        targets: [{ label: 'Lcom/example/Parser;->parse()' }],
      });

      await render(TEMPLATE);

      assert.dom(selectors.root).doesNotExist();

      this.set('finding', ANNOTATED_FINDING);

      assert.dom(selectors.noTrace).doesNotExist();
      assert.dom(selectors.steps).exists();
    });
  }
);
