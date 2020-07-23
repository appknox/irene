import ENUMS from 'irene/enums';
import { module, test } from 'qunit';
import { appAction } from 'irene/helpers/app-action';

module('Unit | Helper | app action', function() {
  test('it works', function(assert) {
    assert.equal(appAction([42]), "noPreference", "No Preference");
    assert.equal(appAction([ENUMS.APP_ACTION.NO_PREFERENCE]), "noPreference", "No Preference");
    assert.equal(appAction([ENUMS.APP_ACTION.HALT]), "halt", "Halt");
    assert.equal(appAction([ENUMS.APP_ACTION.PROCEED]), "proceed", "Proceed");
  });
});
