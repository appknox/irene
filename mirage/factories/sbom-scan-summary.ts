import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export default Factory.extend({
  component_count: faker.number.int(1000),
  library_count: faker.number.int(125),
  framework_count: faker.number.int(125),
  application_count: faker.number.int(125),
  container_count: faker.number.int(125),
  device_count: faker.number.int(125),
  file_count: faker.number.int(125),
  firmware_count: faker.number.int(125),
  operating_system_count: faker.number.int(125),
});
