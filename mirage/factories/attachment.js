import { Factory } from 'ember-cli-mirage';

import faker from 'faker';

export default Factory.extend({
  pk(i) {
    return i + 1;
  },

  uuid: () => faker.random.uuid(),
  name: () => faker.system.fileName(),

  download_url() {
    return `/api/dummy_attachment_download_url/${this.uuid}`;
  },
});
