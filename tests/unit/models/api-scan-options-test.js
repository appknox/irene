import { moduleForModel, test} from 'ember-qunit';
import { run } from '@ember/runloop';

moduleForModel('api-scan-options', 'Unit | Model | api scan options', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  const apiScanOptions = this.subject();
  run(function() {
    apiScanOptions.set('apiUrlFilters', "test.com");
    assert.equal(apiScanOptions.get('apiUrlFilterItems'), "test.com", "No role");
  });
});
