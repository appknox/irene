export interface FilterColumn {
  name: string;
  field: string;
  selected: boolean;
  order: number;
  default?: boolean;
  type?: string;
  width?: number;
}

export const DEFAULT_PROJECT_COLUMNS: Omit<FilterColumn, 'order'>[] = [
  { name: 'fileID', field: 'id', selected: true, default: true },
  { name: 'platform', field: 'platform', selected: true, default: true },
  { name: 'name', field: 'name', selected: true, default: true },
  { name: 'packageName', field: 'packageName', selected: true, default: true },
  { name: 'version', field: 'lastFile.version', selected: true, default: true },
  {
    name: 'versionCodeTitleCase',
    field: 'lastFile.versionCode',
    selected: false,
    default: false,
    width: 100,
  },
  {
    name: 'severityLevel',
    field: 'severityLevel',
    selected: true,
    default: true,
  },
  { name: 'scanStatus', field: 'scanStatus', selected: true, default: true },
  {
    name: 'createdOn',
    field: 'lastFile.createdOnDateTime',
    selected: false,
    default: false,
  },
  { name: 'tags', field: 'tags', selected: false, default: false },
];

export function initializeColumns(
  columns: Omit<FilterColumn, 'order'>[]
): Map<string, FilterColumn> {
  const columnMap = new Map<string, FilterColumn>();

  columns.forEach((col, index) => {
    columnMap.set(col.field, {
      ...col,
      order: index,
    });
  });

  return columnMap;
}
