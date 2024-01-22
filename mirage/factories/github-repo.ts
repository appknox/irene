import { faker } from '@faker-js/faker';
import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  account: () => faker.lorem.slug(),

  repo: () => `ak-${faker.lorem.slug()}`,

  title: () => faker.lorem.sentence(),

  risk_threshold: () => faker.helpers.arrayElement([1, 2, 3, 4]),

  repo_details() {
    const account = this.account as string;
    const repo = this.repo as string;

    return {
      full_name: `${account}/${repo}`,
      html_url: `https://github.com/${repo}`,
      name: repo,
      owner: {
        name: null,
        login: account,
      },
    };
  },
});
