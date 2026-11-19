import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  value: () => faker.word.verb().toLowerCase().replace(/\s+/g, '_') + '_field',

  label(this: { value: string }) {
    return `${faker.commerce.productName()} (${this.value})`;
  },
  type: 'string',
});
