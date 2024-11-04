import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import MeService from 'irene/services/me';

export default class StoreknoxInventoryDisabledAppsComponent extends Component {
  @service declare me: MeService;

  @tracked searchQuery = '';
  @tracked selectedDisabledApps: string[] = [];

  get isOwner() {
    return this.me.org?.is_owner;
  }

  get showMoveToInventoryBtn() {
    return this.isOwner && this.selectedDisabledApps.length > 0;
  }

  @action
  discoverApp() {
    this.searchQuery = 'Shell Test';
  }

  @action
  clearSearch() {
    this.searchQuery = '';
  }

  @action
  handleSelectedDisabledApps(apps: string[]) {
    this.selectedDisabledApps = apps;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::DisabledApps': typeof StoreknoxInventoryDisabledAppsComponent;
  }
}
