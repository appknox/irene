import Ember from 'ember';
import ENUMS from 'irene/enums';
import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('analysis-details', 'Integration | Component | analysis details', {
  unit: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{analysis-details}}"));

  assert.equal(this.$().text().trim(), '');
});

test('tapping button fires an external action', function(assert) {
  assert.expect(1);

  var component = this.subject();

  Ember.run(function() {
    component.set('analysis', {risk:ENUMS.RISK.UNKNOWN});
    assert.equal(component.get('progressClass'), "is-progress", "Progress");
  });
});
