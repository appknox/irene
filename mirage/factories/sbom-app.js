import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  id(i) {
    return 1000 + i + 1;
  },

  project(i) {
    return i + 1;
  },

  latest_sb_file(i) {
    return 100 + i + 1;
  },
});
