import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const MENU_DATA = [
  { label: 'Add Project', icon: 'note-add', divider: true },
  { label: 'Add Member', icon: 'group-add', divider: true },
  { label: 'Delete', icon: 'delete', divider: false },
];

export default class AkMenuFreestyleDemoComponent extends Component {
  menuData = MENU_DATA;
  @tracked anchorRef: Element | null = null;

  @action
  handleMoreClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as Element;
  }

  @action
  handleClose() {
    this.anchorRef = null;
  }
}
