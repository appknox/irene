import type cytoscape from 'cytoscape';

import getCssVariableValue from 'irene/utils/get-css-variable-value';

import type {
  DsNavigationGraphNode,
  DsNavigationGraphEdge,
} from 'irene/models/ds-navigation-graph';

// Types
export type NavigationGraphLayout = 'grid' | 'breadthfirst';

export type NavigationGraphLayoutOption = {
  label: string;
  value: NavigationGraphLayout;
};

// Layout options for the graph
export const GRAPH_LAYOUT_OPTIONS: NavigationGraphLayoutOption[] = [
  { label: 'Grid', value: 'grid' },
  { label: 'Breadthfirst', value: 'breadthfirst' },
];

// Window between two taps on the same node for it to count as a
// double tap (focus) instead of a single tap (detail drawer)
export const DOUBLE_TAP_WINDOW_MS = 320;
export const RESIZE_DEBOUNCE_MS = 150;
export const GRAPH_FIT_PADDING = 64;

// Pan animation when the drawer opens / prev-next changes the selection
export const NODE_CENTER_ANIMATION_MS = 280;

// Fallback if the drawer DOM cannot be measured for some reason
export const NODE_DRAWER_WIDTH_FALLBACK = 480;

// Hard bounds for all zooming — user gestures, fits and animations alike
export const MIN_GRAPH_ZOOM = 0.1;
export const MAX_GRAPH_ZOOM = 2;

// Cytoscape renders to canvas and cannot resolve CSS custom properties
// directly, so the theme variables are resolved at runtime
const GRAPH_COLORS = {
  accent: getCssVariableValue('--primary-main'),
  neutral: getCssVariableValue('--text-primary'),
  muted: getCssVariableValue('--neutral-grey-700'),
  surface: getCssVariableValue('--background-main'),
  surfaceAlt: getCssVariableValue('--neutral-grey-100'),
};

// Styles for the graph
export const GRAPH_STYLES = [
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      width: 120,
      height: 160,
      shape: 'round-rectangle',
      'background-color': GRAPH_COLORS.surface,
      color: GRAPH_COLORS.neutral,
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 10,
      'font-size': '12px',
      'font-weight': 500,
      'text-background-color': GRAPH_COLORS.surface,
      'text-background-opacity': 0.96,
      'text-background-padding': '5px',
      'text-background-shape': 'roundrectangle',
      padding: '6px',
      'text-wrap': 'wrap',
      'text-max-width': '110px',
      'z-index': 10,
    },
  },
  {
    selector: 'node[screenshot]',
    style: {
      'background-image': 'data(screenshot)',
      'background-fit': 'contain',
      'background-clip': 'node',
      'background-opacity': 1,
      'background-color': GRAPH_COLORS.surfaceAlt,
      'text-background-color': GRAPH_COLORS.surfaceAlt,
    },
  },
  {
    selector: 'edge',
    style: {
      'z-index': 0,
      width: 2,
      'line-color': GRAPH_COLORS.muted,
      'target-arrow-color': GRAPH_COLORS.muted,
      'target-arrow-shape': 'triangle-backcurve',
      'curve-style': 'round-taxi',
      'taxi-direction': 'vertical',
      'taxi-turn': 50,
      'taxi-turn-min-distance': 100,
    },
  },
  {
    selector: 'node.active',
    style: {
      'border-width': 1,
      'border-color': GRAPH_COLORS.accent,
      'overlay-color': GRAPH_COLORS.accent,
      'overlay-opacity': 0.4,
      'overlay-padding': 6,
    },
  },
  {
    selector: 'node.faded',
    style: { opacity: 0.14, 'text-opacity': 0.35 },
  },
  {
    selector: 'node.focused',
    style: {
      opacity: 1,
      'text-opacity': 1,
      'border-width': 3,
      'border-color': GRAPH_COLORS.accent,
      'z-index': 20,
    },
  },
  {
    selector: 'edge.faded',
    style: { opacity: 0.07 },
  },
  {
    selector: 'edge.focused',
    style: {
      opacity: 1,
      width: 3,
      'line-color': GRAPH_COLORS.accent,
      'target-arrow-color': GRAPH_COLORS.accent,
    },
  },
] as cytoscape.StylesheetJson;

// Compares nodes by execution order
export function compareByExecutionOrder(
  a: cytoscape.NodeSingular,
  b: cytoscape.NodeSingular
) {
  return (
    (a.data('execution_order') ?? Infinity) -
    (b.data('execution_order') ?? Infinity)
  );
}

// Builds the graph elements
export function buildGraphElements(
  nodes: DsNavigationGraphNode[],
  edges: DsNavigationGraphEdge[]
): cytoscape.ElementDefinition[] {
  return [
    ...nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label,
        variant_id: node.variant_id,
        title: node.title,
        visit_count: node.visit_count,
        execution_order: node.execution_order,
        screenshot: node.screenshot_path,
      },
    })),
    ...edges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        action_type: edge.action_type,
      },
    })),
  ];
}

// Builds the graph layout options
export function buildGraphLayoutOptions(
  name: NavigationGraphLayout,
  root?: cytoscape.NodeSingular
) {
  const common = { padding: GRAPH_FIT_PADDING, fit: true, animate: true };

  if (name === 'breadthfirst') {
    return {
      ...common,
      name: 'breadthfirst',
      directed: true,
      circle: false,
      grid: false,
      spacingFactor: 2,
      ...(root ? { roots: root } : {}),
    };
  }

  return {
    ...common,
    name: 'grid',
    avoidOverlap: true,
    avoidOverlapPadding: 96,
    nodeDimensionsIncludeLabels: true,
    condense: false,
    sort: compareByExecutionOrder,
  };
}
