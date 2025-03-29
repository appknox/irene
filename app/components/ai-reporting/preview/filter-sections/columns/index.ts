import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type { FilterColumn } from 'irene/services/ai-reporting';

interface AiReportingPreviewFilterSectionsColumnsSignature {
  Args: {
    onColumnsChange: (allColumnsMap: Map<string, FilterColumn>) => void;
    applyAndClose: () => void;
    allColumnsMap: Map<string, FilterColumn>;
  };
}

export default class AiReportingPreviewFilterSectionsColumnsComponent extends Component<AiReportingPreviewFilterSectionsColumnsSignature> {
  @service declare intl: IntlService;

  @tracked allColumnsSelected = false;

  /**
   * Tracked property to store the column being dragged
   * This is set when drag starts and cleared when drag ends
   */
  @tracked draggedColumn: FilterColumn | null = null;

  /**
   * Tracked property to store the column being hovered over during drag
   * Used to provide visual feedback for potential drop targets
   */
  @tracked dropTargetColumn: FilterColumn | null = null;

  constructor(
    owner: unknown,
    args: AiReportingPreviewFilterSectionsColumnsSignature['Args']
  ) {
    super(owner, args);

    this.allColumnsSelected = this.allColumns.every((c) => c.selected);
  }

  get allColumnsMap() {
    return this.args.allColumnsMap;
  }

  get allColumns() {
    const columns: FilterColumn[] = [];

    this.allColumnsMap.forEach((column) => {
      columns.push(column);
    });

    return columns.sort((a, b) => a.order - b.order);
  }

  get noSelectedColumns() {
    return this.allColumns.filter((c) => c.selected).length;
  }

  /**
   * Computes CSS classes for a column based on its drag state
   * Returns appropriate classes for styling based on whether the column
   * is being dragged or is a potential drop target
   *
   * @param column - The column to compute classes for
   * @returns A string of space-separated CSS class names
   */
  @action
  getColumnClass(column: FilterColumn): string {
    const classes = ['column-item'];

    if (this.dropTargetColumn && this.dropTargetColumn.field === column.field) {
      classes.push('drag-over');
    }

    return classes.join(' ');
  }

  /**
   * Toggle a column's selection status
   */
  @action
  toggleColumn(column: FilterColumn) {
    this.allColumnsMap.set(column.field, {
      ...column,
      selected: !column.selected,
    });

    this.args.onColumnsChange(this.allColumnsMap);

    this.allColumnsSelected = [...this.allColumnsMap.values()].every(
      (c) => c.selected
    );
  }

  /**
   * Toggle all columns' selection status
   */
  @action
  toggleAllColumns(event: Event, checked: boolean) {
    this.allColumnsSelected = checked;

    const updatedMap = new Map<string, FilterColumn>();

    // update selection status for all columns
    this.allColumnsMap.forEach((c, field) => {
      this.allColumnsMap.set(field, {
        ...c,
        selected: checked,
      });
    });

    this.args.onColumnsChange(this.allColumnsMap);
  }

  /**
   * Reset columns to default
   */
  @action
  resetColumns() {
    // Create a new map with reset selection status for all columns
    this.allColumnsMap.forEach((c, field) => {
      this.allColumnsMap.set(field, {
        ...c,
        selected: Boolean(c.default),
      });
    });

    // Update allColumnsSelected based on whether all columns are default
    this.allColumnsSelected = [...this.allColumnsMap.values()].every(
      (c) => c.selected
    );

    this.args.onColumnsChange(this.allColumnsMap);
  }

  /**
   * Handles the start of a drag operation
   * Sets the draggedColumn and configures the dataTransfer object
   *
   * @param column - The column being dragged
   * @param event - The drag event
   */
  @action
  handleColumnDragStart(column: FilterColumn, event: DragEvent) {
    this.draggedColumn = column;

    if (event.dataTransfer) {
      // Set data for drag operation
      event.dataTransfer.setData('text/plain', column.field);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  /**
   * Handles dragover events during drag operations
   * Updates the dropTargetColumn when hovering over a valid drop target
   *
   * @param column - The column being hovered over
   * @param event - The drag event
   * @returns false - To allow the drop
   */
  @action
  handleColumnDragOver(column: FilterColumn, event: DragEvent) {
    event.preventDefault();

    if (this.draggedColumn && this.draggedColumn.field !== column.field) {
      this.dropTargetColumn = column;
    }

    return false;
  }

  /**
   * Handles when the drag operation leaves a potential drop target
   * Clears the dropTargetColumn state when leaving the current target
   *
   * @param column - The column being left
   */
  @action
  handleColumnDragLeave(column: FilterColumn) {
    if (this.dropTargetColumn?.field === column.field) {
      this.dropTargetColumn = null;
    }
  }

  /**
   * Handles the drop operation to reorder columns
   * Performs the actual reordering of columns when an item is dropped
   *
   * @param targetColumn - The column where the dragged item is being dropped
   * @param event - The drop event
   */
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

  /**
   * Handles the end of a drag operation
   * Cleans up state when a drag operation ends
   */
  @action
  handleColumnDragEnd() {
    // Reset all drag state
    this.draggedColumn = null;
    this.dropTargetColumn = null;
  }

  get label() {
    return `(${this.noSelectedColumns}/${this.allColumns.length}) ${this.intl.t('selected')}`;
  }

  get disableApply() {
    return this.noSelectedColumns === 0;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections::Columns': typeof AiReportingPreviewFilterSectionsColumnsComponent;
  }
}
