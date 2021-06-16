import Component from '@glimmer/component';
import { PaginationMixin } from '../../../mixins/paginate';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class PartnerClientProjectListComponent extends PaginationMixin(
  Component
) {
  @service store;
  @service partner;

  @tracked targetModel = 'partner/partnerclient-project';

  get projects() {
    return this.objects;
  }

  get extraQueryStrings() {
    return JSON.stringify({
      clientId: this.args.clientId,
    });
  }

  get enableViewFiles() {
    return this.partner.access.list_files;
  }
}
