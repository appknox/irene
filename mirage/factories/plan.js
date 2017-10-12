import { faker } from 'ember-cli-mirage';
import Base from './base';

export default Base.extend({
  name: faker.name.firstName,
  price: faker.commerce.price,
  projectsLimit: faker.random.number,
  monthlyUrl: "https://appknox-test.chargebee.com/hosted_pages/plans/default_lite?customer%5Bid%5D=HsTrPiZQXkHgX3h2Y",
  quarterlyUrl: "https://appknox-test.chargebee.com/hosted_pages/plans/default_essential?customer%5Bid%5D=HsTrPiZQXkHgX3h2Y",
  halfYearlyUrl: "https://appknox-test.chargebee.com/hosted_pages/plans/default_premium?customer%5Bid%5D=HsTrPiZQXkHgX3h2Y",
  yearlyUrl: "https://appknox-test.chargebee.com/hosted_pages/plans/default_lite?customer%5Bid%5D=HsTrPiZQXkHgX3h2Y",
  planId: "default_lite",

  description(){
    var desc = [];
    for (var i = 0; i < 5; i++) {
      desc.push(faker.lorem.words(2).split(" ").join(" -> "));
    }
    return desc.join(",");
  }
});
