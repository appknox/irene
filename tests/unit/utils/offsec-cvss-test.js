import { module, test } from 'qunit';

import {
  CVSS_BANDS,
  cvssBand,
  cvssFields,
  cvssScore,
  mergedCvssFields,
} from 'irene/utils/offsec-cvss';

const CRITICAL = { score: 9.3, rating: 'Critical', vector: 'CVSS:4.0/AV:N' };
const LOW = { score: 2.7, rating: 'Low', vector: 'CVSS:4.0/AV:L' };

const finding = (cvss, extra = {}) => ({
  kind: 'key',
  audit: { status: 'valid', cvss },
  ...extra,
});

module('Unit | Utility | offsec-cvss', function () {
  test('bands run from most to least severe', function (assert) {
    assert.deepEqual(CVSS_BANDS, ['critical', 'high', 'medium', 'low']);
  });

  test.each(
    'cvssBand maps a rating to its band',
    [
      ['Critical', 'critical'],
      ['HIGH', 'high'],
      ['Medium', 'medium'],
      ['low', 'low'],
      ['None', 'none'],
      ['', 'none'],
      [null, 'none'],
      [undefined, 'none'],
    ],
    function (assert, [rating, band]) {
      assert.strictEqual(cvssBand(rating), band);
    }
  );

  test('cvssScore reads the audit score, null when unscored', function (assert) {
    assert.strictEqual(cvssScore(finding(CRITICAL)), 9.3);
    assert.strictEqual(cvssScore(finding(null)), null);
    assert.strictEqual(cvssScore({ kind: 'key' }), null);
  });

  test('cvssFields takes the highest score and the single finding’s proof of concept', function (assert) {
    assert.deepEqual(
      cvssFields([finding(LOW, { reproduced: true, poc_reason: 'seen' })]),
      { cvss: LOW, reproduced: true, poc_reason: 'seen' }
    );

    assert.deepEqual(
      cvssFields([
        finding(LOW, { reproduced: false, poc_reason: 'a' }),
        finding(null),
        finding(CRITICAL, { reproduced: true, poc_reason: 'b' }),
      ]),
      { cvss: CRITICAL, reproduced: true, poc_reason: undefined }
    );
  });

  test('cvssFields reads as not reproduced only when every tried proof of concept failed', function (assert) {
    assert.false(
      cvssFields([
        finding(LOW, { reproduced: false }),
        finding(CRITICAL, { reproduced: false }),
        finding(CRITICAL),
      ]).reproduced
    );
    assert.strictEqual(cvssFields([finding(LOW)]).reproduced, undefined);
  });

  test('cvssFields of no findings is empty', function (assert) {
    assert.deepEqual(cvssFields([]), {
      cvss: undefined,
      reproduced: undefined,
      poc_reason: undefined,
    });
  });

  test('mergedCvssFields combines the cards of one kind the same way', function (assert) {
    assert.deepEqual(
      mergedCvssFields([
        { cvss: LOW, reproduced: false },
        { cvss: CRITICAL, reproduced: false },
      ]),
      { cvss: CRITICAL, reproduced: false, poc_reason: undefined }
    );

    assert.deepEqual(
      mergedCvssFields([{ cvss: LOW, reproduced: true, poc_reason: 'seen' }]),
      { cvss: LOW, reproduced: true, poc_reason: 'seen' }
    );
  });
});
