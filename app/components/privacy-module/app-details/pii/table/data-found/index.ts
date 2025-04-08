import Component from '@glimmer/component';

export default class PrivacyModuleAppDetailsPiiTableDataFoundComponent extends Component {
  get dataFound() {
    return this.args.data.dataFound;
  }

  get value() {
    return this.dataFound[0].value;
  }

  get showChip() {
    return this.dataFound.length > 1;
  }

  get chipValue() {
    const number = this.dataFound.length - 1;

    return `+${number} more`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Pii::Table::DataFound': typeof PrivacyModuleAppDetailsPiiTableDataFoundComponent;
  }
}
