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
    comments: '/api/test-api/posts/1/comments/',
  },
  {
    id: 2,
    post_title: 'post title 2',
    body: 'post body 2',
    comments: '/api/test-api/posts/2/comments/',
  },
];

const comments = [
  {
    id: 1,
    body: 'comment body 1',
    post: '/api/test-api/posts/1/',
  },
  {
    id: 2,
    body: 'comment body 1',
    post: '/api/test-api/posts/2/',
  },
  {
    id: 3,
    body: 'comment body 2',
    post: '/api/test-api/posts/1/',
  },
  {
    id: 4,
    body: 'comment body 3',
    post: '/api/test-api/posts/1/',
  },
];

module('Acceptance | DRF: Relationship Links', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    registerRequiredResources(this.owner);

    this.store = this.owner.lookup('service:store');

    this.server.get('/test-api/posts/:id/', function (_, request) {
      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(posts[request.params.id - 1])
      );
    });

    this.server.get('/test-api/posts/:id/comments/', function (_, request) {
      const related_post_url = '/api/test-api/posts/' + request.params.id + '/';

      const related_comments = comments.filter(function (comment) {
        return comment.post === related_post_url;
      });

      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(related_comments)
      );
    });

    this.server.get('/test-api/comments/:id/', function (_, request) {
      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(comments[request.params.id - 1])
      );
    });
  });

  test('belongsTo', async function (assert) {
    const comment = await this.store.findRecord('comment', 2);

    assert.ok(comment);

    const post = await comment.get('post');

    assert.ok(post);
  });

  test('hasMany', async function (assert) {
    const post = await this.store.findRecord('post', 1);

    assert.ok(post);

    const related_comments = await post.get('comments');

    assert.ok(related_comments);
    assert.strictEqual(related_comments.get('length'), 3);
    assert.ok(related_comments.objectAt(0));
    assert.strictEqual(related_comments.objectAt(0).id, `${comments[0].id}`);
    assert.ok(related_comments.objectAt(1));
    assert.strictEqual(related_comments.objectAt(1).id, `${comments[2].id}`);
    assert.ok(related_comments.objectAt(2));
    assert.strictEqual(related_comments.objectAt(2).id, `${comments[3].id}`);
  });
});
