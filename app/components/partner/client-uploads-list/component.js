/* eslint-disable ember/no-mixins */
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { PaginationMixin } from '../../../mixins/paginate';

export default class PartnerClientUploadsListComponent extends PaginationMixin(
  Component
) {
  @service store;
  @service partner;

  @tracked targetModel = 'partner/partnerclient-project-file';

  get extraQueryStrings() {
    return JSON.stringify({
      clientId: this.args.clientId,
      projectId: this.args.projectId,
    });
  }
}
