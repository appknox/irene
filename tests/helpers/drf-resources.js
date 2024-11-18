import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import CommonDRFAdapter from 'irene/adapters/commondrf';
import DRFSerializer from 'irene/serializers/drf';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export class PostModel extends Model {
  @attr('string') postTitle;
  @attr('string') body;
  @hasMany('comment', { async: true, inverse: null }) comments;
}

export class CommentModel extends Model {
  @attr('string') body;
  @belongsTo('post', { async: true, inverse: null }) post;
}

export class EmbeddedCommentsPostModel extends Model {
  @attr('string') postTitle;
  @attr('string') body;
  @hasMany('comment', { async: false, inverse: null }) comments;
}

export class EmbeddedPostCommentModel extends Model {
  @attr('string') body;
  @belongsTo('post', { async: false, inverse: null }) post;
}

export class PostAdapter extends CommonDRFAdapter {
  namespace = '/api/test-api';
}

export class CommentAdapter extends CommonDRFAdapter {
  namespace = '/api/test-api';
}

export class EmbeddedCommentsPostAdapter extends CommonDRFAdapter {
  namespace = '/api/test-api';
}

export class EmbeddedPostCommentAdapter extends CommonDRFAdapter {
  namespace = '/api/test-api';
}

export const EmbeddedCommentsPostSerializer = DRFSerializer.extend(
  EmbeddedRecordsMixin,
  {
    attrs: {
      comments: { embedded: 'always' },
    },
  }
);

export const EmbeddedPostCommentSerializer = DRFSerializer.extend(
  EmbeddedRecordsMixin,
  {
    attrs: {
      post: { serialize: 'id', deserialize: 'records' },
    },
  }
);

export function registerRequiredResources(owner) {
  owner.register('model:post', PostModel);
  owner.register('model:comment', CommentModel);
  owner.register('model:embedded-post-comment', EmbeddedPostCommentModel);
  owner.register('model:embedded-comments-post', EmbeddedCommentsPostModel);

  owner.register('adapter:post', PostAdapter);
  owner.register('adapter:comment', CommentAdapter);
  owner.register('adapter:embedded-post-comment', EmbeddedPostCommentAdapter);
  owner.register('adapter:embedded-comments-post', EmbeddedCommentsPostAdapter);

  owner.register(
    'serializer:embedded-post-comment',
    EmbeddedPostCommentSerializer
  );

  owner.register(
    'serializer:embedded-comments-post',
    EmbeddedCommentsPostSerializer
  );
}
