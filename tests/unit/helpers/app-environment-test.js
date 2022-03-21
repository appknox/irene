/* eslint-disable prettier/prettier, qunit/no-assert-equal */
import ENUMS from 'irene/enums';
import { module, test } from 'qunit';
import { appEnvironment } from 'irene/helpers/app-environment';

module('Unit | Helper | app environment', function() {
  test('it works', function(assert) {
    assert.equal(appEnvironment([42]), "noPreference", "No Preference");
    assert.equal(appEnvironment([ENUMS.APP_ENV.NO_PREFERENCE]), "noPreference", "No Preference");
    assert.equal(appEnvironment([ENUMS.APP_ENV.STAGING]), "staging", "Staging");
    assert.equal(appEnvironment([ENUMS.APP_ENV.PRODUCTION]), "production", "Production");
  });
});
