import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import FindingEditorDrafts from 'irene/components/security/analysis-details/validated-findings/finding-detail/editor-drafts';

module(
  'Unit | Component | security/analysis-details/validated-findings/finding-detail/editor-drafts',
  function (hooks) {
    setupTest(hooks);

    hooks.beforeEach(function () {
      this.drafts = new FindingEditorDrafts();
    });

    test('it falls back to the saved value until something is typed', function (assert) {
      assert.strictEqual(
        this.drafts.valueFor('1', 'evidence', '<p>Saved</p>'),
        '<p>Saved</p>'
      );
    });

    test('it returns what was typed over the saved value', function (assert) {
      this.drafts.remember('1', 'evidence', '<ul><li>Typed</li></ul>');

      assert.strictEqual(
        this.drafts.valueFor('1', 'evidence', '<p>Saved</p>'),
        '<ul><li>Typed</li></ul>'
      );
    });

    test('each field keeps its own draft', function (assert) {
      this.drafts.remember('1', 'evidence', 'Evidence draft');

      assert.strictEqual(
        this.drafts.valueFor('1', 'evidence', 'Saved evidence'),
        'Evidence draft'
      );

      assert.strictEqual(
        this.drafts.valueFor('1', 'reasoning', 'Saved reasoning'),
        'Saved reasoning',
        'an untouched field still reads from the record'
      );
    });

    test('an empty draft is kept rather than treated as absent', function (assert) {
      this.drafts.remember('1', 'evidence', '');

      assert.strictEqual(this.drafts.valueFor('1', 'evidence', 'Saved'), '');
    });

    test('moving to another finding drops the drafts', function (assert) {
      // One finding's text must never show under another.
      this.drafts.remember('1', 'evidence', 'First finding');

      assert.strictEqual(
        this.drafts.valueFor('2', 'evidence', 'Second saved'),
        'Second saved'
      );

      this.drafts.remember('2', 'evidence', 'Second finding');

      assert.strictEqual(
        this.drafts.valueFor('1', 'evidence', 'First saved'),
        'First saved',
        'going back reads the record, not the stale draft'
      );
    });
  }
);
