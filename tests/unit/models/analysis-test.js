import { moduleForModel, test } from 'ember-qunit';

moduleForModel('analysis', 'Unit | Model | analysis', {

  needs: ['model:file', 'model:vulnerability']
});

test('it exists', function(assert) {
  const analysis = this.subject();
  assert.equal(analysis.get('isScanning'), 0, "Unknown");
});

test('it exists', function(assert) {
  const analysis = this.subject();
  assert.equal(analysis.get('isRisky'), true, "Is Risky");
});

test('it exists', function(assert) {
  const analysis = this.subject();
  assert.equal(analysis.get('iconClass'), undefined, "Is Risky");
});

test('it exists', function(assert) {
  const analysis = this.subject();
  assert.equal(analysis.get('labelClass'), undefined, "Is Risky");
});
