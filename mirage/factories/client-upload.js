import {
  Factory
} from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  name() {
    return faker.company.companyName();
  },
  iconUrl: 'https://listimg.pinclipart.com/picdir/s/202-2024262_app-store-google-play-logo-vector-vector-and.png',
  uuid: faker.random.uuid(),
  version() {
    return `${faker.random.number({min: 1, max: 3})}.${faker.random.number({min: 0, max: 99})}`
  },
  package() {
    return `com.${faker.company.companySuffix()}.app`
  },
  uploadedAt: faker.date.between('2021-01-01', '2021-04-30'),
  platform() {
    return faker.random.arrayElement(["android", "ios"]);
  }
});
