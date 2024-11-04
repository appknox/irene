import { action } from '@ember/object';
import Component from '@glimmer/component';
import SkAppModel from 'irene/models/sk-app';

interface StoreknoxInventoryAppListTableMonitoringCheckboxSignature {
  Args: {
    app?: SkAppModel;
    loading: boolean;
    disabledChecking: boolean;
    appIsSelected: boolean;
    selectedDisabledAppIds: string[];
    selectDisabledAppRow: (ulid: string, value: boolean) => void;
  };
}

export default class StoreknoxInventoryAppListTableMonitoringCheckboxComponent extends Component<StoreknoxInventoryAppListTableMonitoringCheckboxSignature> {
  get docUlid() {
    return this.args.app?.appMetadata?.doc_ulid as string;
  }

  get isChecked() {
    return Boolean(
      this.args.selectedDisabledAppIds.find((id) => id === this.docUlid)
    );
  }

  @action handleChange(event: Event) {
    this.args.selectDisabledAppRow(
      this.docUlid,
      (event.target as HTMLInputElement).checked
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'storeknox/inventory/app-list/table/checkbox': typeof StoreknoxInventoryAppListTableMonitoringCheckboxComponent;
  }
}
