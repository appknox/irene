import Component from '@ember/component';
import { inject as service } from '@ember/service';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  me: service(),
});
