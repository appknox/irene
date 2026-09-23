import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

export default Factory.extend({
  project: 1,

  repo() {
    return `${faker.internet.userName()}/${faker.lorem.word()}`;
  },

  base_branch: 'main',

  branch(i: number) {
    return `appknox-autofix/analysis-${i + 1}`;
  },

  pr_url(i: number) {
    return `https://github.com/appknox/example/pull/${i + 1}`;
  },

  commits() {
    return [
      {
        id: faker.number.int({ min: 1, max: 10000 }),
        file: 1,
        commit_sha: faker.git.commitSha(),
        patched_files: [faker.system.filePath()],
        created_on: faker.date.recent().toISOString(),
      },
    ];
  },

  created_on() {
    return faker.date.recent().toISOString();
  },

  updated_on() {
    return faker.date.recent().toISOString();
  },
});
