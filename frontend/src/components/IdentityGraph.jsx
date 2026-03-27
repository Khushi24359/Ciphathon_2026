import React, { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { Maximize2, Minimize2, RefreshCw, Layers, ZoomIn, ZoomOut } from 'lucide-react';

// Register advanced layout
cytoscape.use(coseBilkent);

const IdentityGraph = ({ data }) => {
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
            "background-color": "#334155",
            "text-valign": "bottom",
            "text-halign": "center",
            "text-margin-y": 8,
            "font-size": "10px",
            "font-weight": "bold",
            color: "#94a3b8",
            "text-outline-width": 2,
            "text-outline-color": "#030712",
            width: "data(size)",
            height: "data(size)",
            "transition-property": "background-color, line-color, target-arrow-color, width, height, opacity",
            "transition-duration": 0.3
          }
        },
        {
          selector: 'node[type="user"]',
          style: { 
            'background-color': '#2563eb', 
            'shape': 'star', 
            'border-width': 4, 
            'border-color': '#60a5fa',
            "shadow-blur": 30,
            "shadow-color": "#2563eb",
            "shadow-opacity": 0.7,
            color: "#fff",
            "font-size": "12px"
          } 
        },
        {
          selector: 'node[type="email"]',
          style: { 
            'background-color': '#10b981', 
            'shape': 'round-rectangle', 
            "shadow-blur": 15, 
            "shadow-color": "#10b981" 
          } 
        },
        {
          selector: 'node[type="username"]',
          style: { 
            'background-color': '#8b5cf6', 
            'shape': 'rectangle', 
            "shadow-blur": 10, 
            "shadow-color": "#8b5cf6" 
          } 
        },
        {
          selector: 'node[type="account"]',
          style: { 
            'background-color': '#f59e0b', 
            'shape': 'ellipse' 
          } 
        },
        {
          selector: 'node[type="breach"]',
          style: {
            "background-color": "#ef4444",
            "shape": "octagon",
            "shadow-color": "#ef4444",
            "shadow-blur": 25,
            "shadow-opacity": 0.6
          } 
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#334155",
            "target-arrow-color": "#334155",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier", // Requirements: Curved edges
            "label": "data(label)",
            "font-size": "8px",
            "color": "#64748b",
            "text-background-opacity": 0.8,
            "text-background-color": "#030712",
            "text-background-padding": "2px",
            "text-rotation": "autorotate",
            "line-style": "dashed",
            "opacity": 0.5 
          }
        },
        {
          selector: 'edge[label="exposed in"]',
          style: { "line-color": "#ef4444", "opacity": 0.7, "line-style": "solid" }
        },
        {
          selector: 'edge[label="primary handle"], edge[label="owns"]',
          style: { "line-color": "#2563eb", "opacity": 0.8, "line-style": "solid", width: 3 }
        },
        // Requirements: Hover & Detail Effects
        {
          selector: 'node:selected, node:active, node:hover',
          style: {
            "border-width": 4,
            "border-color": "#fff",
            "shadow-blur": 50,
            scale: 1.1,
            "opacity": 1
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

    // Smarter expand/collapse:
    //   - Leaf nodes (no children) → only fade themselves, NEVER touch parent
    //   - Parent nodes → collapse/expand their own descendants only
    cy.on('tap', 'node', function(evt) {
        const node = evt.target;
        if (node.id() === 'user_root') return;

        const children = node.outgoers('node'); // nodes this node points TO
        const hasChildren = children.length > 0;

        if (!hasChildren) {
            // True leaf: just dim/restore this single node
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

        // Parent node: collapse/expand its entire descendant subtree
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
        node.style('text-outline-color', '#2563eb');
        node.style('color', '#fff');
    });

    cy.on('mouseout', 'node', function(evt){
        const node = evt.target;
        node.style('text-outline-color', '#030712');
        node.style('color', '#94a3b8');
    });
    
    cyRef.current = cy;

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [data, isFullscreen]);

  return (
    <div className={`w-full bg-slate-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : 'h-[750px] mt-2'}`}>
      
      {/* Dynamic Graph Utility Hub */}
      <div className="p-5 border-b border-white/5 bg-black/40 backdrop-blur-xl flex flex-wrap gap-4 justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2.5 rounded-xl border border-blue-500/30">
             <Layers className={`w-5 h-5 text-blue-400 ${isComputing ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-2">
              Identity Correlation Graph
              <span className={`w-2 h-2 rounded-full ${isComputing ? 'bg-amber-500 animate-ping' : 'bg-green-500 shadow-[0_0_8px_#10b981]'}`}></span>
            </h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Relational Mapping Analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
            <button 
                onClick={() => cyRef.current.zoom(cyRef.current.zoom() * 1.2)}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
                title="Zoom In"
            ><ZoomIn className="w-4 h-4" /></button>
            <button 
                onClick={() => cyRef.current.zoom(cyRef.current.zoom() * 0.8)}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors"
                title="Zoom Out"
            ><ZoomOut className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-white/10 mx-1 my-auto"></div>
            <button 
                onClick={() => runLayout('cose-bilkent')}
                className={`p-2 hover:bg-white/5 rounded-lg text-blue-400 transition-all ${isComputing ? 'animate-spin' : ''}`}
                title="Optimize Structure (Bilkent Cose)"
            ><RefreshCw className="w-4 h-4" /></button>
          </div>

          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all shadow-lg flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* Graph Legend */}
      <div className="absolute top-24 left-8 z-10 pointer-events-none space-y-2 opacity-60">
         <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Root Center
         </div>
         <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Verified Channels
         </div>
         <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Exposure Nodes
         </div>
         <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-[10px] font-mono text-slate-500 italic">TIP: Click nodes to expand/collapse clusters</p>
         </div>
      </div>

      {/* Main Render Area */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full bg-[#030712] relative"
        style={{ backgroundImage: 'radial-gradient(rgba(99,102,241,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      >
          {isComputing && (
              <div className="absolute bottom-8 right-8 z-30 px-6 py-3 bg-black/80 border border-blue-500/30 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-3 shadow-2xl backdrop-blur-xl">
                  <RefreshCw className="w-4 h-4 animate-spin" /> 
                  Optimizing Topology...
              </div>
          )}
      </div>
    </div>
  );
};

export default IdentityGraph;
