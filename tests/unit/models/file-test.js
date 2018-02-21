import { moduleForModel, test } from 'ember-qunit';

moduleForModel('file', 'Unit | Model | file', {
  needs: ['model:project', 'model:analysis', 'model:user']
});

test('it passes', function(assert) {
  const file = this.subject();
  assert.equal(file.get('ifManualNotRequested'), true, "Manual Requested");
  assert.equal(file.get('isRunningApiScan'), true, "API Scan");
  assert.equal(file.get('isStaticCompleted'), false, "Static Scan");
  assert.equal(file.get('isNoneStatus'), false, "None Status");
  assert.equal(file.get('isReady'), false, "Is Ready");
  assert.equal(file.get('isNeitherNoneNorReady'), true, "Is Not None Nor Ready");
});
