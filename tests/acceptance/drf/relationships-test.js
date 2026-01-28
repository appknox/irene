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
    comments: [1, 2, 3],
  },
  {
    id: 2,
    post_title: 'post title 2',
    body: 'post body 2',
    comments: [4],
  },
];

const comments = [
  {
    id: 1,
    body: 'comment body 1',
    post: 1,
  },
  {
    id: 2,
    body: 'comment body 2',
    post: 1,
  },
  {
    id: 3,
    body: 'comment body 3',
    post: 1,
  },
  {
    id: 4,
    body: 'comment body 4',
    post: 2,
  },
];

module('Acceptance | DRF: Relationships', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    registerRequiredResources(this.owner);

    this.store = this.owner.lookup('service:store');

    this.server.get('/test-api/posts/:id/', function (_, request) {
      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(posts[parseInt(request.params.id) - 1])
      );
    });

    this.server.get('/test-api/comments/:id/', function (_, request) {
      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(comments[parseInt(request.params.id) - 1])
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

    const comments = await post.get('comments');

    assert.ok(comments);
    assert.strictEqual(comments.length, 3);
    assert.ok(comments[0]);
    assert.ok(comments[1]);
    assert.ok(comments[2]);
  });
});
