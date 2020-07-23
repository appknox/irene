import ENUMS from 'irene/enums';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Integration | Component | submission details', function(hooks) {
  setupTest(hooks);

  test('it renders', function(assert) {
    assert.expect(1);
    this.render(hbs("{{submission-details}}"));
    assert.equal(this.$().text().trim(), '');
  });

  test('tapping button fires an external action', function(assert) {
    assert.expect(3);
    var component = this.owner.factoryFor('component:submission-details').create();
    run(function() {
      assert.equal(component.get('messageClass'), "is-progress", "Progress");
      component.set('submission', { status: ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED});
      assert.equal(component.get('messageClass'), "is-danger", "Danger");
      component.set('submission', { status: ENUMS.SUBMISSION_STATUS.ANALYZING});
      assert.equal(component.get('messageClass'), "is-success", "Success");
    });
  });
});
