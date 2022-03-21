/* eslint-disable prettier/prettier */
import faker from 'faker';
import Base from './base';

export default Base.extend({

  githubRepo: faker.company.companyName

});
