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
  MIN_GRAPH_ZOOM,
  MAX_GRAPH_ZOOM,
  NODE_CENTER_ANIMATION_MS,
  NODE_DRAWER_WIDTH_FALLBACK,
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

  // Pan + zoom snapshot taken just before the drawer opens so we can
  // restore the exact pre-drawer view when it closes.
  viewBeforeDrawer: { pan: cytoscape.Position; zoom: number } | null = null;

  // Drawer panel ref captured by `{{did-insert}}` so we can measure its width
  // without scanning the DOM.
  drawerContentEl: HTMLElement | null = null;

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

  @action
  selectNodeAtIndex(index: number | null) {
    const drawerWasOpen = this.selectedNodeIndex !== null;
    const drawerWillOpen = index !== null;

    // Drawer opening from a closed state: snapshot the current pan + zoom
    // so we can restore the exact pre-drawer view on close.
    if (!drawerWasOpen && drawerWillOpen && this.cy) {
      const pan = this.cy.pan();

      this.viewBeforeDrawer = {
        pan: { x: pan.x, y: pan.y },
        zoom: this.cy.zoom(),
      };
    }

    if (drawerWillOpen) {
      this.imageLoading = true;
    }

    this.selectedNodeIndex = index;
    this.syncActiveNode();

    if (drawerWillOpen) {
      // Wait one frame so the drawer is in the DOM before we measure it.
      this.window.requestAnimationFrame(() =>
        this.centerSelectedNodeOnCanvas()
      );
    } else if (drawerWasOpen) {
      this.restoreViewBeforeDrawer();
    }
  }

  // Animates the canvas back to the pan + zoom captured before the drawer opened.
  @action
  restoreViewBeforeDrawer() {
    const cy = this.cy;
    const snapshot = this.viewBeforeDrawer;

    if (!cy || !snapshot) {
      return;
    }

    cy.animate({
      pan: snapshot.pan,
      zoom: snapshot.zoom,
      duration: NODE_CENTER_ANIMATION_MS,
    });

    this.viewBeforeDrawer = null;
  }

  // Pans the canvas so the selected node sits at the center of the area
  // not covered by the detail drawer.
  @action
  centerSelectedNodeOnCanvas() {
    const cy = this.cy;
    const node = this.selectedNode;

    if (!cy || !node) {
      return;
    }

    const targetNode = cy.getElementById(node.id);

    if (targetNode.empty()) {
      return;
    }

    const drawerWidth =
      this.drawerContentEl?.getBoundingClientRect().width ??
      NODE_DRAWER_WIDTH_FALLBACK;

    const zoom = cy.zoom();
    const pos = targetNode.position();
    const cw = cy.width();
    const ch = cy.height();

    cy.animate({
      pan: {
        x: (cw - drawerWidth) / 2 - pos.x * zoom,
        y: ch / 2 - pos.y * zoom,
      },
      duration: NODE_CENTER_ANIMATION_MS,
    });
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

  @action
  registerDrawerContent(element: HTMLElement) {
    this.drawerContentEl = element;
  }

  @action
  unregisterDrawerContent() {
    this.drawerContentEl = null;
  }

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

    if (animate) {
      cy.animate({
        center: { eles: cy.elements() },
        duration: 200,
      });
    } else {
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
