import Component from '@glimmer/component';
import type { EmberTableColumn, EmberTableRow } from 'ember-table';
import EmberTableComponent from 'ember-table/components/ember-table/component';
import EmberTfootComponent from 'ember-table/components/ember-tfoot/component';
import EmberTheadComponent from 'ember-table/components/ember-thead/component';
import EmberTableLoadingMoreComponent from 'ember-table/components/ember-table-loading-more/component';
import EmberTbodyComponent from 'ember-table/components/ember-tbody/component';
import { Globals } from '@glint/environment-ember-loose/-private/dsl/globals';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';

interface AkTableColumn extends EmberTableColumn {
  component?: keyof Globals | null;
}

export interface AkTableRow extends EmberTableRow {
  rows?: unknown[] | DS.AdapterPopulatedRecordArray<unknown>;
}

class AkEmberTableComponent extends EmberTableComponent<
  AkTableRow,
  AkTableColumn
> {}

interface AkTableSignature<
  RowType extends EmberTableRow,
  ColumnType extends EmberTableColumn
> {
  Element: HTMLDivElement;
  Args: {
    headerColor?: string;
    variant?: string;
    borderColor?: string;
    hoverable?: boolean;
    dense?: boolean;
  };

  Blocks: {
    default: [
      {
        body: typeof EmberTbodyComponent<RowType, ColumnType>;
        foot: typeof EmberTfootComponent<RowType, ColumnType>;
        head: typeof EmberTheadComponent<RowType, ColumnType>;
        loadingMore: typeof EmberTableLoadingMoreComponent;
      }
    ];
  };
}

export default class AkTableComponent extends Component<
  AkTableSignature<AkTableRow, AkTableColumn>
> {
  emberTableComponent = AkEmberTableComponent;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkTable: typeof AkTableComponent;
  }
}
