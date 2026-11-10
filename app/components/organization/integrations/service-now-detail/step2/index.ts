import Component from '@glimmer/component';

import type { SNTableItem, SNCustomTable } from '../index';
import type { AppknoxSourceKey, SNColumn } from '../../service-now/index';

export interface OrganizationIntegrationsServiceNowDetailStep2Signature {
  Args: {
    snTableItems: SNTableItem[];
    selectedSNTable: SNTableItem | null;
    onSetSNTable: (selection: SNTableItem) => void;
    isCustomTable: boolean;
    selectedCustomTable: SNCustomTable | null;
    customTableSuggestions: SNCustomTable[];
    customTableSearch: string;
    onCustomTableSearch: (q: string, e: Event | null) => void;
    onCustomTableSelect: (item: SNCustomTable | string) => void;
    onClearCustomTable: () => void;
    filterAlwaysTrue: (item: SNCustomTable | string) => boolean;
    getCustomTableLabel: (item: SNCustomTable | string) => string;
    searchCustomTablesIsRunning: boolean;
    fetchTableColumnsIsRunning: boolean;
    appknoxSourceKeyOptions: AppknoxSourceKey[];
    availableColumnsFor: Record<string, SNColumn[]>;
    fieldMapping: Record<string, SNColumn | undefined>;
    onUpdateMapping: (appknoxKey: string, column: SNColumn | null) => void;
  };
}

export default class OrganizationIntegrationsServiceNowDetailStep2Component extends Component<OrganizationIntegrationsServiceNowDetailStep2Signature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::ServiceNowDetail::Step2': typeof OrganizationIntegrationsServiceNowDetailStep2Component;
  }
}
