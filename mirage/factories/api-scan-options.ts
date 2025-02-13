import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  ds_api_capture_filters: () => [
    faker.internet.domainName(),
    faker.internet.domainName(),
  ],
});
