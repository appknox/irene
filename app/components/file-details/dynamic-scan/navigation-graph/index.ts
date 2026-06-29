import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import cytoscape from 'cytoscape';

import {
  DOUBLE_TAP_WINDOW_MS,
  RESIZE_DEBOUNCE_MS,
  MIN_GRAPH_ZOOM,
  MAX_GRAPH_ZOOM,
  NODE_CENTER_ANIMATION_MS,
  NODE_DRAWER_WIDTH_FALLBACK,
  GRAPH_FIT_PADDING,
  GRAPH_STYLES,
  buildGraphElements,
  buildGraphLayoutOptions,
  compareByExecutionOrder,
  type NavigationGraphLayout,
} from './graph-config';

import DsNavigationGraphModel, {
  type DsNavigationGraphNode,
} from 'irene/models/ds-navigation-graph';

import type FileModel from 'irene/models/file';

// Layout the graph renders with on first paint; the nav panel owns subsequent
// layout changes.
const INITIAL_LAYOUT: NavigationGraphLayout = 'grid';

// Fallback icon size (px) at zoom 1; scaled by the live zoom so the icon grows
// and shrinks with the node it sits on.
const FALLBACK_ICON_BASE_PX = 40;

export interface FileDetailsDynamicScanNavigationGraphSignature {
  Element: HTMLElement;
  Args: {
    navigationGraph: DsNavigationGraphModel | null;
    file: FileModel;
    dynamicscanId: string;
  };
}

export default class FileDetailsDynamicScanNavigationGraphComponent extends Component<FileDetailsDynamicScanNavigationGraphSignature> {
  @service('browser/document') declare document: Document;
  @service('browser/window') declare window: Window;

  @tracked selectedNodeIndex: number | null = null;

  // Ids of nodes whose screenshot is still loading. Drives the per-node loader
  // overlay; an id is removed once its image has loaded.
  @tracked loadingNodeIds: string[] = [];

  // Ids of nodes whose screenshot failed to load. Drives the per-node fallback
  // icon overlay shown in place of the (never-painted) screenshot.
  @tracked failedNodeIds: string[] = [];

  // Live canvas zoom, tracked so the fallback icon font-size scales with it.
  @tracked graphZoom = 1;

  cy: cytoscape.Core | null = null;

  // Canvas element captured by `{{did-insert}}` so the graph can be rebuilt
  // in place when the route swaps to another role's scan.
  canvasEl: HTMLElement | null = null;

  // HTML layer over the canvas that holds the per-node loader overlays.
  overlayEl: HTMLElement | null = null;

  // Holds in-flight screenshot `Image` objects so the browser cannot garbage
  // collect them (and cancel the load) before they settle. Reset per rebuild.
  pendingScreenshotImages: HTMLImageElement[] = [];

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

  get navigationGraph() {
    return this.args.navigationGraph;
  }

  get nodes() {
    return this.navigationGraph?.nodes ?? [];
  }

  get edges() {
    return this.navigationGraph?.edges ?? [];
  }

  // No graph to render when the record is missing (load failed / not found)
  // or the selected scan's graph has no nodes or edges.
  get hasGraphData() {
    return this.nodes.length > 0 || this.edges.length > 0;
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

  get fallbackIconFontSize() {
    return `${Math.round(this.graphZoom * FALLBACK_ICON_BASE_PX)}px !important`;
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

  // ------------------------------------------------------------------
  // Per-node screenshot loaders
  // ------------------------------------------------------------------

  @action
  updateGraphZoom() {
    this.graphZoom = this.cy?.zoom() ?? 1;
  }

  @action
  registerScreenshotOverlay(element: HTMLElement) {
    this.overlayEl = element;
  }

  @action
  unregisterScreenshotOverlay() {
    this.overlayEl = null;
  }

  // Loads each node's screenshot once, then paints it onto the node and clears
  // that node's loader. Runs after `buildGraph`, so `cy` always exists — no
  // load/paint ordering race. Loading it ourselves (rather than via cytoscape's
  // own `background-image`) keeps it to a single request per image.
  @action
  loadNodeScreenshots() {
    if (!this.cy) {
      return;
    }

    this.pendingScreenshotImages = [];
    this.failedNodeIds = [];

    // Show a loader for every node that has a screenshot before kicking off the
    // loads, so a cached image settling synchronously still finds its id here.
    this.loadingNodeIds = this.nodes
      .filter((node) => node.screenshot_path)
      .map((node) => node.id);

    for (const node of this.nodes) {
      if (node.screenshot_path) {
        this.loadSingleNodeScreenshot(node);
      }
    }
  }

  // Preloads one node's screenshot; paints it on load, shows a fallback on error.
  loadSingleNodeScreenshot(node: DsNavigationGraphNode) {
    const image = new Image();

    // Keep a reference until it settles so the load is not GC-cancelled.
    this.pendingScreenshotImages.push(image);

    // Listeners before `src` so a cache hit cannot fire before we listen.
    image.addEventListener('load', () => this.applyNodeScreenshot(node), {
      once: true,
    });

    image.addEventListener('error', () => this.markNodeScreenshotFailed(node), {
      once: true,
    });

    image.src = node.screenshot_path;

    // A cached image is `complete` synchronously; naturalWidth distinguishes a
    // successful decode from a cached failure.
    if (image.complete) {
      if (image.naturalWidth > 0) {
        this.applyNodeScreenshot(node);
      } else {
        this.markNodeScreenshotFailed(node);
      }
    }
  }

  // Paints the (now-cached) screenshot onto its node and removes its loader.
  applyNodeScreenshot(node: DsNavigationGraphNode) {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }

    this.cy?.getElementById(node.id).data('screenshot', node.screenshot_path);

    this.loadingNodeIds = this.loadingNodeIds.filter((id) => id !== node.id);
  }

  // Swaps a node's loader for a fallback icon when its screenshot fails to load.
  markNodeScreenshotFailed(node: DsNavigationGraphNode) {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }

    this.loadingNodeIds = this.loadingNodeIds.filter((id) => id !== node.id);

    if (!this.failedNodeIds.includes(node.id)) {
      this.failedNodeIds = [...this.failedNodeIds, node.id];
    }
  }

  // Pins each loader to its node's rendered center. Driven from cytoscape's
  // `render` event so loaders stay glued to nodes through pan, zoom and layout.
  @action
  syncScreenshotLoaderPositions() {
    const cy = this.cy;
    const overlay = this.overlayEl;

    if (!cy || !overlay) {
      return;
    }

    const loaders = overlay.querySelectorAll<HTMLElement>(
      '[data-node-loader-id]'
    );

    for (const loader of loaders) {
      const node = cy.getElementById(loader.dataset['nodeLoaderId'] ?? '');

      if (node.empty()) {
        continue;
      }

      const { x, y } = node.renderedPosition();

      loader.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    }
  }

  @action initializeGraph(element: HTMLElement) {
    this.canvasEl = element;
    this.buildGraph();

    this.document.addEventListener('keydown', this.handleKeydown);
    this.window.addEventListener('resize', this.handleWindowResize);
  }

  // Re-runs when the route swaps to another role's scan (`@dynamicscanId`
  // changes), rebuilding the canvas with the new graph's nodes/edges.
  @action rebuildGraph() {
    this.buildGraph();
  }

  @action
  buildGraph() {
    if (!this.canvasEl) {
      return;
    }

    // Tear down any existing instance and reset transient view/selection
    // state so a role switch starts from a clean graph.
    this.cy?.destroy();
    this.cy = null;
    this.selectedNodeIndex = null;
    this.viewBeforeDrawer = null;
    this.loadingNodeIds = [];
    this.failedNodeIds = [];
    this.cancelPendingDetailTap();

    this.cy = cytoscape({
      container: this.canvasEl,
      elements: buildGraphElements(this.nodes, this.edges),
      style: GRAPH_STYLES,
      layout: this.buildLayoutOptions(INITIAL_LAYOUT),
      minZoom: MIN_GRAPH_ZOOM,
      maxZoom: MAX_GRAPH_ZOOM,
    });

    this.wireGraphEvents();
    this.loadNodeScreenshots();
  }

  @action
  wireGraphEvents() {
    const cy = this.cy;

    if (!cy) {
      return;
    }

    // Settle at the default zoom after the initial render and layout changes
    cy.on('layoutstop', () => this.setDefaultGraphZoom());

    // Keep the per-node loaders glued to their nodes on every redraw.
    cy.on('render', () => this.syncScreenshotLoaderPositions());

    // Track zoom so the fallback icon scales with the node.
    cy.on('zoom', () => this.updateGraphZoom());

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

    // `fit` pans AND zooms so every node is visible with padding; `center`
    // alone only pans and leaves off-screen nodes when the graph is larger
    // than the viewport.
    if (animate) {
      const fitProps = { eles: cy.elements(), padding: GRAPH_FIT_PADDING };
      cy.animate({ fit: fitProps, duration: 200 });
    } else {
      cy.fit(cy.elements(), GRAPH_FIT_PADDING);
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

  // Resets the graph to its original view: closes the drawer, clears focus and
  // selection, and re-fits the canvas. The chosen layout is left intact.
  @action
  resetGraph() {
    this.cancelPendingDetailTap();
    this.viewBeforeDrawer = null;
    this.selectedNodeIndex = null;
    this.syncActiveNode();
    this.clearGraphFocus();
    this.setDefaultGraphZoom(true);
  }

  @action
  handleKeydown(event: KeyboardEvent) {
    // Ctrl/Cmd+Z resets the graph regardless of drawer/focus state.
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      this.resetGraph();

      return;
    }

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

  // Applies a layout chosen in the nav panel to the live graph. The panel owns
  // the selected-layout state; the parent just runs it against cytoscape.
  @action
  onLayoutChange(layout: NavigationGraphLayout) {
    this.clearGraphFocus();
    this.cy?.layout(this.buildLayoutOptions(layout)).run();
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

  willDestroy() {
    super.willDestroy();

    this.document.removeEventListener('keydown', this.handleKeydown);
    this.window.removeEventListener('resize', this.handleWindowResize);

    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }

    this.cancelPendingDetailTap();
    this.loadingNodeIds = [];
    this.failedNodeIds = [];
    this.pendingScreenshotImages = [];

    this.cy?.destroy();
    this.cy = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::NavigationGraph': typeof FileDetailsDynamicScanNavigationGraphComponent;
  }
}
