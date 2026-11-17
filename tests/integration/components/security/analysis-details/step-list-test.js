import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';
import {
  render,
  click,
  fillIn,
  findAll,
  triggerEvent,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

// ─── Selectors ───────────────────────────────────────────────────────────────
const selectors = {
  step: '[data-test-securityAnalysisDetails-validatedFindings-step]',
  stepTitle: (index) =>
    `[data-test-securityAnalysisDetails-validatedFindings-stepTitle='${index}']`,
  headingInput: (index) =>
    `[data-test-securityAnalysisDetails-validatedFindings-stepHeadingInput='${index}']`,
  deleteBtn: (index) =>
    `[data-test-securityAnalysisDetails-validatedFindings-stepDeleteBtn='${index}']`,
  addBtn: '[data-test-securityAnalysisDetails-validatedFindings-addStepBtn]',
  dragHandle: (index) =>
    `[data-test-securityAnalysisDetails-validatedFindings-stepDragHandle='${index}']`,
  codeInput: (index) =>
    `[data-test-securityAnalysisDetails-validatedFindings-stepCodeInput='${index}']`,
};

// ─── Template ────────────────────────────────────────────────────────────────
const TEMPLATE = hbs`<Security::AnalysisDetails::ValidatedFindings::StepList
  @steps={{this.steps}}
  @addLabel={{this.addLabel}}
  @bodyPlaceholder={{this.bodyPlaceholder}}
  @disabled={{this.disabled}}
  @onStepsChange={{this.onStepsChange}}
/>`;

const CODE_EXAMPLE_TEMPLATE = hbs`<Security::AnalysisDetails::ValidatedFindings::StepList
  @steps={{this.steps}}
  @addLabel={{this.addLabel}}
  @bodyPlaceholder={{this.bodyPlaceholder}}
  @disabled={{this.disabled}}
  @codeField='codeExample'
  @codeFieldLabel={{this.codeFieldLabel}}
  @codeFieldPlaceholder={{this.codeFieldPlaceholder}}
  @onStepsChange={{this.onStepsChange}}
/>`;

const COMMAND_TEMPLATE = hbs`<Security::AnalysisDetails::ValidatedFindings::StepList
  @steps={{this.steps}}
  @addLabel={{this.addLabel}}
  @bodyPlaceholder={{this.bodyPlaceholder}}
  @disabled={{this.disabled}}
  @codeField='command'
  @codeFieldLabel={{this.codeFieldLabel}}
  @codeFieldPlaceholder={{this.codeFieldPlaceholder}}
  @onStepsChange={{this.onStepsChange}}
/>`;

module(
  'Integration | Component | security/analysis-details/validated-findings/step-list',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en');

    hooks.beforeEach(function () {
      this.setProperties({
        committed: null,
        addLabel: 'Add step',
        bodyPlaceholder: 'Describe the step',
        codeFieldLabel: 'Code example',
        codeFieldPlaceholder: 'Paste the snippet',
        disabled: false,
        onStepsChange: (steps) => {
          this.set('committed', steps);
        },
        steps: [
          { heading: 'First heading', body: 'First body', id: 1 },
          { heading: 'Second heading', body: 'Second body', id: 2 },
        ],
      });
    });

    // ─── Rendering ─────────────────────────────────────────────────────────

    test('it renders every step', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(findAll(selectors.step).length, this.steps.length);

      this.steps.forEach((step, index) => {
        assert.dom(selectors.stepTitle(index)).hasText(
          t('securityAnalysisDetails.validatedFindings.step', {
            number: index + 1,
          })
        );

        assert.dom(selectors.headingInput(index)).hasValue(step.heading);
      });
    });

    test('it renders nothing for an empty list', async function (assert) {
      this.set('steps', []);

      await render(TEMPLATE);

      assert.dom(selectors.step).doesNotExist();
      assert.dom(selectors.addBtn).hasText(this.addLabel);
    });

    test('the controls are disabled when the list is', async function (assert) {
      this.set('disabled', true);

      await render(TEMPLATE);

      assert.dom(selectors.addBtn).isDisabled();
      assert.dom(selectors.deleteBtn(0)).isDisabled();
    });

    // ─── Editing ───────────────────────────────────────────────────────────

    test('adding a step commits an empty one with its own id', async function (assert) {
      await render(TEMPLATE);

      assert.strictEqual(this.committed, null);

      await click(selectors.addBtn);

      assert.strictEqual(this.committed.length, 3);
      assert.strictEqual(this.committed[2].heading, '');
      assert.strictEqual(this.committed[2].body, '');
      assert.strictEqual(typeof this.committed[2].id, 'number');
    });

    test('removing a step commits the rest', async function (assert) {
      await render(TEMPLATE);
      await click(selectors.deleteBtn(0));

      assert.strictEqual(this.committed.length, 1);
      assert.strictEqual(this.committed[0].heading, 'Second heading');
    });

    test('editing a heading commits only that step', async function (assert) {
      await render(TEMPLATE);
      await fillIn(selectors.headingInput(1), 'Edited heading');

      assert.strictEqual(this.committed[1].heading, 'Edited heading');
      assert.strictEqual(
        this.committed[1].body,
        'Second body',
        'leaves the body alone'
      );
      assert.strictEqual(
        this.committed[0].heading,
        'First heading',
        'leaves the other step alone'
      );
    });

    // ─── Reordering ────────────────────────────────────────────────────────

    test('dropping a step onto another reorders both fields together', async function (assert) {
      await render(TEMPLATE);

      const rows = findAll(selectors.step);

      // Only the handle starts a drag, so selecting text in a field inside
      // the row does not move the step.
      await triggerEvent(selectors.dragHandle(1), 'dragstart');
      await triggerEvent(rows[0], 'dragover');
      await triggerEvent(rows[0], 'drop');

      assert.strictEqual(this.committed.length, 2);
      assert.strictEqual(this.committed[0].heading, 'Second heading');
      assert.strictEqual(this.committed[0].body, 'Second body');
      assert.strictEqual(
        this.committed[0].id,
        2,
        'the step keeps its identity'
      );
      assert.strictEqual(this.committed[1].heading, 'First heading');
      assert.strictEqual(this.committed[1].body, 'First body');
    });

    test('dropping a step onto itself changes nothing', async function (assert) {
      await render(TEMPLATE);

      const rows = findAll(selectors.step);

      await triggerEvent(selectors.dragHandle(0), 'dragstart');
      await triggerEvent(rows[0], 'drop');

      assert.strictEqual(this.committed, null);
    });

    test('dragging the row itself does not reorder', async function (assert) {
      await render(TEMPLATE);

      const rows = findAll(selectors.step);

      await triggerEvent(rows[1], 'dragstart');
      await triggerEvent(rows[0], 'dragover');
      await triggerEvent(rows[0], 'drop');

      assert.strictEqual(this.committed, null);
    });

    // ─── Code example per step ───────────────────────────────────────────

    test('a step carries no code field unless asked for', async function (assert) {
      await render(TEMPLATE);

      assert.dom(selectors.codeInput(0)).doesNotExist();
    });

    test('each step gets its own code field', async function (assert) {
      await render(CODE_EXAMPLE_TEMPLATE);

      // The API stores these as a list parallel to the steps, so there is
      // one per step rather than one for the whole remediation.
      const codeInputs = findAll(
        '[data-test-securityAnalysisDetails-validatedFindings-stepCodeInput]'
      );

      assert.strictEqual(codeInputs.length, this.steps.length);

      codeInputs.forEach((codeInput) => {
        assert
          .dom(codeInput)
          .hasAttribute('placeholder', this.codeFieldPlaceholder);
        assert.dom(codeInput).hasAttribute('aria-label', this.codeFieldLabel);
      });
    });

    test('editing a code example reports it on its own step', async function (assert) {
      await render(CODE_EXAMPLE_TEMPLATE);

      await fillIn(selectors.codeInput(1), 'npm audit fix');

      assert.strictEqual(this.committed[1].codeExample, 'npm audit fix');
      assert.notOk(this.committed[0].codeExample);
      assert.notOk(this.committed[1].command, 'writes only the named field');
    });

    test('a command field writes the command instead', async function (assert) {
      await render(COMMAND_TEMPLATE);

      await fillIn(selectors.codeInput(0), 'curl -I https://example.com');

      assert.strictEqual(
        this.committed[0].command,
        'curl -I https://example.com'
      );

      assert.notOk(this.committed[0].codeExample);
    });

    test('a code field renders what the step already holds', async function (assert) {
      this.set('steps', [
        { heading: 'First heading', body: 'First body', id: 1, command: 'ls' },
      ]);

      await render(COMMAND_TEMPLATE);

      assert.dom(selectors.codeInput(0)).hasValue('ls');
    });

    test('the code field is disabled when the list is', async function (assert) {
      this.set('disabled', true);

      await render(CODE_EXAMPLE_TEMPLATE);

      assert.dom(selectors.codeInput(0)).isDisabled();
    });
  }
);
