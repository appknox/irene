export interface FilterColumn {
  name: string;
  field: string;
  selected: boolean;
  order: number;
  default?: boolean;
  type?: string;
  width?: number;
  minWidth?: number;
  isHideable?: boolean;
  defaultOrder: number;
  isFixed?: 'left' | 'right';
}

export const DEFAULT_PROJECT_COLUMNS: Omit<
  FilterColumn,
  'order' | 'defaultOrder'
>[] = [
  {
    name: 'fileID',
    field: 'lastFile.id',
    selected: true,
    default: true,
    isHideable: false,
    width: 80,
    isFixed: 'left',
  },
  {
    name: 'platform',
    field: 'platform',
    selected: true,
    default: true,
    isHideable: false,
    width: 80,
  },
  {
    name: 'name',
    field: 'name',
    selected: true,
    default: true,
    isHideable: false,
    width: 200,
  },
  {
    name: 'packageName',
    field: 'packageName',
    selected: true,
    default: true,
    isHideable: true,
  },
  {
    name: 'version',
    field: 'lastFile.version',
    selected: true,
    default: true,
    isHideable: true,
  },
  {
    name: 'versionCodeTitleCase',
    field: 'lastFile.versionCode',
    selected: false,
    default: false,
    minWidth: 150,
    isHideable: true,
  },
  {
    name: 'severityLevel',
    field: 'severityLevel',
    selected: true,
    default: true,
    width: 400,
    isHideable: true,
  },
  {
    name: 'scanStatus',
    field: 'scanStatus',
    selected: true,
    default: true,
    width: 200,
    isHideable: true,
  },
  {
    name: 'createdOn',
    field: 'lastFile.createdOnDateTime',
    selected: false,
    default: false,
    isHideable: true,
  },
  {
    name: 'tags',
    field: 'tags',
    selected: false,
    default: false,
    isHideable: true,
  },
  {
    name: 'action',
    field: 'action',
    selected: true,
    default: true,
    isHideable: false,
    width: 80,
  },
];
