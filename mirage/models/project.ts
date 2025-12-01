import { belongsTo, hasMany, Model } from 'miragejs';
import { BelongsTo, HasMany } from 'miragejs/-types';

interface BelongsWithAttrs extends BelongsTo<'file'> {
  id: string;
  attrs: Record<string, unknown>;
}

export default Model.extend({
  owner: belongsTo('user'),
  last_file: belongsTo('file'),
  files: hasMany('file'),

  // Override toJSON to always include lastFile
  toJSON() {
    const that = this as unknown as {
      last_file: BelongsWithAttrs;
      files: HasMany<string>;
      owner: BelongsTo<string>;
      attrs: Record<string, unknown>;
    };

    const attrs = { ...that.attrs };

    // Embed the last file if it exists
    if (that?.last_file) {
      attrs['last_file'] = that.last_file.attrs;
    }

    return attrs;
  },
});
