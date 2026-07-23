import Model, { attr } from '@ember-data/model';

export interface DsNavigationGraphNode {
  id: string;
  label: string;
  variant_id: string;
  title: string;
  visit_count: number;
  execution_order: number;
  screenshot_path: string;
}

export interface DsNavigationGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  action_type: string;
  action_target?: string;
}

export interface DsNavigationGraphMetadata {
  total_nodes: number;
  total_edges: number;
  total_navigations: number;
  scan_start_time: string;
}

export default class DsNavigationGraphModel extends Model {
  @attr()
  declare nodes: DsNavigationGraphNode[];

  @attr()
  declare edges: DsNavigationGraphEdge[];

  @attr()
  declare metadata: DsNavigationGraphMetadata;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'ds-navigation-graph': DsNavigationGraphModel;
  }
}
