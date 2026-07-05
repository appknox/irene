import Component from '@glimmer/component';
import { action } from '@ember/object';

export interface AiSortableHeaderComponentSignature {
  Args: {
    label: string;
    field: string;
    currentOrdering: string | null;
    onSortChange: (ordering: string | null) => void;
  };
}

/**
 * A three-state sort toggle (ascending -> descending -> none) for a single
 * column, driven by the same `?ordering=` query param DRF's OrderingFilter
 * already accepts on this endpoint (see ordering_fields in
 * sb_file_components.py) — "-field" for descending, bare "field" for
 * ascending, absent entirely for the default order.
 */
export default class AiSortableHeaderComponent extends Component<AiSortableHeaderComponentSignature> {
  get sortDirection(): 'asc' | 'desc' | null {
    const { currentOrdering, field } = this.args;
    if (currentOrdering === field) return 'asc';
    if (currentOrdering === `-${field}`) return 'desc';
    return null;
  }

  get sortIconName() {
    if (this.sortDirection === 'asc') return 'arrow-upward';
    if (this.sortDirection === 'desc') return 'arrow-downward';
    return 'unfold-more';
  }

  @action
  handleClick() {
    const { field } = this.args;

    if (this.sortDirection === null) {
      this.args.onSortChange(field);
    } else if (this.sortDirection === 'asc') {
      this.args.onSortChange(`-${field}`);
    } else {
      this.args.onSortChange(null);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::ComponentList::AiSortableHeader': typeof AiSortableHeaderComponent;
  }
}
