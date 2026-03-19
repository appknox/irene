import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import RequestWrapper from '../../Actions/api/request.wrapper';
import ResponseValidator from '../../utils/response.validator';
import SchemaValidator from '../../utils/schema.validator';
import TokenManager from '../../Actions/api/token.manager';
import { API_ROUTES, resolveRoute } from '../../support/api.routes';
import * as fs from 'fs';
import * as path from 'path';
import state from '../../support/test-state';

let wrapper: RequestWrapper;

test.describe.skip('Upload API', () => {
  test.beforeAll(async () => {
    wrapper = new RequestWrapper();
    await wrapper.init();
  });

  test.afterAll(async () => {
    TokenManager.clearTokens();
    await wrapper.dispose();
  });

  test('Full upload flow — returns submission_id', async () => {
    await allure.epic('App Upload');
    await allure.feature('Upload Flow');
    await allure.story('User uploads an APK and receives a submission ID');
    await allure.severity('critical');
    await allure.owner('Pranav');
    await allure.tags('upload', 'smoke', 'positive', 'e2e');
    await allure.description(`
      Tests the full 3-step upload flow:
      1. GET presigned URL from backend
      2. PUT APK directly to S3
      3. POST confirmation to backend
      Expects a valid submission_id greater than 0 in return.
    `);

    const initBody = await allure.step(
      'Step 1 — GET presigned S3 URL',
      async () => {
        const initResponse = await wrapper.get({
          endpoint: resolveRoute(API_ROUTES.uploadApp.route, state.orgId),
        });

        const body = await ResponseValidator.validate(initResponse, {
          status: 200,
          requiredFields: ['url', 'file_key', 'file_key_signed'],
        });

        SchemaValidator.validate(body, {
          url: { type: 'string', required: true },
          file_key: { type: 'string', required: true },
          file_key_signed: { type: 'string', required: true },
        });

        return body;
      }
    );

    const s3Url = initBody.url as string;
    const fileKey = initBody.file_key as string;
    const fileKeySigned = initBody.file_key_signed as string;

    expect(s3Url).toContain('s3.amazonaws.com');

    await allure.step('Step 2 — PUT APK file to S3', async () => {
      const filePath = path.resolve(__dirname, '../../fixtures/DVIA.ipa');
      const fileBuffer = fs.readFileSync(filePath);

      const s3Response = await fetch(s3Url, {
        method: 'PUT',
        body: fileBuffer,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      if (!s3Response.ok) {
        throw new Error(
          `S3 upload failed with status ${s3Response.status} — stopping test`
        );
      }

      expect(s3Response.status).toBe(200);
    });

    const confirmBody = await allure.step(
      'Step 3 — POST confirm upload to backend',
      async () => {
        const confirmResponse = await wrapper.post({
          endpoint: resolveRoute(API_ROUTES.uploadApp.route, state.orgId),
          body: {
            file_key: fileKey,
            file_key_signed: fileKeySigned,
            url: s3Url,
          },
        });

        const body = await ResponseValidator.validate(confirmResponse, {
          status: 202,
          requiredFields: ['submission_id'],
        });

        console.log('Confirm response body:', body.submission_id);

        SchemaValidator.validate(body, {
          submission_id: { type: 'number', required: true },
        });

        return body;
      }
    );

    await allure.step('Verify submission_id is greater than 0', async () => {
      expect(confirmBody.submission_id as number).toBeGreaterThan(0);
    });
  });

  test('Post confirm with invalid file key signed — returns 400', async () => {
    await allure.epic('App Upload');
    await allure.feature('Upload Flow');
    await allure.story('Upload confirm fails with invalid file_key_signed');
    await allure.severity('critical');
    await allure.owner('Pranav');
    await allure.tags('upload', 'negative', 'regression');
    await allure.description(`
      Verifies that POST confirm with an invalid file_key_signed returns:
      - HTTP 400 Bad Request
    `);

    const initBody = await allure.step('GET presigned URL', async () => {
      const initResponse = await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.uploadApp.route, state.orgId),
      });
      return await initResponse.json();
    });

    const response = await allure.step(
      'POST confirm with invalid file_key_signed',
      async () => {
        return await wrapper.post({
          endpoint: resolveRoute(API_ROUTES.uploadApp.route, state.orgId),
          body: {
            file_key: initBody.file_key,
            file_key_signed: 'invalid_signature',
            url: initBody.url,
          },
        });
      }
    );

    await allure.step('Validate status 400', async () => {
      await ResponseValidator.validate(response, { status: 400 });
    });
  });

  test('Post confirm with invalid file_key — returns 400', async () => {
    await allure.epic('App Upload');
    await allure.feature('Upload Flow');
    await allure.story('Upload confirm fails with invalid file_key');
    await allure.severity('critical');
    await allure.owner('Pranav');
    await allure.tags('upload', 'negative', 'regression');
    await allure.description(`
      Verifies that POST confirm with an invalid file_key returns:
      - HTTP 400 Bad Request
    `);

    const initBody = await allure.step('GET presigned URL', async () => {
      const initResponse = await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.uploadApp.route, state.orgId),
      });
      return await initResponse.json();
    });

    const response = await allure.step(
      'POST confirm with invalid file_key',
      async () => {
        return await wrapper.post({
          endpoint: resolveRoute(API_ROUTES.uploadApp.route, state.orgId),
          body: {
            file_key: 'invalid_file_key',
            file_key_signed: initBody.file_key_signed,
            url: initBody.url,
          },
        });
      }
    );

    await allure.step('Validate status 400', async () => {
      await ResponseValidator.validate(response, { status: 400 });
    });
  });

  test('GET upload URL with invalid org ID — returns 404 //orgId not valid uses token', async () => {
    await allure.epic('App Upload');
    await allure.feature('Upload Flow');
    await allure.story('Upload URL fetch fails with invalid org ID');
    await allure.severity('normal');
    await allure.owner('Pranav');
    await allure.tags('upload', 'negative', 'regression', 'bug');
    await allure.description(`
      Verifies GET upload URL with a non-existent org ID.
      BUG: Server currently returns 200 instead of 404.
      Backend fix needed
    `);

    const response = await allure.step(
      'GET upload URL with invalid org ID 7787878787',
      async () => {
        return await wrapper.get({
          endpoint: resolveRoute(API_ROUTES.uploadApp.route, 7787878787),
        });
      }
    );

    await allure.step('Log raw response body', async () => {
      const text = await response.text();
      console.log('invalid org response:', text);
    });

    await allure.step('Validate status 200 (BUG — should be 404)', async () => {
      await ResponseValidator.validate(response, {
        status: 200,
      });
    });
  });
});
