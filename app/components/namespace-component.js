import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';

const NamespaceComponentComponent = Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),
  namespace: '',
  classNames: ['column'],

  targetObject: 'organization-namespace',
  sortProperties: ['created:desc'],
  extraQueryStrings: Ember.computed('organization.id', function() {
    const query = {
      id: this.get('organization.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),
});

export default NamespaceComponentComponent;
