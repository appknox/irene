import Component from '@glimmer/component';

const COMPONENTS = [
  { id: 'ak-accordion', label: 'Accordion' },
  { id: 'ak-appbar', label: 'Appbar' },
  { id: 'ak-autocomplete', label: 'Autocomplete' },
  { id: 'ak-button', label: 'Button' },
  { id: 'ak-checkbox', label: 'Checkbox' },
  { id: 'ak-checkbox-tree', label: 'Checkbox Tree' },
  { id: 'ak-chip', label: 'Chip' },
  { id: 'ak-clipboard', label: 'Clipboard' },
  { id: 'ak-date-picker', label: 'Date Picker' },
  { id: 'ak-divider', label: 'Divider' },
  { id: 'ak-drawer', label: 'Drawer' },
  { id: 'ak-icon', label: 'Icon' },
  { id: 'ak-icon-button', label: 'Icon Button' },
  { id: 'ak-link', label: 'Link' },
  { id: 'ak-list', label: 'List' },
  { id: 'ak-loader', label: 'Loader' },
  { id: 'ak-menu', label: 'Menu' },
  { id: 'ak-modal', label: 'Modal' },
  { id: 'ak-pagination', label: 'Pagination' },
  { id: 'ak-popover', label: 'Popover' },
  { id: 'ak-radio', label: 'Radio' },
  { id: 'ak-select', label: 'Select' },
  { id: 'ak-skeleton', label: 'Skeleton' },
  { id: 'ak-stack', label: 'Stack' },
  { id: 'ak-table', label: 'Table' },
  { id: 'ak-tabs', label: 'Tabs' },
  { id: 'ak-text-field', label: 'Text Field' },
  { id: 'ak-toggle', label: 'Toggle' },
  { id: 'ak-tooltip', label: 'Tooltip' },
  { id: 'ak-tree', label: 'Tree' },
  { id: 'ak-typography', label: 'Typography' },
];

export default class FreestyleNavComponent extends Component {
  components = COMPONENTS;
}
