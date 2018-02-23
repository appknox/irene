import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';

moduleForModel('analysis', 'Unit | Model | analysis', {

  needs: ['model:file', 'model:vulnerability']
});

test('it exists', function(assert) {
  const analysis = this.subject();
  assert.equal(analysis.get('isScanning'), 0, "Unknown");
  let store = this.store();
  Ember.run(function() {
    assert.equal(analysis.hasType(), false, "No type");
    analysis.set('vulnerability', store.createRecord('vulnerability', {
        types: [1,2,3]
      })
    );
    assert.equal(analysis.hasType(1), true, "Has Type");
  });
  assert.equal(analysis.get('isRisky'), true, "Is Risky");
});
