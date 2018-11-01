import Service from '@ember/service';
import { inject as service } from '@ember/service';
import computed from 'ember-awesome-macros/computed';
import { promise } from 'ember-awesome-macros';

const MeService = Service.extend({
  store: service('store'),
  notify: service('notification-messages'),
  ajax: service('ajax'),
  organization: service('organization'),
  org: promise.object(computed('organization.selected.id', function(){
    return this.get('store').queryRecord('organization-me', {});
  })),
});

export default MeService;
