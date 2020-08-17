import Service from '@ember/service';
import { inject as service } from '@ember/service';
import computed from 'ember-awesome-macros/computed';
import { promise } from 'ember-awesome-macros';

const MeService = Service.extend({
  store: service('store'),
  notify: service('notifications'),
  ajax: service('ajax'),
  organization: service('organization'),
  org: promise.object(computed('organization.selected.id', function(){
    return this.get('store').queryRecord('organization-me', {});
  })),
  membership: promise.object(computed('org.id', async function () {
    await this.get('org');
    const user_id = this.get('org.id');
    return this.get('store').findRecord('organization-member', user_id);
  }))
});

export default MeService;
