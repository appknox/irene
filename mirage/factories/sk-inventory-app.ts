import SkAppFactory from './sk-app';
import { faker } from '@faker-js/faker';

export default SkAppFactory.extend({
  last_monitored_on: () => faker.date.past(),
});
