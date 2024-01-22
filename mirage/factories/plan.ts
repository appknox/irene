import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  name: faker.person.firstName(),
  price: faker.commerce.price(),
  projectsLimit: faker.number.int(),
  monthlyUrl:
    'https://appknox-test.chargebee.com/hosted_pages/plans/default_lite?customer%5Bid%5D=HsTrPiZQXkHgX3h2Y',
  quarterlyUrl:
    'https://appknox-test.chargebee.com/hosted_pages/plans/default_essential?customer%5Bid%5D=HsTrPiZQXkHgX3h2Y',
  halfYearlyUrl:
    'https://appknox-test.chargebee.com/hosted_pages/plans/default_premium?customer%5Bid%5D=HsTrPiZQXkHgX3h2Y',
  yearlyUrl:
    'https://appknox-test.chargebee.com/hosted_pages/plans/default_lite?customer%5Bid%5D=HsTrPiZQXkHgX3h2Y',
  monthlyPrice: faker.commerce.price(),
  quarterlyPrice: faker.commerce.price(),
  halfYearlyPrice: faker.commerce.price(),
  yearlyPrice: faker.commerce.price(),
  planId: 'default_lite',

  description() {
    const desc = [];
    for (let i = 0; i < 5; i++) {
      desc.push(faker.lorem.words(2).split(' ').join(' -> '));
    }
    return desc.join(',');
  },
});
