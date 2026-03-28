import React, { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { Maximize2, Minimize2, RefreshCw, Layers, ZoomIn, ZoomOut } from 'lucide-react';

// Register advanced layout
cytoscape.use(coseBilkent);

const IdentityGraph = ({ data, onNodeClick }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isComputing, setIsComputing] = useState(false);

  // Requirements: Structured Layout & Spacing
  const runLayout = useCallback((layoutType = 'cose-bilkent') => {
    if (!cyRef.current) return;
    setIsComputing(true);
    
    const layout = cyRef.current.layout({
      name: layoutType,
      animate: true,
      animationDuration: 1000,
      randomize: true,
      fit: true,
      padding: 100,
      nodeRepulsion: 12000, // Requirements: Increase spacing
      idealEdgeLength: 150, // Requirements: Edge length
      edgeElasticity: 0.45,
      nestingFactor: 0.1,
      gravity: 0.25,
      numIter: 2500,
      tile: true,
      tilingPaddingVertical: 40,
      tilingPaddingHorizontal: 40,
      stop: () => setIsComputing(false)
    });
    
    layout.run();
  }, []);

  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;
    
    if (cyRef.current) {
        cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...data.nodes, ...data.edges],
      boxSelectionEnabled: false,
      autounselectify: true,
      wheelSensitivity: 0.25,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "#E2E8F0",
            "shape": "ellipse",
            "text-valign": "bottom",
            "text-halign": "center",
            "text-margin-y": 8,
            "font-size": "10px",
            "font-weight": "normal", // PLAIN TEXT (NOT BOLD)
            color: "#000000", // PLAIN BLACK COLOR
            "text-outline-width": 0, // REMOVE OUTLINE
            width: "data(size)",
            height: "data(size)",
            "transition-property": "background-color, line-color, target-arrow-color, width, height, opacity",
            "transition-duration": 0.3
          }
        },
        {
          selector: 'node[type="user"]',
          style: { 
            'background-color': '#BFDBFE', // Soft Pastel Blue
            'border-width': 4, 
            'border-color': '#3B82F6',
            "shadow-blur": 20,
            "shadow-color": "#BFDBFE",
            "shadow-opacity": 0.6,
            "font-size": "12px"
          } 
        },
        {
          selector: 'node[type="email"]',
          style: { 
            'background-color': '#A7F3D0', // Soft Pastel Emerald
            "shadow-blur": 15, 
            "shadow-color": "#A7F3D0" 
          } 
        },
        {
          selector: 'node[type="username"][confidence="verified"]',
          style: { 
            'background-color': '#A7F3D0', // Soft Pastel Emerald
            "shadow-blur": 15, 
            "shadow-color": "#A7F3D0",
            "border-width": 3,
            "border-color": "#10B981"
          } 
        },
        {
          selector: 'node[type="username"][confidence="predicted"]',
          style: { 
            'background-color': '#DDD6FE', // Soft Pastel Lavender
            "shadow-blur": 10, 
            "shadow-color": "#DDD6FE",
            "opacity": 0.95
          } 
        },
        {
          selector: 'node[type="account"], node[type="platform"]',
          style: { 
            'background-color': '#FDE68A', // Soft Pastel Gold
            "shadow-blur": 15,
            "shadow-color": "#FDE68A"
          } 
        },
        {
          selector: 'node[type="breach"]',
          style: {
            "background-color": "#FECDD3", // Soft Pastel Salmon
            "shadow-color": "#FECDD3",
            "shadow-blur": 20,
            "shadow-opacity": 0.6
          } 
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#CBD5E1", 
            "target-arrow-color": "#CBD5E1",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier", 
            "label": "data(label)",
            "font-size": "9px",
            "color": "#64748B",
            "text-background-opacity": 1,
            "text-background-color": "#FFFFFF", 
            "text-background-padding": "3px",
            "text-rotation": "autorotate",
            "line-style": "dashed",
            "opacity": 0.6 
          }
        },
        {
          selector: 'edge[label="exposed in"]',
          style: { "line-color": "#FECDD3", "opacity": 1, "line-style": "solid", width: 2 }
        },
        {
          selector: 'edge[label="primary handle"], edge[label="owns"]',
          style: { "line-color": "#BFDBFE", "opacity": 1, "line-style": "solid", width: 3 }
        },
        {
          selector: 'node:selected, node:active, node:hover, node[is_clickable]',
          style: {
            "border-width": 5,
            "border-color": "#1E293B",
            "shadow-blur": 40,
            scale: 1.15,
            "opacity": 1,
            "cursor": "pointer"
          }
        }
      ],
      layout: {
        name: 'cose-bilkent',
        animate: true,
        fit: true,
        padding: 80,
        nodeRepulsion: 10000
      }
    });

    cy.on('tap', 'node', function(evt) {
        const node = evt.target;
        if (node.id() === 'user_root') return;

        if (node.data('type') === 'platform' && node.data('url')) {
            window.open(node.data('url'), '_blank');
            return;
        }

        if (node.data('type') === 'username' && onNodeClick) {
            const cleanUsername = node.data('label').replace(/^@/, '');
            onNodeClick(cleanUsername);
            return;
        }

        const children = node.outgoers('node'); 
        const hasChildren = children.length > 0;

        if (!hasChildren) {
            if (node.hasClass('leaf-dimmed')) {
                node.removeClass('leaf-dimmed');
                node.animate({ style: { opacity: 1 } }, { duration: 350 });
                node.connectedEdges().animate({ style: { opacity: 0.5 } }, { duration: 350 });
            } else {
                node.addClass('leaf-dimmed');
                node.animate({ style: { opacity: 0.2 } }, { duration: 350 });
                node.connectedEdges().animate({ style: { opacity: 0.1 } }, { duration: 350 });
            }
            return;
        }

        if (node.hasClass('collapsed')) {
            node.removeClass('collapsed');
            node.successors().show();
        } else {
            node.addClass('collapsed');
            node.successors().hide();
        }
    });

    cy.on('mouseover', 'node', function(evt){
        const node = evt.target;
        node.style('color', '#3b82f6');
    });

    cy.on('mouseout', 'node', function(evt){
        const node = evt.target;
        node.style('color', '#000000');
    });
    
    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [data, isFullscreen, onNodeClick]);

  return (
    <div className={`w-full bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-2xl transition-all duration-500 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : 'h-[800px] mt-2'}`}>
      
      {/* Light Mode Utility Hub */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-xl flex flex-wrap gap-4 justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/10 p-2.5 rounded-xl border border-blue-600/20">
             <Layers className={`w-5 h-5 text-blue-600 ${isComputing ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.25em] flex items-center gap-2">
              Identity Correlation Graph
              <span className={`w-2 h-2 rounded-full ${isComputing ? 'bg-amber-500 animate-ping' : 'bg-green-500 shadow-[0_0_8px_#10b981]'}`}></span>
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Relational Mapping Analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
            <button 
                onClick={() => cyRef.current.zoom(cyRef.current.zoom() * 1.2)}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
                title="Zoom In"
            ><ZoomIn className="w-4 h-4" /></button>
            <button 
                onClick={() => cyRef.current.zoom(cyRef.current.zoom() * 0.8)}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
                title="Zoom Out"
            ><ZoomOut className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-slate-200 mx-1 my-auto"></div>
            <button 
                onClick={() => runLayout('cose-bilkent')}
                className={`p-2 hover:bg-slate-50 rounded-lg text-blue-600 transition-all ${isComputing ? 'animate-spin' : ''}`}
                title="Optimize Structure (Bilkent Cose)"
            ><RefreshCw className="w-4 h-4" /></button>
          </div>

          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-all shadow-md flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* Light Mode Visual Topology Key */}
      <div className="absolute top-24 right-8 z-10 p-5 bg-white/90 backdrop-blur-md rounded-[1.5rem] border border-slate-200 space-y-3 shadow-xl pointer-events-none">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 border-b border-slate-100 pb-2">Visual Topology Key</p>
          
          <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-[#BFDBFE] rounded-full border-2 border-[#3B82F6] shadow-sm"></div>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">Identity Root</span>
          </div>

          <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-[#A7F3D0] rounded-full border-2 border-[#10B981] shadow-sm"></div>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">Verified Handle</span>
          </div>

          <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-[#DDD6FE] rounded-full border border-purple-300 shadow-sm"></div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Predicted Alias</span>
          </div>

          <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-[#FDE68A] rounded-full border border-amber-300 shadow-sm"></div>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">Active Profile</span>
          </div>

          <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-[#FECDD3] rounded-full border border-rose-300 shadow-sm"></div>
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest whitespace-nowrap">Exposure Point</span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[9px] font-mono text-slate-400 italic">Interactive: Discovery Tree Mapping</p>
          </div>
      </div>

      <div 
        ref={containerRef} 
        className="flex-1 w-full bg-white relative"
        style={{ backgroundImage: 'radial-gradient(rgba(148,163,184,0.1) 1px, transparent 1px)', backgroundSize: '25px 25px' }}
      >
          {isComputing && (
              <div className="absolute bottom-8 right-8 z-30 px-6 py-3 bg-white/90 border border-slate-200 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-3 shadow-lg backdrop-blur-xl">
                  <RefreshCw className="w-4 h-4 animate-spin" /> 
                  Optimizing Topology...
              </div>
          )}
      </div>
    </div>
  );
};

export default IdentityGraph;
