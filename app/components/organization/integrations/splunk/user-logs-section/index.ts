import Component from '@glimmer/component';

interface IndexItem {
  label: string;
  value: string;
}

interface LogHourItem {
  label: string;
  value: number;
}

interface OrganizationIntegrationsSplunkUserLogsSectionSignature {
  sendUserLogs: boolean;
  showOptionalHeading: boolean;
  onToggleSendUserLogs: (event: Event, checked?: boolean) => void;
  indexOptions: IndexItem[];
  selectedUserLogIndex?: IndexItem;
  onSetUserLogIndex: (index: IndexItem) => void;
  logHourOptions: LogHourItem[];
  selectedLogHour: LogHourItem;
  onSetLogHour: (hour: LogHourItem) => void;
  isEditing?: boolean;
  onEditDetails?: (event: MouseEvent) => void;
  onSaveUserLogDetails?: (event: MouseEvent) => void;
}

export default class OrganizationIntegrationsSplunkUserLogsSectionComponent extends Component<OrganizationIntegrationsSplunkUserLogsSectionSignature> {
  get notShowOptionalHeading() {
    return !this.args.showOptionalHeading;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::Splunk::UserLogsSection': typeof OrganizationIntegrationsSplunkUserLogsSectionComponent;
  }
}
