import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import RequestWrapper from '../../Actions/api/request.wrapper';
import ResponseValidator from '../../utils/response.validator';
import SchemaValidator from '../../utils/schema.validator';
import TokenManager from '../../Actions/api/token.manager';
import { API_ROUTES, resolveRoute } from '../../support/api.routes';
import state from '../../support/test-state';

let wrapper: RequestWrapper;
let tagId: number;

test.describe.serial('Tags API', () => {
  test.beforeAll(async () => {
    wrapper = new RequestWrapper();
    await wrapper.init();
  });

  test.afterAll(async () => {
    TokenManager.clearTokens();
    await wrapper.dispose();
  });

  test('POST /api/v2/files/:id/tags — creates a tag', async () => {
    await allure.epic('Tags');
    await allure.feature('File Tags');
    await allure.story('User adds a tag to a file');
    await allure.severity('normal');
    await allure.tags('tags', 'smoke');

    const response = await allure.step('POST create tag', async () => {
      return await wrapper.post({
        endpoint: resolveRoute(API_ROUTES.fileTags.route, state.fileId),
        body: { name: 'automated-test-tag' },
      });
    });

    const body = await allure.step(
      'Validate status 201 and schema',
      async () => {
        return await ResponseValidator.validate(response, {
          status: 201,
          requiredFields: ['id', 'name', 'color'],
        });
      }
    );

    await allure.step('Validate tag schema and save tagId', async () => {
      SchemaValidator.validate(body, {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true },
        color: { type: 'string', required: true },
      });
      tagId = body.id as number;
      expect(body.name as string).toBe('automated-test-tag');
    });
  });

  test('GET /api/v2/files/:id/tags — returns tag list', async () => {
    await allure.epic('Tags');
    await allure.feature('File Tags');
    await allure.story('User views tags for a file');
    await allure.severity('normal');
    await allure.tags('tags', 'regression');

    const response = await allure.step('GET tags', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.fileTags.route, state.fileId),
      });
    });

    const body = await allure.step('Validate status 200', async () => {
      return await ResponseValidator.validate(response, { status: 200 });
    });

    await allure.step('Verify tag exists in list', async () => {
      const results = body.results as Record<string, unknown>[];
      const tag = results.find((t) => t.id === tagId);
      expect(tag).toBeDefined();
    });
  });

  test('DELETE /api/v2/files/:id/tags/:tagId — removes tag', async () => {
    await allure.epic('Tags');
    await allure.feature('File Tags');
    await allure.story('User removes a tag from a file');
    await allure.severity('normal');
    await allure.tags('tags', 'smoke');

    const response = await allure.step('DELETE tag', async () => {
      return await wrapper.delete({
        endpoint: resolveRoute(
          API_ROUTES.fileTagById.route,
          state.fileId,
          tagId
        ),
      });
    });

    await allure.step('Validate status 204', async () => {
      expect(response.status()).toBe(204);
    });
  });

  test('GET /api/v2/files/:id/tags — verify tag removed', async () => {
    await allure.epic('Tags');
    await allure.feature('File Tags');
    await allure.story('Tag is removed from file');
    await allure.severity('normal');
    await allure.tags('tags', 'regression');

    const response = await allure.step('GET tags after delete', async () => {
      return await wrapper.get({
        endpoint: resolveRoute(API_ROUTES.fileTags.route, state.fileId),
      });
    });

    const body = await allure.step('Validate status 200', async () => {
      return await ResponseValidator.validate(response, { status: 200 });
    });

    const results = body.results as Record<string, unknown>[];
    const tag = results.find((t) => t.id === tagId);
    expect(tag).toBeUndefined();
  });

  test('POST — create tag with empty name returns 400', async () => {
    await allure.epic('Tags');
    await allure.feature('File Tags');
    await allure.story('Tag creation fails with empty name');
    await allure.severity('normal');
    await allure.tags('tags', 'negative');

    const response = await allure.step('POST empty name', async () => {
      return await wrapper.post({
        endpoint: resolveRoute(API_ROUTES.fileTags.route, state.fileId),
        body: { name: '' },
      });
    });

    await allure.step('Validate status 400', async () => {
      await ResponseValidator.validate(response, { status: 400 });
    });
  });

  test('DELETE — non-existent tag returns 404', async () => {
    await allure.epic('Tags');
    await allure.feature('File Tags');
    await allure.story('Delete fails for non-existent tag');
    await allure.severity('normal');
    await allure.tags('tags', 'negative');

    const response = await allure.step(
      'DELETE non-existent tagId',
      async () => {
        return await wrapper.delete({
          endpoint: resolveRoute(
            API_ROUTES.fileTagById.route,
            state.fileId,
            999999
          ),
        });
      }
    );

    await allure.step('Validate status 404', async () => {
      expect(response.status()).toBe(404);
    });
  });

  test('GET — tags for non-existent file returns 404', async () => {
    await allure.epic('Tags');
    await allure.feature('File Tags');
    await allure.story('Get tags fails for non-existent file');
    await allure.severity('normal');
    await allure.tags('tags', 'negative');

    const response = await allure.step(
      'GET tags for invalid fileId',
      async () => {
        return await wrapper.get({
          endpoint: resolveRoute(API_ROUTES.fileTags.route, 999999),
        });
      }
    );

    await allure.step('Validate status 404', async () => {
      expect(response.status()).toBe(404);
    });
  });
});
