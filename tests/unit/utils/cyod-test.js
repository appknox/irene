import { module, test } from 'qunit';
import ENUMS from 'irene/enums';
import { showsProjectSigningCertificate } from 'irene/utils/cyod';

module('Unit | Utility | cyod', function () {
  module('showsProjectSigningCertificate', function () {
    test('an iOS project with CYOD registration on shows the section', function (assert) {
      assert.true(
        showsProjectSigningCertificate(true, ENUMS.PLATFORM.IOS),
        'the only combination that renders'
      );
    });

    test('a non-iOS project never shows it', function (assert) {
      assert.false(
        showsProjectSigningCertificate(true, ENUMS.PLATFORM.ANDROID),
        'iOS signing certificates do not apply to Android scans'
      );

      assert.false(
        showsProjectSigningCertificate(true, ENUMS.PLATFORM.WINDOWS),
        'nor to Windows'
      );
    });

    test('CYOD registration switched off hides it even for iOS', function (assert) {
      assert.false(
        showsProjectSigningCertificate(false, ENUMS.PLATFORM.IOS),
        'the whole CYOD surface collapses with the switch'
      );
    });

    test('it returns a boolean for absent inputs rather than undefined', function (assert) {
      // The org service value is undefined until the org loads, and the project
      // may be null. Callers use this to drive an {{#if}} for a divider, so a
      // falsy-but-not-false result would still work, but returning a real
      // boolean keeps the two call sites comparable.
      assert.false(showsProjectSigningCertificate(undefined, undefined));
      assert.false(showsProjectSigningCertificate(true, undefined));
      assert.false(
        showsProjectSigningCertificate(undefined, ENUMS.PLATFORM.IOS)
      );
    });
  });
});
