/* eslint-disable ember/no-classic-components, ember/no-mixins, ember/no-classic-classes, ember/require-tagless-components */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  me: service(),
});
