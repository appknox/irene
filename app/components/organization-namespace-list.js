import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';

const {inject: {service}} = Ember;

export default Ember.Component.extend(PaginateMixin, {
  i18n: service(),
  org: service('organization'),

  classNames: ['column'],
  targetObject: 'organization-namespace',
  sortProperties: ['created:desc'],

  hasNamespace: Ember.computed.gt('org.selected.namespacesCount', 0)
});
