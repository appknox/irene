import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  doc_ulid: () => faker.string.uuid(),
  doc_hash: () => faker.string.hexadecimal({ length: 64 }),
  app_id: () => faker.string.uuid(),
  package_name: () => faker.lorem.word(),
  title: () => faker.commerce.productName(),
  store: () => faker.helpers.arrayElement(['playstore', 'appstore']),
  platform: () => faker.number.int({ min: 0, max: 1 }),
  region: () => faker.location.countryCode(),
  app_size: () => faker.number.int(),
  app_type: () => faker.helpers.arrayElement(['application', 'game']),
  app_url: () => faker.internet.url(),
  is_free: () => faker.datatype.boolean(),
  description: () => faker.lorem.paragraphs(2),
  dev_name: () => faker.company.name(),
  dev_email: () => faker.internet.email(),
  icon_url: () => faker.image.url(),
  latest_upload_date: () => faker.date.past(),
  rating: () => faker.number.int({ min: 0, max: 5 }),
  rating_count: () => faker.number.int(),
  screenshots: () => Array.from({ length: 8 }, () => faker.image.imageUrl()),
  version: () => faker.string.numeric(),
  doc_created_on: () => faker.date.recent(),
  doc_updated_on: () => faker.date.recent(),
  doc_updated_on_ts: () => faker.number.int(),

  min_os_required: () =>
    faker.helpers.arrayElement(['5.0 and up', '9.0 and up']),
});
