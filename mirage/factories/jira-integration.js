/* eslint-disable prettier/prettier */
import faker from 'faker';
import Base from './base';

export default Base.extend({

  jiraProject: faker.company.companyName

});
