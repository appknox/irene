import Service from '@ember/service';

import type {
  ReportRequestPreview,
  ReportPreviewData,
  ReportPreviewColumn,
} from 'irene/models/report-request';

export interface FilterColumn {
  name: string;
  field: string;
  selected: boolean;
  order: number;
  default?: boolean;
  type?: string;
}

export default class AiReportingService extends Service {
  /**
   * Extract all columns from the data, including nested objects
   * and create objects with field and label properties
   */
  getAllPreviewColumnsMap(
    reportPreview: ReportRequestPreview | null
  ): Map<string, FilterColumn> {
    if (!reportPreview?.data.length) {
      return new Map();
    }

    const data = reportPreview.data[0] as ReportPreviewData;

    const defaultSelectedColumns = reportPreview.columns || [];

    // Flatten the data structure and extract all fields
    const columnsMap: Map<string, FilterColumn> = new Map();

    // Process all keys from the data object
    this.extractFieldsFromObject(data, '', columnsMap, defaultSelectedColumns);

    return columnsMap;
  }

  /**
   * Recursively extract fields from nested objects
   * @param obj The object to extract fields from
   * @param prefix The prefix for nested fields (e.g., 'project__' for project.id to become 'project__id')
   * @param columnsMap Map to collect the extracted columns
   * @param defaultSelectedColumns Array of default selected columns
   */
  private extractFieldsFromObject(
    obj: Record<string, any>,
    prefix: string,
    columnsMap: Map<string, FilterColumn>,
    defaultSelectedColumns: ReportPreviewColumn[]
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
        this.extractFieldsFromObject(
          value,
          `${field}__`,
          columnsMap,
          defaultSelectedColumns
        );
      } else {
        // For primitive values or arrays, add the field
        // Check if the field exists in defaultSelectedColumns to pre-select the column
        const defaultColumnIndex = defaultSelectedColumns.findIndex(
          (col) => col.field === field
        );

        const defaultColumn =
          defaultColumnIndex !== -1
            ? defaultSelectedColumns[defaultColumnIndex]
            : null;

        // Only add if this field hasn't been added yet
        if (!columnsMap.has(field)) {
          columnsMap.set(field, {
            name: defaultColumn?.label || this.formatFieldLabel(field),
            field,
            selected: !!defaultColumn,
            order:
              defaultColumnIndex !== -1
                ? defaultColumnIndex
                : defaultSelectedColumns.length + currentIndex,
            default: !!defaultColumn,
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
