import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class SecurityProjectModel extends Model {
  @belongsTo('user', { inverse: 'ownedProjects' }) owner;
  @hasMany('security/file') files;
  @attr('string') packageName;
  @attr('boolean') isManualScanAvailable;
}
