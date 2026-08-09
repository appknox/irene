import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type { DsNavigationGraphNode } from 'irene/models/ds-navigation-graph';

export interface FileDetailsDynamicScanNavigationGraphScreenshotDrawerSignature {
  Element: HTMLElement;
  Args: {
    node: DsNavigationGraphNode;
    hasPreviousNode: boolean;
    hasNextNode: boolean;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onContentInsert: (element: HTMLElement) => void;
    onContentDestroy: () => void;
  };
}

export default class FileDetailsDynamicScanNavigationGraphScreenshotDrawerComponent extends Component<FileDetailsDynamicScanNavigationGraphScreenshotDrawerSignature> {
  // Tracks which node's screenshot finished loading. Comparing against the
  // current node makes the loader reappear immediately when the node changes.
  @tracked loadedNodeId: string | null = null;

  // Tracks which node's screenshot failed to load, so the fallback shows for
  // that node only and clears automatically when the node changes.
  @tracked failedNodeId: string | null = null;

  get imageLoading() {
    return !this.imageFailed && this.loadedNodeId !== this.args.node.id;
  }

  get imageFailed() {
    return this.failedNodeId === this.args.node.id;
  }

  @action
  onScreenshotLoad() {
    this.loadedNodeId = this.args.node.id;
  }

  @action
  onScreenshotError() {
    this.failedNodeId = this.args.node.id;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::NavigationGraph::ScreenshotDrawer': typeof FileDetailsDynamicScanNavigationGraphScreenshotDrawerComponent;
  }
}
