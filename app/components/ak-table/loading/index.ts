import Component from '@glimmer/component';

interface AkTableLoadingSignature {
  Args: {
    columns?: any[];
  };
}

export default class AkTableLoading extends Component<AkTableLoadingSignature> {
  get loadingCols() {
    return (this.args.columns || Array.from({ length: 5 }, () => '')).map(
      (col) => ({
        name: col.name,
        valuePath: 'value',
      })
    );
  }

  get loadingRows() {
    return Array.from({ length: 10 }, (_, i) => ({
      value: i,
    }));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AkTable::Loading': typeof AkTableLoading;
  }
}
