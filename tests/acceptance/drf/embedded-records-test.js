import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { registerRequiredResources } from 'irene/tests/helpers/drf-resources';
import { Response } from 'miragejs';

const embeddedCommentsPosts = [
  {
    id: 1,
    post_title: 'post title 1',
    body: 'post body 1',
    comments: [
      {
        id: 2,
        body: 'comment body 2',
      },
      {
        id: 3,
        body: 'comment body 3',
      },
      {
        id: 4,
        body: 'comment body 4',
      },
    ],
  },
];

const embeddedPostComments = [
  {
    id: 5,
    body: 'comment body 5',
    post: {
      id: 6,
      post_title: 'post title 6',
      body: 'post body 6',
    },
  },
];

var posts = [
  {
    id: 7,
    post_title: 'post title 7',
    body: 'post body 7',
    comments: [],
  },
];

module('Acceptance | DRF: Embedded Records', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    registerRequiredResources(this.owner);

    this.store = this.owner.lookup('service:store');

    this.server.get('/test-api/embedded-comments-posts/1/', function () {
      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(embeddedCommentsPosts[0])
      );
    });

    this.server.get('/test-api/embedded-post-comments/5/', function () {
      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(embeddedPostComments[0])
      );
    });

    this.server.get('/test-api/posts/7/', function () {
      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify(posts[0])
      );
    });

    this.server.post(
      '/test-api/embedded-post-comments/',
      function (_, request) {
        const data = JSON.parse(request.requestBody);

        data['id'] = 8;
        data['post'] = posts[0];

        return new Response(
          201,
          { 'Content-Type': 'application/json' },
          JSON.stringify(data)
        );
      }
    );
  });

  test('belongsTo retrieve', async function (assert) {
    const comment = await this.store.findRecord('embedded-post-comment', 5);

    assert.ok(comment);
    assert.strictEqual(comment.get('body'), 'comment body 5');

    const post = await comment.get('post');

    assert.ok(post);
    assert.strictEqual(post.get('postTitle'), 'post title 6');
    assert.strictEqual(post.get('body'), 'post body 6');

    assert.strictEqual(this.server.pretender.handledRequests.length, 1);
  });

  test('hasMany retrieve', async function (assert) {
    const post = await this.store.findRecord('embedded-comments-post', 1);

    assert.ok(post);
    assert.strictEqual(post.get('postTitle'), 'post title 1');
    assert.strictEqual(post.get('body'), 'post body 1');

    const comments = await post.get('comments');

    assert.ok(comments);
    assert.strictEqual(comments.get('length'), 3);
    assert.ok(comments.objectAt(0));
    assert.strictEqual(comments.objectAt(0).get('body'), 'comment body 2');
    assert.ok(comments.objectAt(1));
    assert.strictEqual(comments.objectAt(1).get('body'), 'comment body 3');
    assert.ok(comments.objectAt(2));
    assert.strictEqual(comments.objectAt(2).get('body'), 'comment body 4');

    assert.strictEqual(this.server.pretender.handledRequests.length, 1);
  });

  test('belongsTo create', async function (assert) {
    const post = await this.store.findRecord('post', 7);

    const comment = this.store.createRecord('embedded-post-comment', {
      body: 'comment body 9',
      post: post,
    });

    await comment.save();

    assert.ok(comment);
    assert.ok(comment.get('id'));
    assert.strictEqual(comment.get('body'), 'comment body 9');
    assert.ok(comment.get('post'));

    assert.strictEqual(this.server.pretender.handledRequests.length, 2);

    const requestBody = JSON.parse(
      this.server.pretender.handledRequests.pop().requestBody
    );

    assert.strictEqual(requestBody.post, '7');
  });
});
