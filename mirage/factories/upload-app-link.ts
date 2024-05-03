import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';
import ENUMS from 'irene/enums';

export const UPLOAD_APP_LINK_FACTORY_DEF = {
  url() {
    // Generate a random Google Play Store URL with a specific package name
    const packageName = faker.internet.domainWord();
    const url = `https://play.google.com/store/apps/details?id=${packageName}&hl=en&gl=US&pli=1`;

    return url;
  },

  id(id: number) {
    return id + 100;
  },

  status() {
    return faker.helpers.arrayElement(ENUMS.SUBMISSION_STATUS.VALUES);
  },
};

export default Factory.extend(UPLOAD_APP_LINK_FACTORY_DEF);
