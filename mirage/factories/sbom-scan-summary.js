import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  component_count: faker.datatype.number(1000),
  library_count: faker.datatype.number(125),
  framework_count: faker.datatype.number(125),
  application_count: faker.datatype.number(125),
  container_count: faker.datatype.number(125),
  device_count: faker.datatype.number(125),
  file_count: faker.datatype.number(125),
  firmware_count: faker.datatype.number(125),
  operating_system_count: faker.datatype.number(125),
});
