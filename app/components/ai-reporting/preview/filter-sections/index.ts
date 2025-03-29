import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type { FilterColumn } from 'irene/components/ai-reporting/preview';

import type {
  ReportRequestPreview,
  ReportPreviewData,
} from 'irene/models/report-request';

interface AiReportingPreviewFilterSectionsSignature {
  Args: {
    reportPreview: ReportRequestPreview;
    onColumnsChange: (selectedColumns: FilterColumn[]) => void;
    selectedColumnsMap: Map<string, FilterColumn>;
  };
}

export default class AiReportingPreviewFilterSections extends Component<AiReportingPreviewFilterSectionsSignature> {
  @tracked allColumnsMap: Map<string, FilterColumn> = new Map();
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
    args: AiReportingPreviewFilterSectionsSignature['Args']
  ) {
    super(owner, args);

    this.allColumnsMap = this.getAllColumnsMap();
    this.allColumnsSelected = this.allColumns.every((c) => c.selected);
  }

  willDestroy(): void {
    super.willDestroy();

    this.args.onColumnsChange([]);
  }

  get reportPreview() {
    return this.args.reportPreview;
  }

  get selectedColumnsMap() {
    return this.args.selectedColumnsMap;
  }

  get allColumns() {
    return [...this.allColumnsMap.values()].sort((a, b) => a.order - b.order);
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

    if (this.draggedColumn && this.draggedColumn.field === column.field) {
      classes.push('dragging');
    }

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

    this.allColumnsMap = new Map(this.allColumnsMap);

    this.args.onColumnsChange(
      [...this.allColumnsMap.values()]
        .filter((c) => c.selected)
        .sort((a, b) => a.order - b.order)
    );

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

    // Create a new map with updated selection status for all columns
    const updatedColumns = [...this.allColumnsMap.values()].map((c) => ({
      ...c,
      selected: checked,
    }));

    this.allColumnsMap = new Map(updatedColumns.map((c) => [c.field, c]));

    this.args.onColumnsChange(
      checked ? updatedColumns.sort((a, b) => a.order - b.order) : []
    );
  }

  /**
   * Reset columns to default
   */
  @action
  resetColumns() {
    // Create a new map with reset selection status for all columns
    const resetColumns = [...this.allColumnsMap.values()].map((c) => {
      const isDefault = Boolean(c.default);
      return {
        ...c,
        selected: isDefault,
      };
    });

    this.allColumnsMap = new Map(resetColumns.map((c) => [c.field, c]));

    // Update allColumnsSelected based on whether all columns are default
    this.allColumnsSelected = resetColumns.every((c) => c.selected);

    this.args.onColumnsChange([]);
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

    // Create a new map reference to trigger reactivity
    this.allColumnsMap = new Map(this.allColumnsMap);

    // Get selected columns
    const selectedColumns = [...this.allColumnsMap.values()]
      .filter((c) => c.selected)
      .sort((a, b) => a.order - b.order);

    this.args.onColumnsChange(selectedColumns);
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

  /**
   * Extract all columns from the data, including nested objects
   * and create objects with field and label properties
   */
  private getAllColumnsMap(): Map<string, FilterColumn> {
    if (!this.reportPreview.data.length) {
      return new Map();
    }

    const data = this.reportPreview.data[0] as ReportPreviewData;

    // Flatten the data structure and extract all fields
    const columnsMap: Map<string, FilterColumn> = new Map();

    // Process all keys from the data object
    this.extractFieldsFromObject(data, '', columnsMap);

    return columnsMap;
  }

  /**
   * Recursively extract fields from nested objects
   * @param obj The object to extract fields from
   * @param prefix The prefix for nested fields (e.g., 'project__' for project.id to become 'project__id')
   * @param columnsMap Map to collect the extracted columns
   */
  private extractFieldsFromObject(
    obj: Record<string, any>,
    prefix: string,
    columnsMap: Map<string, FilterColumn>
  ): void {
    // Keep track of the original order as fields are discovered
    let currentIndex = columnsMap.size;

    for (const [key, value] of Object.entries(obj)) {
      const field = prefix ? `${prefix}${key}` : key;

      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        // For nested objects, recursively extract fields
        this.extractFieldsFromObject(value, `${field}__`, columnsMap);
      } else {
        // For primitive values or arrays, add the field
        // Check if the field exists in selectedColumnsMap to maintain order
        const selectedColumn = this.selectedColumnsMap.get(field);

        // Only add if this field hasn't been added yet
        if (!columnsMap.has(field)) {
          columnsMap.set(field, {
            name: selectedColumn?.name || this.formatFieldLabel(field),
            field,
            selected: !!selectedColumn,
            // Use the selectedColumn's order if available, otherwise use the discovery order
            order: selectedColumn?.order ?? currentIndex,
            default: selectedColumn?.default,
          });

          currentIndex++;
        }
      }
    }
  }

  /**
   * Format a field name into a human-readable label
   * For example: 'project__package_name' -> 'Project Package Name'
   */
  private formatFieldLabel(field: string): string {
    return field
      .replace(/__/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::FilterSections': typeof AiReportingPreviewFilterSections;
  }
}
