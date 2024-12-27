import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import {
  buildURLEncodedFormData,
  buildMultipartFormData,
} from 'irene/services/ajax';

module('Unit | Service | ajax', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:ajax');
    assert.ok(service);
  });

  test('it should make a GET request', async function (assert) {
    const service = this.owner.lookup('service:ajax');
    const fakeResponse = { data: 'test' };

    this.server.get(`test-url`, () => {
      return fakeResponse;
    });

    const response = await service.request('test-url');

    assert.deepEqual(response, fakeResponse);
  });

  test('it should make a POST request', async function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:ajax');
    const fakeResponse = { data: 'test post response' };
    const requestData = { key: 'value' };

    this.server.post('test-url', (schema, request) => {
      const requestBody = JSON.parse(request.requestBody);

      assert.deepEqual(
        requestBody,
        requestData,
        'The correct data was sent in the POST request'
      );

      return fakeResponse;
    });

    const response = await service.post('test-url', { data: requestData });

    assert.deepEqual(
      response,
      fakeResponse,
      'The response matches the fake response'
    );
  });

  test('it should make a PUT request', async function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:ajax');
    const fakeResponse = { data: 'test put response' };
    const requestData = { key: 'new value' };

    this.server.put('test-url', (schema, request) => {
      const requestBody = JSON.parse(request.requestBody);

      assert.deepEqual(
        requestBody,
        requestData,
        'The correct data was sent in the PUT request'
      );

      return fakeResponse;
    });

    const response = await service.put('test-url', { data: requestData });

    assert.deepEqual(
      response,
      fakeResponse,
      'The response matches the fake response'
    );
  });

  test('it should make a DELETE request', async function (assert) {
    const service = this.owner.lookup('service:ajax');
    const fakeResponse = { data: 'test delete response' };

    this.server.delete('test-url', () => {
      return fakeResponse;
    });

    const response = await service.delete('test-url');

    assert.deepEqual(
      response,
      fakeResponse,
      'The response matches the fake response'
    );
  });

  test('it should include custom headers in the request', async function (assert) {
    assert.expect(1);

    const service = this.owner.lookup('service:ajax');
    const fakeResponse = { data: 'test' };
    const customHeaders = { 'X-Custom-Header': 'custom-value' };

    this.server.get('test-url', (schema, request) => {
      assert.ok(
        request.requestHeaders['X-Custom-Header'],
        'Custom header is present'
      );
      return fakeResponse;
    });

    await service.request('test-url', { headers: customHeaders });
  });

  test('it should handle empty response correctly', async function (assert) {
    const service = this.owner.lookup('service:ajax');

    this.server.get('test-url', () => {
      return '';
    });

    const response = await service.request('test-url');

    assert.deepEqual(response, {}, 'The response is an empty object');
  });

  test('it should correctly parse valid JSON response', async function (assert) {
    assert.expect(1);

    const service = this.owner.lookup('service:ajax');
    const fakeResponse = { data: 'test' };

    this.server.get('test-url', () => {
      return fakeResponse;
    });

    const response = await service.request('test-url');

    assert.deepEqual(
      response,
      fakeResponse,
      'The response is parsed correctly as JSON'
    );
  });

  test('it should send URL encoded form data', async function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:ajax');
    const formData = { key: 'value', other: 123 };
    const encodedData = buildURLEncodedFormData(formData);

    this.server.post('test-url', (schema, request) => {
      assert.strictEqual(
        request.requestBody,
        'key=value&other=123',
        'Data is properly URL encoded'
      );

      assert.strictEqual(
        request.requestHeaders['Content-Type'],
        'application/x-www-form-urlencoded',
        'Content-Type is set to form-urlencoded'
      );

      return {};
    });

    await service.post('test-url', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: encodedData,
    });
  });

  test('it should send multipart form data', async function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:ajax');

    const data = {
      text: 'test value',
      file: new Blob(['test content'], { type: 'text/plain' }),
    };

    const formData = buildMultipartFormData(data);

    this.server.post('test-url', (schema, request) => {
      assert.true(
        request.requestBody instanceof FormData,
        'Request body is FormData instance'
      );

      assert.strictEqual(
        request.requestHeaders['Content-Type'],
        'multipart/form-data',
        'Content-Type is set to multipart/form-data'
      );

      return {};
    });

    await service.post('test-url', {
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData,
    });
  });

  test('buildURLEncodedFormData utility function', async function (assert) {
    const data = {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
    };

    const encoded = buildURLEncodedFormData(data);

    assert.strictEqual(
      encoded,
      'name=John%20Doe&age=30&email=john%40example.com',
      'Data is properly URL encoded'
    );
  });

  test('buildMultipartFormData utility function', async function (assert) {
    const data = {
      text: 'test value',
      file: new Blob(['test content'], { type: 'text/plain' }),
    };

    const formData = buildMultipartFormData(data);

    assert.true(formData instanceof FormData, 'Returns FormData instance');

    assert.strictEqual(
      formData.get('text'),
      'test value',
      'Text field is set correctly'
    );

    assert.true(
      formData.get('file') instanceof Blob,
      'File field is set as Blob'
    );
  });

  test('it should process FormData with multipart/form-data Content-Type', async function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:ajax');

    const formData = new FormData();
    formData.append('key', 'value');

    this.server.post('test-url', (schema, request) => {
      assert.true(
        request.requestBody instanceof FormData,
        'Request body is FormData instance'
      );

      assert.strictEqual(
        request.requestHeaders['Content-Type'],
        'multipart/form-data',
        'Content-Type is set to multipart/form-data'
      );

      return {};
    });

    await service.post('test-url', {
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData,
    });
  });

  test('it should process Blob with appropriate Content-Type', async function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:ajax');
    const blob = new Blob(['test'], { type: 'text/plain' });

    this.server.post('test-url', (schema, request) => {
      assert.true(
        request.requestBody instanceof Blob,
        'Request body is Blob instance'
      );

      assert.strictEqual(
        request.requestHeaders['Content-Type'],
        'text/plain',
        'Content-Type matches Blob type'
      );

      return {};
    });

    await service.post('test-url', {
      headers: { 'Content-Type': 'text/plain' },
      data: blob,
    });
  });

  test('it should send string data with appropriate Content-Type', async function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:ajax');
    const stringData = 'test=value&other=123';

    this.server.post('test-url', (schema, request) => {
      assert.strictEqual(
        request.requestBody,
        stringData,
        'String data is sent unmodified'
      );

      assert.strictEqual(
        request.requestHeaders['Content-Type'],
        'application/x-www-form-urlencoded',
        'Content-Type is set to form-urlencoded for URL-encoded string'
      );

      return {};
    });

    await service.post('test-url', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: stringData,
    });
  });

  test('it should stringify objects as JSON', async function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:ajax');
    const objectData = { test: 'value', number: 123 };

    this.server.post('test-url', (schema, request) => {
      assert.strictEqual(
        request.requestBody,
        JSON.stringify(objectData),
        'Object is stringified as JSON'
      );

      assert.strictEqual(
        request.requestHeaders['Content-Type'],
        'application/json',
        'Content-Type is application/json'
      );

      return {};
    });

    await service.post('test-url', { data: objectData });
  });

  test('it should allow overriding Content-Type header', async function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:ajax');
    const data = { test: 'value' };
    const customContentType = 'application/x-www-form-urlencoded';

    this.server.post('test-url', (schema, request) => {
      assert.strictEqual(
        request.requestHeaders['Content-Type'],
        customContentType,
        'Custom Content-Type is used'
      );

      assert.strictEqual(
        request.requestBody,
        JSON.stringify(data),
        'Data is still JSON stringified'
      );

      return {};
    });

    await service.post('test-url', {
      headers: { 'Content-Type': customContentType },
      data,
    });
  });

  test('it should handle null or undefined data', async function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('service:ajax');

    this.server.post('test-url', (schema, request) => {
      assert.strictEqual(request.requestBody, null, 'Request body is null');

      assert.strictEqual(
        request.requestHeaders['Content-Type'],
        'application/json',
        'Default Content-Type is still set'
      );

      return {};
    });

    await service.post('test-url', { data: null });
  });
});
