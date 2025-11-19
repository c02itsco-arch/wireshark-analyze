// This declaration is needed for TypeScript to recognize the D3.js library loaded via a script tag.
// FIX: Wrap d3 declaration in `declare global` to make it available application-wide.
// This is necessary because this file is a module (due to `export` statements),
// and declarations in modules are not global by default.
declare global {
  var d3: any;
}

export interface GraphNode {
  id: string;
  type: 'source_ip' | 'destination_ip' | 'internal_ip' | 'external_ip';
  threatLevel: 'low' | 'medium' | 'high' | 'none';
}

export interface GraphLink {
  source: string;
  target: string;
  port: number;
  count: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface AnalysisResult {
  analysisSummary: string;
  graphData: GraphData;
}
