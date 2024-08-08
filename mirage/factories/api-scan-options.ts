import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  api_url_filters: () =>
    [faker.internet.domainName(), faker.internet.domainName()].join(','),
});
