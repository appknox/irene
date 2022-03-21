/* eslint-disable prettier/prettier, qunit/no-assert-equal */
import ENUMS from 'irene/enums';
import { module, test } from 'qunit';
import { deviceType } from 'irene/helpers/device-type';

module('Unit | Helper | device type', function() {
  test('it works', function(assert) {
    assert.equal(deviceType([42]), "anyDevice", "No Preference");
    assert.equal(deviceType([ENUMS.DEVICE_TYPE.NO_PREFERENCE]), "anyDevice", "No Preference");
    assert.equal(deviceType([ENUMS.DEVICE_TYPE.PHONE_REQUIRED]), "phone", "Phone");
    assert.equal(deviceType([ENUMS.DEVICE_TYPE.TABLET_REQUIRED]), "tablet", "Tablet");
  });
});
