import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { FilterColumn } from 'irene/components/project-list/table-columns';

interface ProjectListColumnManagerSignature {
  Args: {
    allColumnsMap: Map<string, FilterColumn>;
    onApply: (allColumnsMap: Map<string, FilterColumn>) => void;
    onCancel: () => void;
    onColumnsChange: (allColumnsMap: Map<string, FilterColumn>) => void;
  };
}

export default class ProjectListColumnManager extends Component<ProjectListColumnManagerSignature> {
  @service declare intl: IntlService;

  @tracked draggedColumn: FilterColumn | null = null;
  @tracked dropTargetColumn: FilterColumn | null = null;
  @tracked allColumnsSelected = false;

  get allColumnsMap() {
    return this.args.allColumnsMap;
  }

  get allColumns() {
    return Array.from(this.allColumnsMap.values()).sort(
      (a, b) => a.order - b.order
    );
  }

  get selectedColumns() {
    return this.allColumns.filter((col) => col.selected);
  }

  get noSelectedColumns() {
    return this.selectedColumns.length;
  }

  get disableReset() {
    return this.allColumns.every(
      (col) =>
        col.selected === Boolean(col.default) && col.order === col.defaultOrder
    );
  }

  get label() {
    return `(${this.noSelectedColumns}/${this.allColumns.length}) ${this.intl.t('selected')}`;
  }

  get disableApply() {
    return this.noSelectedColumns === 0;
  }

  @action
  toggleColumn(column: FilterColumn) {
    this.allColumnsMap.set(column.field, {
      ...column,
      selected: !column.selected,
    });

    this.updateColumnsState();
  }

  @action
  toggleAllColumns(event: Event, checked: boolean) {
    this.allColumnsSelected = checked;

    // update selection status for all columns
    this.allColumnsMap.forEach((c, field) => {
      this.allColumnsMap.set(field, {
        ...c,
        selected: c.isHideable ? checked : c.selected,
      });
    });

    this.args.onColumnsChange(this.allColumnsMap);
  }

  @action
  resetColumns() {
    const columns = Array.from(this.allColumnsMap.values());

    columns.forEach((c) => {
      this.allColumnsMap.set(c.field, {
        ...c,
        selected: Boolean(c.default),
        order: c.defaultOrder,
      });
    });

    this.updateColumnsState();
  }

  @action
  handleColumnDragStart(column: FilterColumn, event: DragEvent) {
    this.draggedColumn = column;

    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', column.field);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  @action
  handleColumnDragOver(column: FilterColumn, event: DragEvent) {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    if (this.draggedColumn?.field !== column.field) {
      this.dropTargetColumn = column;
    } else {
      this.dropTargetColumn = null;
    }
  }

  @action
  handleColumnDragLeave(column: FilterColumn) {
    if (this.dropTargetColumn?.field === column.field) {
      this.dropTargetColumn = null;
    }
  }

  @action
  handleColumnDrop(targetColumn: FilterColumn, event: DragEvent) {
    event.preventDefault();

    // Reset drop target state
    this.dropTargetColumn = null;

    // Skip if no column is being dragged or if dropped on itself
    if (
      !this.draggedColumn ||
      this.draggedColumn.field === targetColumn.field
    ) {
      return;
    }

    // Reorder columns
    const columns = this.allColumns;

    const sourceIndex = columns.findIndex(
      (c) => c.field === this.draggedColumn?.field
    );

    const targetIndex = columns.findIndex(
      (c) => c.field === targetColumn.field
    );

    if (sourceIndex !== -1 && targetIndex !== -1) {
      // Create a copy of the columns array for manipulation
      const updatedColumns = [...columns];

      // Remove the dragged column from its original position
      const [movedColumn] = updatedColumns.splice(sourceIndex, 1);

      // Insert the dragged column at the target position
      updatedColumns.splice(targetIndex, 0, movedColumn as FilterColumn);

      // Update order values for all columns to reflect new positions
      updatedColumns.forEach((column, index) => {
        this.allColumnsMap.set(column.field, {
          ...column,
          order: index,
        });
      });
    }

    this.args.onColumnsChange(this.allColumnsMap);
  }

  @action
  handleColumnDragEnd() {
    this.draggedColumn = null;
    this.dropTargetColumn = null;
  }

  @action
  applyChanges() {
    this.args.onApply(this.allColumnsMap);
  }

  @action
  getColumnClass(column: FilterColumn): string {
    const classes = ['column-item'];

    if (this.dropTargetColumn?.field === column.field) {
      classes.push('drag-over');
    }

    return classes.join(' ');
  }

  updateColumnsState() {
    this.allColumnsSelected = [...this.allColumnsMap.values()].every(
      (c) => c.selected
    );

    this.args.onColumnsChange(this.allColumnsMap);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectList::ColumnManager': typeof ProjectListColumnManager;
  }
}
