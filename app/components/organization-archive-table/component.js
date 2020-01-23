import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  organization: service('organization'),

  targetModel: 'organization-archive',
  sortProperties: ['createdOn:desc'],

  newOrganizationArchiveCounterObserver: observer('realtime.OrganizationArchiveCounter', function () {
    return this.incrementProperty('version');
  }),
});
