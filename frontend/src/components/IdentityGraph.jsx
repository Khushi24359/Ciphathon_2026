import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { Maximize2, Minimize2 } from 'lucide-react';

const IdentityGraph = ({ data }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;
    
    if (cyRef.current) {
        cyRef.current.destroy();
    }

    const elements = [...data.nodes, ...data.edges];

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "#00FFC6",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "10px",
            color: "#fff",
            "shadow-blur": 20,
            "shadow-color": "#00FFC6"
          }
        },
        {
          selector: 'node[type="user"]',
          style: { 'background-color': '#3b82f6', 'shape': 'hexagon', 'width': 60, 'height': 60, 'border-width': 3, 'border-color': '#93c5fd', "shadow-color": "#3b82f6" } 
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#444",
            "target-arrow-color": "#444",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "label": "data(label)",
            "font-size": "8px",
            "color": "#888",
            "text-background-opacity": 0.5,
            "text-background-color": "#000"
          }
        },
        {
          selector: ".breach",
          style: {
            "background-color": "#FF3B3B",
            "shadow-color": "#FF3B3B",
            "shadow-blur": 25
          }
        },
        {
          selector: 'node[type="breach"]',
          style: {
            "background-color": "#FF3B3B",
            "shadow-color": "#FF3B3B",
            "shadow-blur": 25
          }
        }
      ],
      layout: {
        name: 'cose',
        padding: 50,
        nodeRepulsion: 600000, 
        idealEdgeLength: 120,    
        edgeElasticity: 80,
        nodeOverlap: 20
      }
    });
    
    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [data, isFullscreen]); // Re-run layout on fullscreen toggle

  return (
    <div className={`w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl transition-all duration-300 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : 'h-[650px] mt-2'}`}>
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/80 backdrop-blur-md flex justify-between items-center z-10">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
          Identity Graph Mapping
          {data.nodes.length > 50 && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full normal-case">Condensed View</span>}
        </h3>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span> Target</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> Email</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]"></span> Phone</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span> Surface</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span> Breach</span>
          </div>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Maximize Graph"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div 
        ref={containerRef} 
        className="flex-1 w-full bg-[#030712]"
        style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />
    </div>
  );
};

export default IdentityGraph;
