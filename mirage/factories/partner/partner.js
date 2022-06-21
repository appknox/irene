import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  access() {
    return {
      view_plans: false,
      transfer_credits: false,
      list_projects: false,
      list_files: false,
      view_reports: false,
      admin_registration: false,
    };
  },
});
