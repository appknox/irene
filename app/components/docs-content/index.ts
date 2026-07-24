import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import { action } from '@ember/object';

export default class DocsContentComponent extends Component {
  @service router!: RouterService;

  scrollContainerRef: HTMLDivElement | null = null;

  constructor(owner: unknown, args: object) {
    super(owner, args);
    this.router.on('routeDidChange', this.scrollToTop);
  }

  willDestroy() {
    super.willDestroy();
    this.router.off('routeDidChange', this.scrollToTop);
  }

  @action
  scrollToTop() {
    this.scrollContainerRef?.scrollTo(0, 0);
  }

  @action
  setScrollContainerRef(element: HTMLDivElement) {
    this.scrollContainerRef = element;
  }
}
