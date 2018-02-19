import installPendo from '../../../utils/install-pendo';
import { module, test } from 'qunit';

module('Unit | Utility | install pendo');

test('it works', function(assert) {
  const result = installPendo();
  assert.ok(true);
});
