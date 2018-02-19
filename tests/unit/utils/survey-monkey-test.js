import surveyMonkey from '../../../utils/survey-monkey';
import { module, test } from 'qunit';

module('Unit | Utility | survey monkey');

test('it works', function(assert) {
  const result = surveyMonkey();
  assert.ok(true);
});
