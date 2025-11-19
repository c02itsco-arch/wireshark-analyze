
import React, { useEffect, useRef } from 'react';
import { GraphData, GraphNode, GraphLink } from '../types';

interface GraphDisplayProps {
  data: GraphData;
}

const GraphDisplay: React.FC<GraphDisplayProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const threatColorMap: { [key: string]: string } = {
    high: '#f87171', // red-400
    medium: '#facc15', // yellow-400
    low: '#34d399', // emerald-400
    none: '#60a5fa', // blue-400
    default: '#9ca3af', // gray-400
  };

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const parent = svg.node().parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    svg.attr('width', width).attr('height', height).attr('viewBox', [-width / 2, -height / 2, width, height]);

    // Clear previous graph
    svg.selectAll('*').remove();

    // Make copies of data to avoid mutation
    const links = data.links.map((d: GraphLink) => ({ ...d }));
    const nodes = data.nodes.map((d: GraphNode) => ({ ...d }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(0, 0))
      .on('tick', ticked);

    const g = svg.append('g');

    const link = g.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    const node = g.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d: GraphNode) => d.threatLevel === 'high' ? 12 : 8)
      .attr('fill', (d: GraphNode) => threatColorMap[d.threatLevel] || threatColorMap.default)
      .call(drag(simulation));

    const labels = g.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .text((d: GraphNode) => d.id)
        .attr('x', 12)
        .attr('y', 4)
        .attr("fill", "white")
        .style("font-size", "10px");

    node.append('title').text((d: GraphNode) => `${d.id}\nType: ${d.type}\nThreat: ${d.threatLevel}`);
    link.append('title').text((d: any) => `Port: ${d.port}\nCount: ${d.count}`);
    
    function ticked() {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
        
      labels
        .attr('x', (d: any) => d.x + 12)
        .attr('y', (d: any) => d.y + 4);
    }
    
    function drag(simulation: any) {
        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    // Zoom functionality
    const zoom = d3.zoom().on('zoom', (event: any) => {
      g.attr('transform', event.transform);
    });

    svg.call(zoom);

  }, [data]);

  return <svg ref={svgRef} className="w-full h-full"></svg>;
};

export default GraphDisplay;
