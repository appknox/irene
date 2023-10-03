import faker from 'faker';
import Base from './base';

export default Base.extend({
  id(i) {
    return i + 1;
  },

  account: () => faker.lorem.slug(),

  repo: () => `ak-${faker.lorem.slug()}`,

  title: () => faker.lorem.sentence(),

  risk_threshold: () => faker.random.arrayElement([1, 2, 3, 4]),

  repo_details() {
    return {
      full_name: `${this.account}/${this.repo}`,
      html_url: `https://github.com/${this.repo}`,
      name: this.repo,
      owner: {
        name: null,
        login: this.account,
      },
    };
  },
});
