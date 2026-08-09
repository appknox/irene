import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { compareInnerHTMLWithIntlTranslation } from 'irene/tests/test-utils';

// ─── Mock step data (mirrors MOCK_STEP_SEEDS in the component) ────────────────

const MOCK_STEPS = [
  { order: '#1', identifier: 'button_login_start', value: '2' },
  { order: '#2', identifier: 'dropdown_region', value: 'North America' },
  { order: '#3', identifier: 'email_id', value: 'user@example.com' },
  { order: '#4', identifier: 'password', value: 'P@ssword123' },
  {
    order: '#5',
    identifier: 'checkbox_terms',
    checkValue: 'dastAutomation.checkOptions.checked',
  },
  { order: '#6', identifier: 'button_submit', value: '1' },
  { order: '#7', identifier: 'loading_spinner', value: '5' },
];

// ─── Selectors ───────────────────────────────────────────────────────────────

const selectors = {
  stepsTableRoot: '[data-test-dastAutomationScenario-stepsTable-root]',
  stepsTableRoleName: '[data-test-dastAutomationScenario-stepsTable-roleName]',
  allRows: '[data-test-dastAutomationScenario-stepsTable-row]',

  viewSampleBtn:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-loginScenarioSample-viewSampleBtn]',
  drawerTitle:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-loginScenarioSample-sampleDrawerTitle]',
  drawerCloseBtn:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-loginScenarioSample-sampleDrawerCloseBtn]',

  rowOrder: (i) =>
    `[data-test-dastAutomationScenario-stepsTable-row="${i}"] [data-test-dastAutomationScenario-stepsTable-rowOrder]`,

  rowIdentifier: (i) =>
    `[data-test-dastAutomationScenario-stepsTable-row="${i}"] [data-test-dastAutomationScenario-stepsTable-rowIdentifier]`,

  rowValue: (i) =>
    `[data-test-dastAutomationScenario-stepsTable-row="${i}"] [data-test-dastAutomationScenario-stepsTable-rowValue]`,

  notesHeading:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-loginScenarioSample-sampleDrawerNotes] > [data-test-ak-typography]',

  notesListContainer:
    '[data-test-projectSettings-dastAutomation-scenarioViewV2-loginScenarioSample-sampleDrawerNotesList]',
};

// ─── Template ────────────────────────────────────────────────────────────────

const TEMPLATE = hbs`
  <ProjectSettings::DastAutomation::ScenarioViewV2::LoginScenarioSample
    @scenarioDetail={{this.scenarioDetail}}
  />
`;

// ─── Test suite ──────────────────────────────────────────────────────────────

module(
  'Integration | Component | project-settings/dast-automation/scenario-view-v2/login-scenario-sample',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      const scenarioDetail = this.server.create('scenario-detail', {
        type: 0,
        is_active: true,
      });

      const normalizedScenarioDetail = store.normalize(
        'scenario-detail',
        scenarioDetail.toJSON()
      );

      this.setProperties({
        scenarioDetail: store.push(normalizedScenarioDetail),
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────────

    test('renders the view-sample button and drawer is closed by default', async function (assert) {
      await render(TEMPLATE);

      assert
        .dom(selectors.viewSampleBtn)
        .hasText(t('dastAutomation.viewSample'));

      assert.dom(selectors.drawerTitle).doesNotExist();
    });

    // ─── Drawer open ───────────────────────────────────────────────────────────

    test('clicking the button opens the drawer with the correct title', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.viewSampleBtn);

      assert.dom(selectors.drawerTitle).hasText(t('dastAutomation.viewSample'));
    });

    test('sample steps table renders role name and all 7 mock steps', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.viewSampleBtn);

      assert.dom(selectors.stepsTableRoot).exists();
      assert.dom(selectors.stepsTableRoleName).hasText('Default User Role 1');

      assert.strictEqual(
        findAll(selectors.allRows).length,
        7,
        'renders all 7 mock steps'
      );

      MOCK_STEPS.forEach((step, i) => {
        assert.dom(selectors.rowOrder(i)).hasText(step.order);
        assert.dom(selectors.rowIdentifier(i)).hasValue(step.identifier);

        if (step.checkValue) {
          assert.dom(selectors.rowValue(i)).containsText(t(step.checkValue));
        } else {
          assert.dom(selectors.rowValue(i)).hasValue(step.value);
        }
      });
    });

    // ─── Notes ─────────────────────────────────────────────────────────────────

    test('drawer notes section renders heading and all 6 notes with correct content', async function (assert) {
      assert.expect(8);

      await render(TEMPLATE);

      await click(selectors.viewSampleBtn);

      assert.dom(selectors.notesHeading).containsText(t('note'));

      assert.strictEqual(
        findAll(`${selectors.notesListContainer} li`).length,
        6,
        'renders all 6 sample notes'
      );

      [1, 2, 3, 4, 5, 6].forEach((n) => {
        compareInnerHTMLWithIntlTranslation(assert, {
          selector: selectors.notesListContainer,
          message: t(`dastAutomation.loginScenarioSample.note${n}`),
          doIncludesCheck: true,
        });
      });
    });

    // ─── Drawer close ──────────────────────────────────────────────────────────

    test('clicking the close button closes the drawer', async function (assert) {
      await render(TEMPLATE);

      await click(selectors.viewSampleBtn);

      assert.dom(selectors.drawerTitle).exists();

      await click(selectors.drawerCloseBtn);

      assert.dom(selectors.drawerTitle).doesNotExist();
    });
  }
);
