import { module, test } from 'qunit';

import ENUMS from 'irene/enums';
import apiScanUrlHasResults from 'irene/utils/api-scan-url-has-results';

const URL_STATUS = ENUMS.API_SCAN_URL_STATUS;

module('Unit | Utility | api-scan-url-has-results', function () {
  test.each(
    'it reports whether the endpoint has results for each status',
    [
      [URL_STATUS.COMPLETED, 0, true],
      [URL_STATUS.COMPLETED, 3, true],
      [URL_STATUS.CANCELLED, 2, true],
      [URL_STATUS.CANCELLED, 0, false],
      [URL_STATUS.PENDING, 0, false],
      [URL_STATUS.IN_PROGRESS, 0, false],
      [URL_STATUS.FAILED, 0, false],
    ],
    function (assert, [status, count, expected]) {
      assert.strictEqual(apiScanUrlHasResults(status, count), expected);
    }
  );
});
