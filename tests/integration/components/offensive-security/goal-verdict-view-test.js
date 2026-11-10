import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import { render, click, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const SEL = {
  view: (verdict) => `[data-test-offensiveSecurity-goalView="${verdict}"]`,
  anyView: '[data-test-offensiveSecurity-goalView]',
  title: '[data-test-offensiveSecurity-goalView-title]',
  verdictPill: '[data-test-offensiveSecurity-goalView-verdict]',
  paths: '[data-test-offensiveSecurity-goalView-paths]',
  chain: '[data-test-offensiveSecurity-goalView-chain]',
  chainStep: '[data-test-offensiveSecurity-goalView-chainStep]',
  chainOutcome: '[data-test-offensiveSecurity-goalView-chainOutcome]',
  exploitCard: '[data-test-offensiveSecurity-goalView-exploitCard]',
  weaknesses: '[data-test-offensiveSecurity-goalView-weaknesses]',
  banner: '[data-test-offensiveSecurity-goalView-banner]',
  proof: '[data-test-offensiveSecurity-goalView-proof]',
  note: '[data-test-offensiveSecurity-goalView-note]',
  pagerLabel: '[data-test-offensiveSecurity-goalView-pager-label]',
  pagerNext: '[data-test-offensiveSecurity-goalView-pager-next]',
  otherCta: '[data-test-offensiveSecurity-goalView-otherTechniques]',
  otherPage: '[data-test-offensiveSecurity-otherTechniques]',
  otherFilter: (key) =>
    `[data-test-offensiveSecurity-otherTechniques-filter="${key}"]`,
  otherPanel: '[data-test-offensiveSecurity-otherTechniques-panel]',
  otherEmpty: '[data-test-offensiveSecurity-otherTechniques-empty]',
  otherPagerLabel:
    '[data-test-offensiveSecurity-otherTechniques-panel] [data-test-offensiveSecurity-goalView-pager-label]',
  otherPagerNext:
    '[data-test-offensiveSecurity-otherTechniques-panel] [data-test-offensiveSecurity-goalView-pager-next]',
  legacyHero: '[data-test-offensiveSecurity-pentest-card]',
  goalCrumb: '[data-test-offensiveSecurity-pentest-goalCrumb]',
  goalsCardStatus: '[data-test-offensiveSecurity-pentest-goal-status]',
  goalsCardVerdict: '[data-test-offensiveSecurity-pentest-goal-verdict]',
};

const TECHNIQUES = [
  {
    id: 'G1-01a',
    category: 'Shared Prefs',
    name: 'Default file',
    flaw: 'Token saved in the default preferences XML',
    status: 'exploited',
    description: 'The auth token sits in the default preferences in cleartext.',
    location: 'shared_prefs/app_preferences.xml',
    repro: ['Pull the preferences file', 'Read the token'],
    evidence: '<string name="auth_token">eyJ</string>',
    fix: 'Keep auth material out of plain SharedPreferences.',
    fix_steps: ['Use EncryptedSharedPreferences'],
    refs: ['CWE-200 Exposure of sensitive information'],
  },
  {
    id: 'G1-01e',
    category: 'Shared Prefs',
    name: 'World-readable file',
    flaw: 'Token readable by other apps',
    status: 'exploited',
    fix: 'Stop sharing the preferences file.',
  },
  {
    id: 'G1-02a',
    category: 'SQLite',
    name: 'Plain database',
    flaw: 'Rows stored unencrypted',
    status: 'confirmed',
    tried: 'Opened the SQLite databases.',
    outcome: 'Sensitive rows were readable.',
    fix: 'Encrypt the database.',
  },
  {
    id: 'G1-03a',
    category: 'Logs',
    name: 'Logcat',
    flaw: 'Secrets in logs',
    status: 'safe',
    tried: 'Captured logcat and searched it.',
  },
  {
    id: 'G1-04a',
    category: 'Backup',
    name: 'adb backup',
    flaw: 'Backup extraction',
    status: 'not_tested',
    tried: 'Checked the backup configuration.',
  },
];

const PATHS = [
  {
    type: 'individual',
    steps: [{ label: 'G1-01a', text: 'token in default prefs' }],
    outcome: 'Token recovered from default SharedPreferences',
    summary: 'The auth token sits in the app preferences in cleartext.',
  },
  {
    type: 'chain',
    steps: [
      { label: 'G1-01e', text: 'world-readable prefs' },
      { label: 'G1-01a', text: 'read token from another app' },
      { text: 'replay' },
    ],
    outcome: 'Session token stolen and reused',
    summary: 'A token was read by a second app and replayed.',
  },
];

const PLANS = [
  { number: 1, status: 'succeeded', hypothesis: 'Hook works', steps: [] },
  { number: 2, status: 'abandoned', hypothesis: 'Login works', steps: [] },
  { number: 3, status: 'abandoned', hypothesis: 'Deep link works', steps: [] },
];

function goal(overrides = {}) {
  return {
    goal_id: 'find-data',
    goal_name: 'Sensitive data exposure on the device',
    description: 'Customer data read off the device.',
    verdict: 'exploited',
    techniques: TECHNIQUES,
    paths: PATHS,
    plans: PLANS,
    findings: [],
    observations: [],
    ...overrides,
  };
}

const TEMPLATE = hbs`<OffensiveSecurity::ScanResults::PentestResults
  @goals={{this.goals}}
  @initialGoalIndex={{0}}
/>`;

module(
  'Integration | Component | offensive-security/goal-verdict-view',
  (hooks) => {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    async function renderGoal(context, overrides) {
      context.set('goals', [goal(overrides)]);
      await render(TEMPLATE);
    }

    test.each(
      'exploited and partly exploited share the attack paths layout',
      [
        ['exploited', 'Exploited'],
        ['partial', 'Partly exploited'],
      ],
      async function (assert, [verdict, label]) {
        await renderGoal(this, { verdict });

        assert.dom(SEL.view(verdict)).exists();
        assert.dom(SEL.title).hasText('Sensitive data exposure on the device');
        assert.dom(SEL.verdictPill).hasText(label);
        assert.dom(SEL.paths).exists();
        assert.dom(SEL.chain).exists();
        assert.dom(SEL.exploitCard).exists();
        assert.dom(SEL.weaknesses).doesNotExist();
        assert.dom(SEL.proof).doesNotExist();
        assert
          .dom(SEL.legacyHero)
          .doesNotExist('the old findings page is replaced');
      }
    );

    test('the attack path shows its steps leading to the outcome, and the pager moves between paths', async function (assert) {
      await renderGoal(this);

      assert.dom(SEL.pagerLabel).hasText('1 of 2');
      assert
        .dom(SEL.chain)
        .hasAttribute(
          'data-test-offensiveSecurity-goalView-chain',
          'individual'
        );
      assert.dom(SEL.chainStep).exists({ count: 1 });
      assert
        .dom(SEL.chainOutcome)
        .hasText('Token recovered from default SharedPreferences');
      assert.dom(SEL.exploitCard).containsText('Shared Prefs · Default file');
      assert.dom(SEL.exploitCard).containsText('Pull the preferences file');
      assert
        .dom(SEL.exploitCard)
        .containsText('Keep auth material out of plain SharedPreferences.');
      assert
        .dom(SEL.exploitCard)
        .containsText('CWE-200 Exposure of sensitive information');

      await click(SEL.pagerNext);

      assert.dom(SEL.pagerLabel).hasText('2 of 2');
      assert
        .dom(SEL.chain)
        .hasAttribute('data-test-offensiveSecurity-goalView-chain', 'chain');
      assert.dom(SEL.chainStep).exists({ count: 3 });
      assert.dom(SEL.chainOutcome).hasText('Session token stolen and reused');
      assert
        .dom(SEL.exploitCard)
        .exists({ count: 2 }, 'one card per technique in the chain');
      assert.dom(findAll(SEL.exploitCard)[0]).containsText('Chain step 1 of 3');
      assert.dom(findAll(SEL.exploitCard)[1]).containsText('Chain step 2 of 3');
    });

    test('a single attack path still shows the pager, with both buttons off', async function (assert) {
      await renderGoal(this, { paths: [PATHS[0]] });

      assert.dom(SEL.pagerLabel).hasText('1 of 1');
      assert.dom(SEL.pagerNext).isDisabled();
    });

    test('a confirmed weakness card is amber, not the goal-level blue', async function (assert) {
      await renderGoal(this, { verdict: 'weakness', paths: [] });

      assert.dom(SEL.verdictPill).hasClass(/verdict-weakness/);
      assert
        .dom(`${SEL.weaknesses} [class*="verdict-partial"]`)
        .hasText('Weakness found');
    });

    test('weakness found shows the banner and the weaknesses panel', async function (assert) {
      await renderGoal(this, { verdict: 'weakness', paths: [] });

      assert.dom(SEL.view('weakness')).exists();
      assert.dom(SEL.verdictPill).hasText('Weakness found');
      assert
        .dom(SEL.banner)
        .containsText('No exploits found — but weaknesses were detected.')
        .containsText('1 weakness is present');
      assert.dom(SEL.weaknesses).containsText('SQLite · Plain database');
      assert.dom(SEL.weaknesses).containsText('Sensitive rows were readable.');
      assert.dom(SEL.paths).doesNotExist();
    });

    test('not vulnerable and untested each have their own what-was-tried panel', async function (assert) {
      await renderGoal(this, { verdict: 'held', paths: [] });

      assert.dom(SEL.view('held')).exists();
      assert.dom(SEL.verdictPill).hasText('Not vulnerable');
      assert
        .dom(SEL.proof)
        .containsText("What was tried — and why it's not vulnerable")
        .containsText('No weakness was found for this risk.')
        .containsText('1 technique could not be tested and remains open.');

      await renderGoal(this, { verdict: 'untested', paths: [] });

      assert.dom(SEL.view('untested')).exists();
      assert.dom(SEL.verdictPill).hasText('Untested');
      assert
        .dom(SEL.proof)
        .containsText('What was attempted — all still untested')
        .containsText(
          'This risk was not reached before the step budget ran out.'
        );
    });

    test('the other techniques button only shows where there is more than the exploited ones', async function (assert) {
      await renderGoal(this, { verdict: 'exploited' });
      assert
        .dom(SEL.otherCta)
        .hasText(`${t('offensiveSecurity.goalView.otherTechniquesCta')} →`);

      await renderGoal(this, {
        verdict: 'weakness',
        techniques: TECHNIQUES.filter((t) => t.status !== 'exploited'),
      });
      assert
        .dom(SEL.otherCta)
        .hasText(`${t('offensiveSecurity.goalView.techniquesAttemptedCta')} →`);

      await renderGoal(this, { verdict: 'held' });
      assert.dom(SEL.otherCta).doesNotExist('everything is listed inline');

      await renderGoal(this, {
        verdict: 'exploited',
        techniques: TECHNIQUES.filter((t) => t.status === 'exploited'),
      });
      assert
        .dom(SEL.otherCta)
        .doesNotExist('every technique was exploited, nothing else to open');
    });

    test('other techniques lists the techniques beyond the exploited ones, filters them, and returns to the goal', async function (assert) {
      await renderGoal(this);
      await click(SEL.otherCta);

      assert.dom(SEL.otherPage).containsText('OTHER TECHNIQUES ATTEMPTED');
      assert
        .dom(SEL.otherPage)
        .containsText(
          '2 tested but not exploited, 1 not vulnerable, 1 untested, across 5 techniques'
        );
      assert.dom(SEL.view('exploited')).doesNotExist();

      assert.dom(SEL.otherFilter('all')).containsText('3');
      assert.dom(SEL.otherFilter('confirmed')).containsText('1');
      assert.dom(SEL.otherFilter('not_tested')).containsText('1');
      assert.dom(SEL.otherFilter('safe')).containsText('1');

      // weaknesses first, with the exploit steps and the fix
      assert.dom(SEL.otherPagerLabel).hasText('1 of 3');
      assert.dom(SEL.otherPanel).containsText('SQLite · Plain database');
      assert.dom(SEL.otherPanel).containsText('Weakness found');
      assert.dom(SEL.otherPanel).containsText('Budget exhausted');
      assert.dom(SEL.otherPanel).containsText('What the agent did to exploit');
      assert.dom(SEL.otherPanel).containsText('Sensitive rows were readable.');
      assert.dom(SEL.otherPanel).containsText('Encrypt the database.');

      await click(SEL.otherPagerNext);
      assert.dom(SEL.otherPanel).containsText('Backup · adb backup');
      assert.dom(SEL.otherPanel).containsText('What happened');

      await click(SEL.otherPagerNext);
      assert.dom(SEL.otherPanel).containsText('Logs · Logcat');
      assert.dom(SEL.otherPanel).containsText('What it checks for');
      assert.dom(SEL.otherPanel).containsText("Why it's not vulnerable");
      assert.dom(SEL.otherPanel).doesNotContainText('Budget exhausted');

      await click(SEL.otherFilter('safe'));
      assert.dom(SEL.otherPanel).containsText('Logs · Logcat');
      assert.dom(SEL.otherFilter('safe')).hasAttribute('aria-pressed', 'true');
      assert.dom(SEL.otherPagerLabel).doesNotExist('one technique, no pager');

      await click(SEL.goalCrumb);

      assert.dom(SEL.view('exploited')).exists('back on the goal page');
      assert.dom(SEL.otherPage).doesNotExist();
    });

    test('other techniques on a weakness goal leaves out the weaknesses already listed', async function (assert) {
      await renderGoal(this, {
        verdict: 'weakness',
        paths: [],
        techniques: TECHNIQUES.filter((t) => t.status !== 'exploited'),
      });
      await click(SEL.otherCta);

      assert.dom(SEL.otherFilter('confirmed')).doesNotExist();
      assert.dom(SEL.otherFilter('all')).containsText('2');
    });

    test('other techniques shows an empty note when nothing else was assessed', async function (assert) {
      await renderGoal(this, {
        verdict: 'weakness',
        paths: [],
        techniques: TECHNIQUES.filter((t) => t.status === 'confirmed'),
      });
      await click(SEL.otherCta);

      assert.dom(SEL.otherEmpty).exists();
    });

    test('the login goal keeps the findings page', async function (assert) {
      await renderGoal(this, { verdict: undefined, goal_id: 'login' });

      assert.dom(SEL.anyView).doesNotExist();
      assert.dom(SEL.legacyHero).exists();
    });

    test('the goal list shows the verdict, or the plain status without one', async function (assert) {
      this.set('goals', [
        goal({ verdict: 'partial', status: 'budget_exhausted' }),
        goal({
          goal_id: 'login',
          verdict: undefined,
          status: 'budget_exhausted',
        }),
      ]);

      await render(hbs`<OffensiveSecurity::ScanResults::PentestGoalsCard
      @goals={{this.goals}}
      @onGoalClick={{this.noop}}
    />`);

      const pills = findAll(SEL.goalsCardStatus);

      assert.strictEqual(pills[0].textContent.trim(), 'Partly exploited');
      assert
        .dom(pills[0])
        .hasAttribute(
          'data-test-offensiveSecurity-pentest-goal-verdict',
          'partial'
        );
      assert.strictEqual(pills[1].textContent.trim(), 'Budget Exhausted');
      assert.dom(SEL.goalsCardVerdict).exists({ count: 1 });
    });
  }
);
