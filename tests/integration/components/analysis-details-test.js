import Ember from 'ember';
import ENUMS from 'irene/enums';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('analysis-details', 'Integration | Component | analysis details', {
  unit: true
});

test('tapping button fires an external action', function(assert) {
  assert.expect(2);

  var component = this.subject();

  Ember.run(function() {
    component.set('analysis', {risk:ENUMS.RISK.UNKNOWN});
    assert.equal(component.get('progressClass'), "is-progress", "Progress");
    component.send('toggleVulnerability');
    assert.equal(component.get('showVulnerability'),true, "Show Vulnerability");
  });
});
