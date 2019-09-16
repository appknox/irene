import PaginateMixin from 'irene/mixins/paginate';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend(PaginateMixin, {
  intl: service(),
  org: service('organization'),

  classNames: ['column'],
  targetModel: 'organization-namespace',
  sortProperties: ['created:desc'],

  hasNamespace: computed.gt('org.selected.namespacesCount', 0)
});
