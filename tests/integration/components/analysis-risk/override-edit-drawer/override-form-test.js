import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { click, fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import ENUMS from 'irene/enums';
import { riskText } from 'irene/helpers/risk-text';

import {
  chooseAkSelectOption,
  getAllAkSelectOptions,
} from 'irene/tests/helpers/mirage-utils';

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

// ─── Selectors ─────────────────────────────────────────────────────────────────
const selectors = {
  overrideToLabel:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-overrideToLabel]',
  overrideToSelect:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-overrideToSelect]',
  criteriaSelect:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-criteriaSelect]',
  overrideCriteriaText:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-overrideCriteriaText]',
  overrideSelectHelperText:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-overrideSelectHelperText]',
  riskCriteriaSelectError:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-riskCriteriaSelectError]',
  commentLabel:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-commentLabel]',
  commentInput:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-commentInput]',
  commentInputError:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-commentInputError]',
  saveBtn: '[data-test-analysisRisk-overrideEditDrawer-overrideForm-saveBtn]',
  cancelBtn:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-cancelBtn]',
  successMsg:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-successMsg]',
  successSubtext:
    '[data-test-analysisRisk-overrideEditDrawer-overrideForm-successSubtext]',
};

// ─── Template ──────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<AnalysisRisk::OverrideEditDrawer::OverrideForm
  @dataModel={{this.dataModel}}
  @setAppBarData={{this.setAppBarData}}
  @setActiveComponent={{this.setActiveComponent}}
  @drawerCloseHandler={{this.drawerCloseHandler}}
/>`;

const BOTH_CRITERIA_OPTIONS = [
  {
    label: 'Current file only',
    value: ENUMS.ANALYSIS_OVERRIDE_CRITERIA.CURRENT_FILE,
  },
  {
    label: 'All future analyses',
    value: ENUMS.ANALYSIS_OVERRIDE_CRITERIA.ALL_FUTURE_UPLOAD,
  },
];

module(
  'Integration | Component | analysis-risk/override-edit-drawer/override-form',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(async function () {
      this.owner.register('service:notifications', NotificationsStub);

      this.server.createList('organization', 1);

      this.server.createList('organization-me', 1, {
        is_owner: true,
        is_admin: true,
      });

      this.server.get('/organizations/:id/me', (schema, req) =>
        schema.organizationMes.find(`${req.params.id}`)?.toJSON()
      );

      await this.owner.lookup('service:organization').load();

      const store = this.owner.lookup('service:store');

      const pushAnalysis = (vulnerabilityPayload = {}) => {
        const vulnerabilityRecord = this.server.create(
          'vulnerability',
          vulnerabilityPayload
        );

        const vulnerability = store.push(
          store.normalize('vulnerability', {
            attributes: vulnerabilityRecord.toJSON(),
            id: vulnerabilityRecord.id,
            type: 'vulnerability',
          })
        );

        const analysisRecord = this.server.create('analysis', {
          vulnerability: vulnerability.id,
        });

        return store.push(store.normalize('analysis', analysisRecord.toJSON()));
      };

      const buildDataModel = (extra = {}) => ({
        vulnerabilityName: 'Insecure Data Storage',
        computedRisk: ENUMS.RISK.CRITICAL,
        risk: ENUMS.RISK.CRITICAL,
        status: ENUMS.ANALYSIS.COMPLETED,
        isOverridden: false,
        overriddenRisk: null,
        overriddenRiskComment: '',
        overrideCriteriaOptions: BOTH_CRITERIA_OPTIONS,
        ignoreVulnerabilityHelperText: 'Ignore helper text',
        overrideSuccessMessage: 'Severity overridden',
        model: pushAnalysis(),
        editSaveOverrideHandler: (...args) => this.set('saveCalledWith', args),
        ...extra,
      });

      this.setProperties({
        pushAnalysis,
        buildDataModel,
        appBarData: null,
        activeComponent: null,
        drawerClosed: false,
        saveCalledWith: null,
        setAppBarData: (data) => this.set('appBarData', data),
        drawerCloseHandler: () => this.set('drawerClosed', true),

        setActiveComponent: (component) =>
          this.set('activeComponent', component),
      });
    });

    // ─── Risk options ────────────────────────────────────────────────────────
    test('the risk options exclude the current analysis risk and are ordered high to low', async function (assert) {
      this.dataModel = this.buildDataModel({ risk: ENUMS.RISK.CRITICAL });

      await render(TEMPLATE);

      assert
        .dom(selectors.overrideToLabel)
        .hasText(t('editOverrideVulnerability.overrideTo'));

      const options = await getAllAkSelectOptions(selectors.overrideToSelect);

      // CRITICAL is filtered out; NONE renders as "Ignore vulnerability".
      const expected = [
        t(riskText([ENUMS.RISK.HIGH])),
        t(riskText([ENUMS.RISK.MEDIUM])),
        t(riskText([ENUMS.RISK.LOW])),
        t('ignoreVulnerability'),
      ];

      assert.strictEqual(options.length, expected.length);

      expected.forEach((label, i) => {
        assert.dom(options[i]).hasText(label);
      });
    });

    test('selecting ignore vulnerability shows the helper text', async function (assert) {
      this.dataModel = this.buildDataModel();

      await render(TEMPLATE);

      assert.dom(selectors.overrideSelectHelperText).doesNotExist();

      await chooseAkSelectOption({
        selectTriggerClass: selectors.overrideToSelect,
        labelToSelect: t('ignoreVulnerability'),
      });

      assert
        .dom(selectors.overrideSelectHelperText)
        .hasText('Ignore helper text');
    });

    // ─── Criteria options ────────────────────────────────────────────────────
    test('a single criteria option renders as static text instead of a select', async function (assert) {
      this.dataModel = this.buildDataModel({
        overrideCriteriaOptions: [BOTH_CRITERIA_OPTIONS[0]],
      });

      await render(TEMPLATE);

      assert
        .dom(selectors.overrideCriteriaText)
        .hasText(BOTH_CRITERIA_OPTIONS[0].label);

      assert.dom(selectors.criteriaSelect).doesNotExist();
    });

    test('multiple criteria options render a select', async function (assert) {
      this.dataModel = this.buildDataModel();

      await render(TEMPLATE);

      assert.dom(selectors.overrideCriteriaText).doesNotExist();

      const options = await getAllAkSelectOptions(selectors.criteriaSelect);

      assert.strictEqual(options.length, BOTH_CRITERIA_OPTIONS.length);

      BOTH_CRITERIA_OPTIONS.forEach((option, i) => {
        assert.dom(options[i]).hasText(option.label);
      });
    });

    // ─── Validation ──────────────────────────────────────────────────────────
    test.each(
      'it reports the matching validation message for missing risk and criteria',
      [
        // [selectRisk, selectCriteria, expectedKey]
        [
          false,
          false,
          'editOverrideVulnerability.emptySeverityCriteriaErrorText',
        ],
        [true, false, 'editOverrideVulnerability.emptyCriteriaErrorText'],
        [false, true, 'editOverrideVulnerability.emptySeverityErrorText'],
      ],
      async function (assert, [selectRisk, selectCriteria, expectedKey]) {
        this.dataModel = this.buildDataModel();

        await render(TEMPLATE);

        if (selectRisk) {
          await chooseAkSelectOption({
            selectTriggerClass: selectors.overrideToSelect,
            labelToSelect: t(riskText([ENUMS.RISK.LOW])),
          });
        }

        if (selectCriteria) {
          await chooseAkSelectOption({
            selectTriggerClass: selectors.criteriaSelect,
            labelToSelect: BOTH_CRITERIA_OPTIONS[0].label,
          });
        }

        await fillIn(selectors.commentInput, 'A reason');
        await click(selectors.saveBtn);

        assert.dom(selectors.riskCriteriaSelectError).hasText(t(expectedKey));
        assert.strictEqual(this.saveCalledWith, null);
      }
    );

    test('an empty comment blocks the save', async function (assert) {
      this.dataModel = this.buildDataModel();

      await render(TEMPLATE);

      assert.dom(selectors.commentLabel).hasText(t('reason'));
      assert.dom(selectors.commentInputError).doesNotExist();

      await chooseAkSelectOption({
        selectTriggerClass: selectors.overrideToSelect,
        labelToSelect: t(riskText([ENUMS.RISK.LOW])),
      });

      await chooseAkSelectOption({
        selectTriggerClass: selectors.criteriaSelect,
        labelToSelect: BOTH_CRITERIA_OPTIONS[0].label,
      });

      await click(selectors.saveBtn);

      assert.dom(selectors.commentInputError).exists();
      assert.strictEqual(this.saveCalledWith, null);
    });

    // ─── Save ────────────────────────────────────────────────────────────────
    test.each(
      'saving forwards the risk, comment and the all-future flag',
      [
        [BOTH_CRITERIA_OPTIONS[0], false],
        [BOTH_CRITERIA_OPTIONS[1], true],
      ],
      async function (assert, [criteria, expectedAll]) {
        this.dataModel = this.buildDataModel();

        await render(TEMPLATE);

        await chooseAkSelectOption({
          selectTriggerClass: selectors.overrideToSelect,
          labelToSelect: t(riskText([ENUMS.RISK.LOW])),
        });

        await chooseAkSelectOption({
          selectTriggerClass: selectors.criteriaSelect,
          labelToSelect: criteria.label,
        });

        await fillIn(selectors.commentInput, 'Accepted risk');

        assert.strictEqual(this.saveCalledWith, null);

        await click(selectors.saveBtn);

        assert.deepEqual(this.saveCalledWith, [
          ENUMS.RISK.LOW,
          'Accepted risk',
          expectedAll,
        ]);
      }
    );

    test('a new override shows the success view and updates the app bar', async function (assert) {
      this.dataModel = this.buildDataModel();

      await render(TEMPLATE);

      await chooseAkSelectOption({
        selectTriggerClass: selectors.overrideToSelect,
        labelToSelect: t(riskText([ENUMS.RISK.LOW])),
      });

      await chooseAkSelectOption({
        selectTriggerClass: selectors.criteriaSelect,
        labelToSelect: BOTH_CRITERIA_OPTIONS[0].label,
      });

      await fillIn(selectors.commentInput, 'Accepted risk');
      await click(selectors.saveBtn);

      assert.dom(selectors.successMsg).hasText('Severity overridden');
      assert.deepEqual(this.appBarData, { title: t('successMessage') });
    });

    test('editing an existing override returns to the override details view', async function (assert) {
      this.dataModel = this.buildDataModel({
        isOverridden: true,
        overriddenRisk: ENUMS.RISK.LOW,
        overriddenRiskComment: 'Previously accepted',
        overrideCriteria: ENUMS.ANALYSIS_OVERRIDE_CRITERIA.CURRENT_FILE,
      });

      await render(TEMPLATE);

      assert.dom(selectors.commentInput).hasValue('Previously accepted');

      await click(selectors.saveBtn);

      assert.deepEqual(this.saveCalledWith, [
        ENUMS.RISK.LOW,
        'Previously accepted',
        false,
      ]);

      assert.strictEqual(
        this.activeComponent,
        'analysis-risk/override-edit-drawer/override-details'
      );

      assert.dom(selectors.successMsg).doesNotExist();
    });

    // ─── Guards and failures ─────────────────────────────────────────────────
    test('saving against a deprecated vulnerability is blocked with a notification', async function (assert) {
      this.dataModel = this.buildDataModel({
        model: this.pushAnalysis({ 'is-active': false }),
      });

      await render(TEMPLATE);

      await chooseAkSelectOption({
        selectTriggerClass: selectors.overrideToSelect,
        labelToSelect: t(riskText([ENUMS.RISK.LOW])),
      });

      await chooseAkSelectOption({
        selectTriggerClass: selectors.criteriaSelect,
        labelToSelect: BOTH_CRITERIA_OPTIONS[0].label,
      });

      await fillIn(selectors.commentInput, 'Accepted risk');
      await click(selectors.saveBtn);

      assert.strictEqual(
        this.owner.lookup('service:notifications').errorMsg,
        t('vulnerabilityDeprecatedReadonly'),
        'shows deprecated notification'
      );

      assert.strictEqual(this.saveCalledWith, null);
      assert.dom(selectors.successMsg).doesNotExist();
    });

    test('a failed save notifies the error and stays on the form', async function (assert) {
      this.dataModel = this.buildDataModel({
        editSaveOverrideHandler: () => {
          throw new Error('Override failed');
        },
      });

      await render(TEMPLATE);

      await chooseAkSelectOption({
        selectTriggerClass: selectors.overrideToSelect,
        labelToSelect: t(riskText([ENUMS.RISK.LOW])),
      });

      await chooseAkSelectOption({
        selectTriggerClass: selectors.criteriaSelect,
        labelToSelect: BOTH_CRITERIA_OPTIONS[0].label,
      });

      await fillIn(selectors.commentInput, 'Accepted risk');
      await click(selectors.saveBtn);

      assert.strictEqual(
        this.owner.lookup('service:notifications').errorMsg,
        'Override failed',
        'shows error notification'
      );

      assert.dom(selectors.successMsg).doesNotExist();
      assert.dom(selectors.saveBtn).hasText(t('save'));
    });

    // ─── Cancel ──────────────────────────────────────────────────────────────
    test('cancelling a new override closes the drawer', async function (assert) {
      this.dataModel = this.buildDataModel();

      await render(TEMPLATE);

      assert.false(this.drawerClosed);

      await click(selectors.cancelBtn);

      assert.true(this.drawerClosed);
      assert.strictEqual(this.activeComponent, null);
    });

    test('cancelling an edit returns to the override details view', async function (assert) {
      this.dataModel = this.buildDataModel({
        isOverridden: true,
        overriddenRisk: ENUMS.RISK.LOW,
        overriddenRiskComment: 'Previously accepted',
        overrideCriteria: ENUMS.ANALYSIS_OVERRIDE_CRITERIA.CURRENT_FILE,
      });

      await render(TEMPLATE);

      await click(selectors.cancelBtn);

      assert.false(this.drawerClosed);

      assert.strictEqual(
        this.activeComponent,
        'analysis-risk/override-edit-drawer/override-details'
      );
    });
  }
);
