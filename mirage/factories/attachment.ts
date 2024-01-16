import { Factory } from 'miragejs';

import { faker } from '@faker-js/faker';

export default Factory.extend({
  pk(i) {
    return i + 1;
  },

  uuid: () => faker.string.uuid(),
  name: () => faker.system.fileName(),

  download_url() {
    const uuid = this.uuid as string;

    return `/api/dummy_attachment_download_url/${uuid}`;
  },
});
