import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export const SBOM_SCAN_SUMMARY_FACTORY_DEF = {
  component_count: faker.number.int(1000),
  library_count: faker.number.int(125),
  framework_count: faker.number.int(125),
  application_count: faker.number.int(125),
  file_count: faker.number.int(125),
  machine_learning_model_count: faker.number.int(125),
};

export default Factory.extend(SBOM_SCAN_SUMMARY_FACTORY_DEF);
