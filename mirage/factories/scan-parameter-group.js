import Base from './base';
import faker from 'faker';

export default Base.extend({
  name: faker.company.companyName(),
  description: faker.lorem.sentence(),
  is_active: () => faker.random.boolean(),
  is_default: () => faker.random.boolean(),

  // @belongsTo('project')
  // declare project: AsyncBelongsTo<ProjectModel>;

  // @belongsTo('user')
  // declare lastUpdatedBy: AsyncBelongsTo<UserModel> | null;

  // @hasMany('scan-parameter', { inverse: 'scanParameterGroup' })
  // declare scanParameters: AsyncHasMany<ScanParameterModel>;
});
