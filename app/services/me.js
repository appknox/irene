import Ember from 'ember';
import computed from 'ember-awesome-macros/computed';
import { promise } from 'ember-awesome-macros';

const MeService = Ember.Service.extend({
  store: Ember.inject.service('store'),
  notify: Ember.inject.service('notification-messages'),
  ajax: Ember.inject.service('ajax'),
  organization: Ember.inject.service('organization'),
  org: promise.object(computed('organization.selected.id', function(){
    return this.get('store').queryRecord('organization-me', {});
  })),
});

export default MeService;
