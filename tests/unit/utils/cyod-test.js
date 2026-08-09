import { module, test } from 'qunit';
import ENUMS from 'irene/enums';
import {
  canManageSigningCertificates,
  showsProjectSigningCertificate,
} from 'irene/utils/cyod';

module('Unit | Utility | cyod', function () {
  module('canManageSigningCertificates', function () {
    test('either management role qualifies', function (assert) {
      assert.true(
        canManageSigningCertificates(true, false),
        'an admin who is not an owner may manage'
      );

      assert.true(
        canManageSigningCertificates(false, true),
        'an owner who is not an admin may manage'
      );

      assert.true(canManageSigningCertificates(true, true), 'both roles');
    });

    test('a plain member may not manage', function (assert) {
      assert.false(canManageSigningCertificates(false, false));
    });

    test('absent flags are treated as no permission', function (assert) {
      // `me.org` is undefined until organization-me resolves, so the getter
      // reads through with `?.` and hands us undefined on first render. Failing
      // closed keeps the panel hidden rather than flashing it to a member.
      assert.false(canManageSigningCertificates(undefined, undefined));
      assert.false(canManageSigningCertificates(undefined, false));
    });
  });

  module('showsProjectSigningCertificate', function () {
    test('an iOS project shown to a manager renders the section', function (assert) {
      assert.true(
        showsProjectSigningCertificate(true, ENUMS.PLATFORM.IOS, true),
        'the only combination that renders'
      );
    });

    test('a non-iOS project never shows it', function (assert) {
      assert.false(
        showsProjectSigningCertificate(true, ENUMS.PLATFORM.ANDROID, true),
        'iOS signing certificates do not apply to Android scans'
      );

      assert.false(
        showsProjectSigningCertificate(true, ENUMS.PLATFORM.WINDOWS, true),
        'nor to Windows'
      );
    });

    test('CYOD registration switched off hides it even for iOS', function (assert) {
      assert.false(
        showsProjectSigningCertificate(false, ENUMS.PLATFORM.IOS, true),
        'the whole CYOD surface collapses with the switch'
      );
    });

    test('a user without a management role never sees it', function (assert) {
      // The certificate carries the customer's signing identity, and the
      // org-scope panel is owner-only. Without this the project-scope override
      // would hand plain members a way around that gate.
      assert.false(
        showsProjectSigningCertificate(true, ENUMS.PLATFORM.IOS, false),
        'a member on an eligible iOS project still gets nothing'
      );
    });

    test('it returns a boolean for absent inputs rather than undefined', function (assert) {
      // The org service value is undefined until the org loads, and the project
      // may be null. Callers use this to drive an {{#if}} for a divider, so a
      // falsy-but-not-false result would still work, but returning a real
      // boolean keeps the two call sites comparable.
      assert.false(
        showsProjectSigningCertificate(undefined, undefined, undefined)
      );
      assert.false(showsProjectSigningCertificate(true, undefined, true));
      assert.false(
        showsProjectSigningCertificate(undefined, ENUMS.PLATFORM.IOS, true)
      );
      assert.false(
        showsProjectSigningCertificate(true, ENUMS.PLATFORM.IOS, undefined)
      );
    });
  });
});
