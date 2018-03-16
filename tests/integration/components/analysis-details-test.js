import Ember from 'ember';
import ENUMS from 'irene/enums';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('analysis-details', 'Integration | Component | analysis details', {
  unit: true
});

test('tapping button fires an external action', function(assert) {

  var component = this.subject();

  Ember.run(function() {
    component.set('analysis', {risk:ENUMS.RISK.NONE});
    assert.equal(component.get('riskClass'), "is-success", "Success");
    component.set('analysis', {risk:ENUMS.RISK.LOW});
    assert.equal(component.get('riskClass'), "is-info", "Info");
    component.set('analysis', {risk:ENUMS.RISK.MEDIUM});
    assert.equal(component.get('riskClass'), "is-warning", "Warning");
    component.set('analysis', {risk:ENUMS.RISK.HIGH});
    assert.equal(component.get('riskClass'), "is-danger", "Danger");
    component.set('analysis', {risk:ENUMS.RISK.CRITICAL});
    assert.equal(component.get('riskClass'), "is-critical", "Critical");

    component.set('analysis', {risk:ENUMS.RISK.UNKNOWN});

    assert.equal(component.get('progressClass'), "is-progress", "Progress");
    component.send('toggleVulnerability');
    assert.equal(component.get('showVulnerability'),true, "Show Vulnerability");
  });
});
