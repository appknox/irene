import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('compare-files', 'Integration | Component | compare files', {
  unit: true
});

test('tapping button fires an external action', function(assert) {
  assert.expect(3);

  var component = this.subject();

  Ember.run(function() {
    assert.equal(component.get('summaryClass'), "is-active", "Summary Class");
    component.set("isReverse", true);
    component.set("isSummary", false);
    assert.equal(component.get('detailsClass'), "is-active", "Details Class");
    component.send('displaySummary');
    component.send('displayDetails');
    assert.equal(component.get('isSummary'),false, "Display");
    //
    // component.set("file1", {analyses: [{id: 1, risk:2, vulnerability: {id: 1}},{id: 2, risk:3, vulnerability: {id: 2}},{id: 3, risk:4, vulnerability: {id: 3}}]});
    // component.set("file2", {analyses: [{id: 1, risk:2, vulnerability: {id: 1}},{id: 2, risk:3, vulnerability: {id: 2}},{id: 3, risk:4, vulnerability: {id: 3}}]});
    //
    // assert.equal(component.get('comparisons'), "is-active", "Active");
  });
});
