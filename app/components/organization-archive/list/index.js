/* eslint-disable ember/no-get, ember/no-classic-components, ember/no-mixins, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-observers, prettier/prettier */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { observer, computed } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  organization: service('organization'),
  intl: service(),

  targetModel: 'organization-archive',
  sortProperties: ['createdOn:desc'],

  columns: computed('intl', function () {
    return [
      {
        name: this.get('intl').t('organizationTableCreatedOn'),
        component: 'organization-archive/list/archive-created-on',
      },
      {
        name: this.get('intl').t('organizationTableGeneratedBy'),
        valuePath: 'generatedBy.username',
      },
      {
        name: this.get('intl').t('organizationTableDuration'),
        component: 'organization-archive/list/archive-duration',
      },
      {
        name: this.get('intl').t('status'),
        component: 'organization-archive/list/archive-status',
        textAlign: 'center',
      },
      {
        name: this.get('intl').t('action'),
        component: 'organization-archive/list/archive-action',
        textAlign: 'center',
      },
    ];
  }),

  newOrganizationArchiveCounterObserver: observer(
    'realtime.OrganizationArchiveCounter',
    function () {
      return this.incrementProperty('version');
    }
  ),
});
