import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { registerRequiredResources } from 'irene/tests/helpers/drf-resources';
import { Response } from 'miragejs';

const posts = [
  {
    id: 1,
    post_title: 'post title 1',
    body: 'post body 1',
    comments: [],
  },
  {
    id: 2,
    post_title: 'post title 2',
    body: 'post body 2',
    comments: [],
  },
  {
    id: 3,
    post_title: 'post title 3',
    body: 'post body 3',
    comments: [],
  },
  {
    id: 4,
    post_title: 'post title 4',
    body: 'post body 4',
    comments: [],
  },
  {
    id: 5,
    post_title: 'post title 5',
    body: 'post body 5',
    comments: [],
  },
  {
    id: 6,
    post_title: 'post title 6',
    body: 'post body 6',
    comments: [],
  },
];

module('Acceptance | DRF: Pagination', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    registerRequiredResources(this.owner);

    this.store = this.owner.lookup('service:store');

    // The implementation of the paginated Pretender server is dynamic
    // so it can be used with all of the pagination tests. Otherwise,
    // different urls would need to be used which would require new
    // models.
    this.server.get('/test-api/posts/', function (_, request) {
      let page = 1,
        pageSize = 4;

      if (request.queryParams.page_size !== undefined) {
        pageSize = Number(request.queryParams.page_size).valueOf();
      }

      let maxPages = posts.length / pageSize;

      if (posts.length % pageSize > 0) {
        maxPages++;
      }

      if (request.queryParams.page !== undefined) {
        page = Number(request.queryParams.page).valueOf();
        if (page > maxPages) {
          return new Response(
            404,
            { 'Content-Type': 'text/html' },
            '<h1>Page not found</h1>'
          );
        }
      }

      let nextPage = page + 1;
      let nextUrl = null;

      if (nextPage <= maxPages) {
        nextUrl = '/test-api/posts/?page=' + nextPage;
      }

      let previousPage = page - 1;
      let previousUrl = null;

      if (previousPage > 1) {
        previousUrl = '/test-api/posts/?page=' + previousPage;
      } else if (previousPage === 1) {
        // The DRF previous URL doesn't always include the page=1 query param in the results for page 2.
        previousUrl = '/test-api/posts/';
      }

      let offset = (page - 1) * pageSize;

      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          count: posts.length,
          next: nextUrl,
          previous: previousUrl,
          results: posts.slice(offset, offset + pageSize),
        })
      );
    });
  });

  test('Retrieve list of paginated records', async function (assert) {
    const response = await this.store.query('post', { page: 1 });

    assert.ok(response);
    assert.strictEqual(response.length, 4);

    // Test the camelCase and non-camelCase fields of a paginated result.
    const post = response[1];

    assert.strictEqual(post.postTitle, 'post title 2');
    assert.strictEqual(post.body, 'post body 2');

    const metadata = response.meta;

    assert.strictEqual(metadata.count, 6);
    assert.strictEqual(metadata.next, 2);
    assert.strictEqual(metadata.previous, null);
  });

  test('queryRecord with paginated results returns a single record', async function (assert) {
    const post = await this.store.queryRecord('post', {
      title: 'post title 1',
    });

    assert.ok(post);
    assert.strictEqual(post.get('postTitle'), 'post title 1');
    assert.strictEqual(post.get('body'), 'post body 1');
  });

  test("Type metadata doesn't have previous", async function (assert) {
    const response = await this.store.query('post', { page: 1 });

    assert.ok(response);

    const metadata = response.meta;

    assert.strictEqual(metadata.count, 6);
    assert.strictEqual(metadata.next, 2);
    assert.strictEqual(metadata.previous, null);
  });

  test("Type metadata doesn't have next", async function (assert) {
    const response = await this.store.query('post', { page: 2 });

    assert.ok(response);
    assert.strictEqual(response.length, 2);

    const metadata = response.meta;

    assert.strictEqual(metadata.count, 6);
    assert.strictEqual(metadata.next, null);
    assert.strictEqual(metadata.previous, 1);
  });

  test('Test page_size query param', async function (assert) {
    const response = await this.store.query('post', { page: 2, page_size: 2 });

    assert.ok(response);
    assert.strictEqual(response.length, 2);

    const metadata = response.meta;

    assert.strictEqual(metadata.count, 6);
    assert.strictEqual(metadata.previous, 1);
    assert.strictEqual(metadata.next, 3);
  });
});
