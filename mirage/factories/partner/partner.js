import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  access() {
    return {
      invite_clients: false,
      view_plans: false,
      transfer_credits: false,
    };
  },
});
