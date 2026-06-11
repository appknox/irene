import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import cytoscape from 'cytoscape';

import DsNavigationGraphModel, {
  type DsNavigationGraphNode,
} from 'irene/models/ds-navigation-graph';

import {
  GRAPH_LAYOUT_OPTIONS,
  DOUBLE_TAP_WINDOW_MS,
  RESIZE_DEBOUNCE_MS,
  GRAPH_FIT_PADDING,
  DEFAULT_GRAPH_ZOOM,
  MIN_GRAPH_ZOOM,
  MAX_GRAPH_ZOOM,
  GRAPH_STYLES,
  buildGraphElements,
  buildGraphLayoutOptions,
  compareByExecutionOrder,
  type NavigationGraphLayout,
  type NavigationGraphLayoutOption,
} from './graph-config';

export interface FileDetailsDynamicScanNavigationGraphSignature {
  Element: HTMLElement;
  Args: {
    navigationGraph: DsNavigationGraphModel | null;
  };
}

export default class FileDetailsDynamicScanNavigationGraphComponent extends Component<FileDetailsDynamicScanNavigationGraphSignature> {
  @service('browser/document') declare document: Document;
  @service('browser/window') declare window: Window;

  cy: cytoscape.Core | null = null;

  @tracked selectedLayout: NavigationGraphLayout = 'grid';
  @tracked selectedNodeIndex: number | null = null;
  @tracked imageLoading = true;

  detailTapTimer: ReturnType<typeof setTimeout> | null = null;
  lastNodeTapAt = 0;
  lastNodeTapId: string | null = null;

  resizeTimer: ReturnType<typeof setTimeout> | null = null;

  layoutOptions = GRAPH_LAYOUT_OPTIONS;

  get navigationGraph() {
    return this.args.navigationGraph;
  }

  get nodes() {
    return this.navigationGraph?.nodes ?? [];
  }

  get edges() {
    return this.navigationGraph?.edges ?? [];
  }

  get nodesSortedByExecutionOrder(): DsNavigationGraphNode[] {
    return [...this.nodes].sort(
      (a, b) => a.execution_order - b.execution_order
    );
  }

  get variantCount() {
    return this.nodes.length;
  }

  get transitionCount() {
    return this.edges.length;
  }

  get selectedLayoutOption() {
    return this.layoutOptions.find(
      (option) => option.value === this.selectedLayout
    );
  }

  get selectedNode() {
    if (this.selectedNodeIndex === null) {
      return null;
    }

    return this.nodesSortedByExecutionOrder[this.selectedNodeIndex] ?? null;
  }

  get hasPreviousNode() {
    return this.selectedNodeIndex !== null && this.selectedNodeIndex > 0;
  }

  get hasNextNode() {
    return (
      this.selectedNodeIndex !== null &&
      this.selectedNodeIndex < this.nodesSortedByExecutionOrder.length - 1
    );
  }

  get previousNodeTitle() {
    if (this.selectedNodeIndex === null || !this.hasPreviousNode) {
      return null;
    }

    const node = this.nodesSortedByExecutionOrder[this.selectedNodeIndex - 1];

    return node?.title?.trim() || '—';
  }

  get nextNodeTitle() {
    if (this.selectedNodeIndex === null || !this.hasNextNode) {
      return null;
    }

    const node = this.nodesSortedByExecutionOrder[this.selectedNodeIndex + 1];

    return node?.title?.trim() || '—';
  }

  get targetGraphZoom() {
    const cy = this.cy;

    if (!cy || this.selectedLayout !== 'breadthfirst') {
      return DEFAULT_GRAPH_ZOOM;
    }

    const boundingBox = cy.elements().boundingBox();

    if (!boundingBox.w || !boundingBox.h) {
      return DEFAULT_GRAPH_ZOOM;
    }

    const fitZoom = Math.min(
      (cy.width() - 2 * GRAPH_FIT_PADDING) / boundingBox.w,
      (cy.height() - 2 * GRAPH_FIT_PADDING) / boundingBox.h
    );

    return Math.min(fitZoom, DEFAULT_GRAPH_ZOOM);
  }

  @action
  selectNodeAtIndex(index: number | null) {
    if (index !== null) {
      this.imageLoading = true;
    }

    this.selectedNodeIndex = index;
    this.syncActiveNode();
  }

  @action
  openNodeDetail(variantId: string) {
    const index = this.nodesSortedByExecutionOrder.findIndex(
      (node) => node.variant_id === variantId || node.id === variantId
    );

    if (index !== -1) {
      this.selectNodeAtIndex(index);
    }
  }

  // Mirrors the drawer selection onto the canvas as the `active` node class
  @action
  syncActiveNode() {
    const cy = this.cy;

    if (!cy) {
      return;
    }

    cy.batch(() => {
      cy.nodes().removeClass('active');

      if (this.selectedNode) {
        cy.getElementById(this.selectedNode.id).addClass('active');
      }
    });
  }

  // ------------------------------------------------------------------
  // Graph lifecycle and events
  // ------------------------------------------------------------------

  @action initializeGraph(element: HTMLElement) {
    this.cy = cytoscape({
      container: element,
      elements: buildGraphElements(this.nodes, this.edges),
      style: GRAPH_STYLES,
      layout: this.buildLayoutOptions(this.selectedLayout),
      minZoom: MIN_GRAPH_ZOOM,
      maxZoom: MAX_GRAPH_ZOOM,
    });

    this.wireGraphEvents();
    this.logCanvasAspectRatio('render');

    this.document.addEventListener('keydown', this.handleKeydown);
    this.window.addEventListener('resize', this.handleWindowResize);
  }

  @action
  wireGraphEvents() {
    const cy = this.cy;

    if (!cy) {
      return;
    }

    // Settle at the default zoom after the initial render and layout changes
    cy.on('layoutstop', () => this.setDefaultGraphZoom());

    cy.on('zoom', () => this.logCanvasAspectRatio('zoom'));

    // Tap on empty canvas clears focus
    cy.on('tap', (event) => {
      if (event.target === cy) {
        this.cancelPendingDetailTap();
        this.clearGraphFocus();
      }
    });

    // Single tap opens the detail drawer (debounced so a double tap
    // can cancel it)
    cy.on('tap', 'node', (event) => {
      const node = event.target as cytoscape.NodeSingular;
      const id = node.id();
      const now = Date.now();

      if (
        this.detailTapTimer &&
        this.lastNodeTapId === id &&
        now - this.lastNodeTapAt < DOUBLE_TAP_WINDOW_MS + 80
      ) {
        this.cancelPendingDetailTap();

        return;
      }

      this.cancelPendingDetailTap();

      this.lastNodeTapAt = now;
      this.lastNodeTapId = id;

      this.detailTapTimer = setTimeout(() => {
        this.cancelPendingDetailTap();
        this.openNodeDetail(node.data('variant_id') ?? id);
      }, DOUBLE_TAP_WINDOW_MS);
    });

    // Double tap focuses the node neighborhood
    cy.on('dbltap', 'node', (event) => {
      this.cancelPendingDetailTap();
      this.applyGraphFocus(event.target as cytoscape.NodeSingular);
    });
  }

  @action
  buildLayoutOptions(name: NavigationGraphLayout) {
    const root = this.cy?.nodes().toArray().sort(compareByExecutionOrder)[0];

    return buildGraphLayoutOptions(name, root);
  }

  // ------------------------------------------------------------------
  // Zoom and view management
  // ------------------------------------------------------------------

  // Breadthfirst spreads the graph out far more than grid, so zoom out
  // as far as needed to fit the content instead of the fixed default

  @action
  setDefaultGraphZoom(animate = false) {
    const cy = this.cy;

    if (!cy) {
      return;
    }

    const zoom = this.targetGraphZoom;

    if (animate) {
      cy.animate({
        zoom,
        center: { eles: cy.elements() },
        duration: 200,
      });
    } else {
      cy.zoom(zoom);
      cy.center();
    }
  }

  @action
  resetGraphView() {
    if (!this.cy) {
      return;
    }

    this.cy.resize();
    this.setDefaultGraphZoom();
  }

  @action
  handleWindowResize() {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = setTimeout(() => {
      this.resizeTimer = null;
      this.resetGraphView();
    }, RESIZE_DEBOUNCE_MS);
  }

  @action
  logCanvasAspectRatio(trigger: 'render' | 'zoom') {
    const cy = this.cy;

    if (!cy) {
      return;
    }

    const width = cy.width();
    const height = cy.height();

    console.log(
      `[navigation-graph] canvas aspect ratio (${trigger}):`,
      (width / height).toFixed(4),
      { width, height, zoom: cy.zoom() }
    );
  }

  // ------------------------------------------------------------------
  // Focus mode (double tap)
  // ------------------------------------------------------------------

  @action
  cancelPendingDetailTap() {
    if (this.detailTapTimer) {
      clearTimeout(this.detailTapTimer);
    }

    this.detailTapTimer = null;
    this.lastNodeTapAt = 0;
    this.lastNodeTapId = null;
  }

  @action
  clearGraphFocus() {
    this.cy?.batch(() => {
      this.cy?.elements().removeClass('focused faded');
    });
  }

  @action
  applyGraphFocus(centerNode: cytoscape.NodeSingular) {
    const cy = this.cy;

    if (!cy) {
      return;
    }

    const neighborhood = centerNode.closedNeighborhood();

    cy.batch(() => {
      cy.elements().removeClass('focused faded');
      neighborhood.addClass('focused');
      cy.elements().not(neighborhood).addClass('faded');
    });
  }

  // ------------------------------------------------------------------
  // Keyboard and template actions
  // ------------------------------------------------------------------

  @action
  handleKeydown(event: KeyboardEvent) {
    if (this.selectedNode) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closeNodeDetail();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.showPreviousNode();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.showNextNode();
      }

      return;
    }

    if (event.key === 'Escape') {
      this.cancelPendingDetailTap();
      this.clearGraphFocus();
    }
  }

  @action
  handleLayoutChange(option: NavigationGraphLayoutOption) {
    this.selectedLayout = option.value;
    this.clearGraphFocus();
    this.cy?.layout(this.buildLayoutOptions(option.value)).run();
  }

  @action
  closeNodeDetail() {
    this.selectNodeAtIndex(null);
  }

  @action showPreviousNode() {
    if (this.selectedNodeIndex !== null && this.hasPreviousNode) {
      this.selectNodeAtIndex(this.selectedNodeIndex - 1);
    }
  }

  @action showNextNode() {
    if (this.selectedNodeIndex !== null && this.hasNextNode) {
      this.selectNodeAtIndex(this.selectedNodeIndex + 1);
    }
  }

  @action onScreenshotLoad() {
    this.imageLoading = false;
  }

  willDestroy() {
    super.willDestroy();

    this.document.removeEventListener('keydown', this.handleKeydown);
    this.window.removeEventListener('resize', this.handleWindowResize);

    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }

    this.cancelPendingDetailTap();

    this.cy?.destroy();
    this.cy = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::NavigationGraph': typeof FileDetailsDynamicScanNavigationGraphComponent;
  }
}
