import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  label: () => faker.commerce.department() + ' Table',

  value: () =>
    'u_' + faker.word.noun().toLowerCase().replace(/\s+/g, '_') + '_table',
});
