import { merge } from '@ember/polyfills';
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
];

module('Acceptance | DRF: CRUD Success', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    registerRequiredResources(this.owner);

    this.store = this.owner.lookup('service:store');

    // Retrieve list of non-paginated records
    this.server.get('/test-api/posts/', function (_, request) {
      if (request.queryParams.post_title === 'post title 2') {
        return new Response(
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify([posts[1]])
        );
      } else {
        return new Response(
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(posts)
        );
      }
    });

    // Retrieve single record
    this.server.get('/test-api/posts/1/', function () {
      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(posts[0])
      );
    });

    // Create record
    this.server.post('/test-api/posts/', function (_, request) {
      const data = JSON.parse(request.requestBody);

      return new Response(
        201,
        { 'Content-Type': 'application/json' },
        JSON.stringify(data)
      );
    });

    // Update record
    this.server.put('/test-api/posts/1/', function (_, request) {
      const data = merge(posts[0], JSON.parse(request.requestBody));

      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(data)
      );
    });

    // Delete record
    this.server.delete('/test-api/posts/1/', function () {
      return new Response(204);
    });
  });

  test('Retrieve list of non-paginated records', async function (assert) {
    const posts = await this.store.findAll('post');

    assert.ok(posts);
    assert.strictEqual(posts.get('length'), 3);

    const post = posts.objectAt(2);

    assert.strictEqual(post.get('postTitle'), 'post title 3');
    assert.strictEqual(post.get('body'), 'post body 3');
  });

  test('Retrieve single record with findRecord', async function (assert) {
    const post = await this.store.findRecord('post', 1);

    assert.ok(post);
    assert.strictEqual(post.get('postTitle'), 'post title 1');
    assert.strictEqual(post.get('body'), 'post body 1');
  });

  test('Retrieve single record with queryRecord', async function (assert) {
    const post = await this.store.queryRecord('post', { slug: 'post-title-1' });
    assert.ok(post);
    assert.strictEqual(post.get('postTitle'), 'post title 1');
    assert.strictEqual(post.get('body'), 'post body 1');
  });

  test('Retrieve via query', async function (assert) {
    const posts = await this.store.query('post', {
      post_title: 'post title 2',
    });
    assert.ok(posts);

    const post = posts.objectAt(0);
    assert.strictEqual(post.get('postTitle'), 'post title 2');
    assert.strictEqual(post.get('body'), 'post body 2');
  });

  test('Create record', async function (assert) {
    const post = this.store.createRecord('post', {
      id: '4',
      postTitle: 'my new post title',
      body: 'my new post body',
    });

    await post.save();

    assert.ok(post);
    assert.strictEqual(post.get('id'), '4');
    assert.strictEqual(post.get('postTitle'), 'my new post title');
    assert.strictEqual(post.get('body'), 'my new post body');

    const requestBody = JSON.parse(
      this.server.pretender.handledRequests.pop().requestBody
    );

    assert.strictEqual(requestBody.id, '4');
  });

  test('Update record', async function (assert) {
    const post = await this.store.findRecord('post', 1);

    assert.ok(post);
    assert.false(post.get('hasDirtyAttributes'));

    post.set('postTitle', 'new post title');
    post.set('body', 'new post body');

    assert.true(post.get('hasDirtyAttributes'));

    await post.save();

    assert.ok(post);
    assert.false(post.get('hasDirtyAttributes'));
    assert.strictEqual(post.get('postTitle'), 'new post title');
    assert.strictEqual(post.get('body'), 'new post body');
  });

  test('Delete record', async function (assert) {
    const post = await this.store.findRecord('post', 1);

    assert.ok(post);

    const deletedPost = await post.destroyRecord();

    assert.ok(deletedPost);
  });
});
