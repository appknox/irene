import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { registerRequiredResources } from 'irene/tests/helpers/drf-resources';
import { Response } from 'miragejs';
import { PostAdapter } from '../../helpers/drf-resources';
import { UnauthorizedError } from '@ember-data/adapter/error';

module('Acceptance | DRF: CRUD Failure', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    registerRequiredResources(this.owner);

    this.store = this.owner.lookup('service:store');

    // Permission denied error
    this.server.get('/test-api/posts/1/', () => {
      return new Response(
        401,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          detail: 'Authentication credentials were not provided.',
        })
      );
    });

    // Server error
    this.server.get('/test-api/posts/2/', () => {
      // This is the default error page for Django when DEBUG is set to False.
      return new Response(
        500,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ detail: 'Something bad' })
      );
    });

    // Authentication Invalid error
    this.server.post('/test-api/posts/3', () => {
      return new Response(
        400,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ name: 'error 1', non_field_errors: 'error 2' })
      );
    });

    // Create field errors
    this.server.post('/test-api/posts/', (_, request) => {
      const data = JSON.parse(request.requestBody);

      if (data.body === 'non_field_errors') {
        return new Response(
          400,
          { 'Content-Type': 'application/json' },
          JSON.stringify({
            body: ['error 1'],
            non_field_errors: ['error 2', 'error 3'],
          })
        );
      }

      return new Response(
        400,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          post_title: ['This field is required.'],
          body: ['This field is required.', 'This field cannot be blank.'],
        })
      );
    });

    // Create nested field errors
    this.server.post('/test-api/embedded-post-comments/', () => {
      return new Response(
        400,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          post: {
            post_title: ['This field is required.'],
            body: ['This field is required.', 'This field cannot be blank.'],
          },
        })
      );
    });

    // Update field errors
    this.server.get('/test-api/posts/3/', () => {
      return new Response(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          id: 3,
          post_title: 'post title 3',
          body: 'post body 3',
          comments: [],
        })
      );
    });

    this.server.put('/test-api/posts/3/', () => {
      return new Response(
        400,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          post_title: [
            'Ensure this value has at most 50 characters (it has 53).',
          ],
          body: ['This field is required.'],
        })
      );
    });
  });

  test('Permission denied error', async function (assert) {
    assert.expect(4);

    class CustomAuthAdapter extends PostAdapter {
      handleResponse(status, payload) {
        if (status === 401) {
          const errorPayload = [
            {
              status: '401',
              detail:
                payload.detail ||
                'Authentication credentials were not provided.',
            },
          ];

          throw new UnauthorizedError(errorPayload);
        }
      }
    }

    this.owner.register('adapter:post', CustomAuthAdapter);

    try {
      await this.store.findRecord('post', 1);
    } catch (err) {
      const error = err.errors[0];

      assert.ok(error);
      assert.strictEqual(error.status, '401');

      assert.strictEqual(
        error.detail,
        'Authentication credentials were not provided.'
      );

      assert.strictEqual(err.message, 'The adapter operation is unauthorized');
    }
  });

  test('Server error', async function (assert) {
    assert.expect(4);

    try {
      await this.store.findRecord('post', 2);
    } catch (err) {
      const error = err.errors[0];

      assert.ok(err);
      assert.strictEqual(error.status, '500');
      assert.strictEqual(error.detail, 'Something bad');
      assert.strictEqual(err.message, 'Internal Server Error');
    }
  });

  test('Invalid with non field errors', async function (assert) {
    assert.expect(11);

    const post = this.store.createRecord('post', {
      postTitle: '',
      body: 'non_field_errors',
    });

    try {
      await post.save();
    } catch (err) {
      const bodyErrors = post.get('errors.body'),
        nonFieldErrors1 = err.errors[1],
        nonFieldErrors2 = err.errors[2];

      assert.ok(err);
      assert.ok(err.errors);
      assert.false(post.get('isValid'));

      assert.strictEqual(bodyErrors.length, 1);
      assert.strictEqual(bodyErrors[0].message, 'error 1');

      assert.strictEqual(nonFieldErrors1.detail, 'error 2');
      assert.strictEqual(nonFieldErrors1.source.pointer, '/data');
      assert.strictEqual(nonFieldErrors1.title, 'Invalid Document');

      assert.strictEqual(nonFieldErrors2.detail, 'error 3');
      assert.strictEqual(nonFieldErrors2.source.pointer, '/data');
      assert.strictEqual(nonFieldErrors2.title, 'Invalid Document');
    }
  });

  test('Create field errors', async function (assert) {
    assert.expect(8);

    const post = this.store.createRecord('post', {
      postTitle: '',
      body: '',
    });

    try {
      await post.save();
    } catch (err) {
      const postTitleErrors = post.get('errors.postTitle'),
        bodyErrors = post.get('errors.body');

      assert.ok(err);
      assert.ok(err.errors);

      assert.false(post.get('isValid'));

      // Test camelCase field.
      assert.strictEqual(postTitleErrors.length, 1);
      assert.strictEqual(postTitleErrors[0].message, 'This field is required.');

      // Test non-camelCase field.
      assert.strictEqual(bodyErrors.length, 2);
      assert.strictEqual(bodyErrors[0].message, 'This field is required.');
      assert.strictEqual(bodyErrors[1].message, 'This field cannot be blank.');
    }
  });

  test('Created nested field errors', async function (assert) {
    assert.expect(8);

    const post = this.store.createRecord('post');

    const embeddedPostComment = this.store.createRecord(
      'embedded-post-comment',
      {
        body: 'This is my new comment',
        post,
      }
    );

    try {
      await embeddedPostComment.save();
    } catch (err) {
      const comment = embeddedPostComment;

      assert.ok(err);
      assert.ok(err.errors);
      assert.notOk(comment.get('isValid'));

      /*
        JSON API technically does not allow nesting, so the nested errors are
        processed as if they were attributes on the comment itself.  As a result,
        comment.get('post.isValid') returns true :-(

        This assertion will fail:
        assert.notOk(comment.get('post.isValid'));

        Related discussion: https://github.com/json-api/json-api/issues/899
        */

      let postBodyErrors = comment.get('errors.post/body');
      let postPostTitleErrors = comment.get('errors.post/post_title');

      assert.strictEqual(postBodyErrors.length, 2);
      assert.strictEqual(postBodyErrors[0].message, 'This field is required.');

      assert.strictEqual(
        postBodyErrors[1].message,
        'This field cannot be blank.'
      );

      assert.strictEqual(postPostTitleErrors.length, 1);

      assert.strictEqual(
        postPostTitleErrors[0].message,
        'This field is required.'
      );
    }
  });

  test('Update field errors', async function (assert) {
    assert.expect(9);

    const post = await this.store.findRecord('post', 3);

    assert.ok(post);
    assert.false(post.get('hasDirtyAttributes'));

    post.set(
      'postTitle',
      'Lorem ipsum dolor sit amet, consectetur adipiscing el'
    );

    post.set('body', '');

    assert.true(post.get('hasDirtyAttributes'));

    try {
      await post.save();
    } catch (err) {
      const postTitleErrors = post.get('errors.postTitle'),
        bodyErrors = post.get('errors.body');

      assert.ok(err);
      assert.ok(err.errors);

      // Test camelCase field.
      assert.strictEqual(postTitleErrors.length, 1);

      assert.strictEqual(
        postTitleErrors[0].message,
        'Ensure this value has at most 50 characters (it has 53).'
      );

      // Test non-camelCase field.
      assert.strictEqual(bodyErrors.length, 1);
      assert.strictEqual(bodyErrors[0].message, 'This field is required.');
    }
  });
});
