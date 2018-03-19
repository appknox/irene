import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  uuid: faker.random.uuid,
  name: faker.system.fileName,
  downloadUrl: faker.internet.url
});
