import { test, moduleForComponent } from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForComponent('compare-files', 'Integration | Component | compare files', {
  unit: true
});

test('tapping button fires an external action', function(assert) {
  assert.expect(4);

  var component = this.subject();

  run(function() {
    assert.equal(component.get('summaryClass'), "is-active", "Summary Class");
    component.set("isReverse", true);
    component.set("isSummary", false);
    assert.equal(component.get('detailsClass'), "is-active", "Details Class");
    component.send('displaySummary');
    component.send('displayDetails');
    assert.equal(component.get('isSummary'),false, "Display");
    assert.notOk(component.get('comparisons'));
  });
});
