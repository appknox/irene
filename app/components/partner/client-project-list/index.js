/* eslint-disable ember/no-mixins */
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

  get extraQueryStrings() {
    return JSON.stringify({
      clientId: this.args.clientId,
    });
  }
}
