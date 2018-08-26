import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';

export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),

  classNames: ['column'],
  targetObject: 'organization-namespace',
  sortProperties: ['created:desc'],
});
