import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';
import ENUMS from 'irene/enums';

export default Factory.extend({
  doc_ulid: () => faker.string.uuid(),
  doc_hash: () => faker.string.hexadecimal({ length: 64 }),
  app_id: () => faker.string.uuid(),
  url: () => faker.internet.url(),
  icon_url: () => faker.image.url(),
  package_name: () => faker.internet.domainWord(),
  title: () => faker.company.name(),
  platform: () => faker.number.int({ min: 0, max: 4 }),
  dev_name: () => faker.name.fullName(),
  dev_email: () => faker.internet.email(),
  dev_website: () => faker.internet.url(),
  dev_id: () => faker.string.uuid(),
  rating: () => faker.number.float({ min: 0, max: 5, precision: 0.1 }),
  rating_count: () => faker.number.int({ min: 1, max: 10000 }),
  review_count: () => faker.number.int({ min: 1, max: 5000 }),
  total_downloads: () => faker.number.int({ min: 1, max: 1000000 }),
  upload_date: () => faker.date.past({ years: 1 }),
  latest_upload_date: () => faker.date.recent(),

  region: () => ({
    id: faker.number.int({ min: 1, max: 100 }),
    sk_store: faker.number.int({ min: 1, max: 100 }),
    country_code: faker.location.countryCode(),
    icon: faker.image.url(),
  }),

  platform_display: () =>
    faker.helpers.arrayElement(ENUMS.PLATFORM.BASE_CHOICES.map((c) => c.key)),
});
