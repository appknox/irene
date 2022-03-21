/* eslint-disable ember/no-mixins, ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, prettier/prettier */
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
