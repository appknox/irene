/* eslint-disable prettier/prettier, qunit/no-assert-equal */

import { requestToUrl } from 'irene/helpers/request-to-url';
import { module, test } from 'qunit';

module('Unit | Helper | request to url', function() {
  test('it renders correctly for https default port requests', function(assert) {
    const req = {
      'scheme': 'https',
      'host': 'google.com',
      'port': 443,
      'path': '/search?q=term'
    }
    let result = requestToUrl([req]);
    assert.equal(result, 'https://google.com/search?q=term');
  });

  test('it renders correctly for http default port requests', function(assert) {
    const req = {
      'scheme': 'http',
      'host': 'google.com',
      'port': 80,
      'path': '/search?q=term'
    }
    let result = requestToUrl([req]);
    assert.equal(result, 'http://google.com/search?q=term');
  });

  test('it renders correctly for non-default port requests', function(assert) {
    const req = {
      'scheme': 'https',
      'host': 'google.com',
      'port': 1234,
      'path': '/search?q=term'
    }
    let result = requestToUrl([req]);
    assert.equal(result, 'https://google.com:1234/search?q=term');
  });

  test('it handles invalid inputs', function(assert) {
    const req1 = {'host': 'example.com'}
    let result1 = requestToUrl([req1]);
    assert.equal(result1, '');

    const req2 = null;
    let result2 = requestToUrl([req2]);
    assert.equal(result2, '');
  });
});
