import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';

import ENUMS from 'irene/enums';
import styles from './index.scss';
import MeService from 'irene/services/me';
import OrganizationService from 'irene/services/organization';

interface PlatformObject {
  key: string;
  value: number;
}

interface SbomAppListHeaderArgs {
  packageNameSearchQuery: string;
  selectedPlatformValue: string;
  onQueryChange(event: Event): void;
  handleClear(): void;
  filterPlatform(platform: PlatformObject): void;
}

export default class SbomAppListHeaderComponent extends Component<SbomAppListHeaderArgs> {
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare organization: OrganizationService;

  get selectedPlatform() {
    return this.args.selectedPlatformValue
      ? this.platformObjects.find(
          (po) => po.value === Number(this.args.selectedPlatformValue)
        )
      : {
          key: 'All',
          value: -1,
        };
  }

  get platformObjects() {
    return [
      {
        key: 'All',
        value: -1,
      },
      {
        key: 'Android',
        value: ENUMS.PLATFORM.ANDROID,
      },
      {
        key: 'iOS',
        value: ENUMS.PLATFORM.IOS,
      },
    ];
  }

  get dropDownClass() {
    return styles['filter-input-dropdown'];
  }

  get triggerClass() {
    return styles['filter-input'];
  }

  get clearFilterIconClass() {
    return styles['clear-filter-icon'];
  }

  get showClearFilter() {
    return (
      this.args.selectedPlatformValue &&
      Number(this.args.selectedPlatformValue) !== -1
    );
  }

  @action filterPlatformChange(platform: PlatformObject) {
    this.args.filterPlatform(platform);
  }

  @action
  clearSearchInput() {
    this.args.handleClear();
  }

  @action onSearchQueryChange(event: Event) {
    this.args.onQueryChange(event);
  }

  @action clearFilters() {
    this.args.filterPlatform({
      key: 'All',
      value: -1,
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::AppList::Header': typeof SbomAppListHeaderComponent;
  }
}
