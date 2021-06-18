import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  access() {
    return {
      view_plans: false,
      transfer_credits: false,
    };
  },
});
