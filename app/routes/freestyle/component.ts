import Route from '@ember/routing/route';

const VALID_COMPONENTS = [
  'ak-accordion',
  'ak-appbar',
  'ak-autocomplete',
  'ak-button',
  'ak-checkbox',
  'ak-checkbox-tree',
  'ak-chip',
  'ak-clipboard',
  'ak-date-picker',
  'ak-divider',
  'ak-drawer',
  'ak-icon',
  'ak-icon-button',
  'ak-link',
  'ak-list',
  'ak-loader',
  'ak-menu',
  'ak-modal',
  'ak-pagination',
  'ak-popover',
  'ak-radio',
  'ak-select',
  'ak-skeleton',
  'ak-stack',
  'ak-table',
  'ak-tabs',
  'ak-text-field',
  'ak-toggle',
  'ak-tooltip',
  'ak-tree',
  'ak-typography',
];

export default class FreestyleComponentRoute extends Route {
  model(params: { component_id?: string }) {
    const id = params.component_id ?? '';
    return VALID_COMPONENTS.includes(id) ? id : 'ak-accordion';
  }
}
