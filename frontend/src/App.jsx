import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, Mail, User, Phone, AlertTriangle, Key, Search, Activity, Link2, Shield, ChevronRight, Fingerprint, Zap, FileDown, History, X, Target, BarChart3, PieChart as PieIcon } from 'lucide-react';
import IdentityGraph from './components/IdentityGraph';
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TypeAnimation } from 'react-type-animation';
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// WOW 🔥 Animated Risk Gauge
const RiskGauge = ({ score, level }) => {
  const getNeonColor = (lvl) => {
    if (lvl === 'High') return "#FF3B3B";
    if (lvl === 'Medium') return "#FFC857";
    return "#00FFC6";
  };
  
  const color = getNeonColor(level);

  return (
    <div className="w-32 h-32 md:w-40 md:h-40 relative group">
      <div className="absolute inset-0 bg-neon/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <CircularProgressbar
        value={score}
        text={`${score}`}
        styles={buildStyles({
          pathColor: color,
          textColor: color,
          trailColor: "rgba(255,255,255,0.05)",
          textSize: "24px",
          pathTransitionDuration: 1.5,
        })}
      />
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-white/50 backdrop-blur-md whitespace-nowrap">
        Criticality Index
      </div>
    </div>
  );
};

const getRiskColor = (score) => {
  if (score > 70) return "text-danger";
  if (score > 40) return "text-warning";
  return "text-neon";
};

const ThreatVisual = ({ score }) => {
  const getFilter = (s) => {
    if (s > 70) return "hue-rotate-[320deg] saturate-200 brightness-75"; // Redish
    if (s > 40) return "hue-rotate-[60deg] saturate-150"; // Yellowish
    return "hue-rotate-0"; // Greenish-blue (original)
  };
  
  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 group h-48">
       <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
       <div className="absolute inset-0 z-10 pointer-events-none animate-scanline bg-gradient-to-b from-transparent via-neon/10 to-transparent h-20 -top-20"></div>
       <img 
        src="/images/threat-visual.png" 
        className={`w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ${getFilter(score)}`} 
        alt="Threat Matrix"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bgDark via-bgDark/40 to-transparent z-10"></div>
      <div className="absolute bottom-4 left-6 z-20">
        <h4 className="text-xl font-black text-white uppercase tracking-tighter">Surface Visualizer</h4>
        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Active Footprint Capture</p>
      </div>
    </div>
  );
};

const AIInsight = ({ score, breachCount }) => (
  <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
       <Shield className="w-16 h-16 text-neon" />
    </div>
    <h3 className="text-xs font-black text-neon mb-3 flex items-center gap-2 uppercase tracking-widest">
       <Zap className="w-3 h-3" /> AI Risk Synthesis
    </h3>
    <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
      "Based on correlating {breachCount} data breaches and account patterns, our intelligence engine identifies a score of {score}. 
      High risk due to repeated username mapping and breach exposure. Immediate rotation of primary authentication vectors is critical."
    </p>
  </div>
);

const RiskBreakdown = ({ accountsCount, breachCount }) => {
  const data = [
    { name: "Breaches", value: breachCount * 20, color: "#FF3B3B" },
    { name: "Accounts", value: accountsCount * 15, color: "#FFC857" },
    { name: "Public OSINT", value: 30, color: "#00FFC6" }
  ];

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={45}
            outerRadius={65}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", fontSize: "10px" }}
            itemStyle={{ color: "#fff" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

function App() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/history');
      setHistory(res.data);
    } catch(e) {
      console.log("DB might not be initialized yet");
    }
  };

  const loadHistoricalTarget = async (id) => {
    try {
      setLoading(true);
      setShowHistory(false);
      const res = await axios.get(`http://127.0.0.1:8000/history/${id}`);
      setResult(res.data);
    } catch(e) {
      setError("Failed to load historical profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required to launch intelligence trace.');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://127.0.0.1:8000/scan', {
        email,
        username: username || null,
        phone: phone || null
      });
      setResult(response.data);
      fetchHistory(); // Update local trace log
    } catch (err) {
      setError('Failed to connect to the PersonaTrace intelligence engine. Ensure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    // html2canvas struggles with rendering Cytoscape physics graphs correctly.
    // Instead we trigger the flawless native Operating System PDF render engine.
    window.print();
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]';
      case 'Medium': return 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      case 'Low': return 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]';
      default: return 'text-slate-500';
    }
  };
  
  const getRiskBg = (level) => {
    switch (level) {
      case 'High': return 'from-rose-500/20 to-transparent border-rose-500/30';
      case 'Medium': return 'from-amber-500/20 to-transparent border-amber-500/30';
      case 'Low': return 'from-emerald-500/20 to-transparent border-emerald-500/30';
      default: return 'from-slate-500/20 to-transparent border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-bgDark text-slate-200 font-sans selection:bg-neon/30 relative overflow-hidden">
      
      {/* 🌌 High Impact Particle Field & Cyber Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none"></div>
      
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0 -z-10"
        options={{
          fullScreen: { enable: false },
          particles: {
            number: { value: 40, density: { enable: true, area: 800 } },
            color: { value: ["#00FFC6", "#6366f1", "#f43f5e"] },
            opacity: { value: 0.3 },
            size: { value: { min: 1, max: 2 } },
            move: { 
              enable: true, 
              speed: 1, 
              direction: "none", 
              random: true, 
              straight: false, 
              outModes: { default: "out" } 
            },
            links: { 
              enable: true, 
              distance: 150, 
              color: "#00FFC6", 
              opacity: 0.1, 
              width: 1 
            }
          },
          interactivity: {
            events: { onHover: { enable: true, mode: "grab" } },
            modes: { grab: { distance: 200, links: { opacity: 0.4 } } }
          }
        }}
      />

      <div className="absolute inset-0 -z-20 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      {/* Header */}
      <header className="print:hidden border-b border-white/5 bg-black/40 flex items-center justify-between px-8 py-5 sticky top-0 z-30 backdrop-blur-xl">
        <div className="flex items-center gap-4 relative">
          <div className="absolute left-[-16px] top-0 bottom-0 flex flex-col justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse outline outline-4 outline-neon/20"></div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Fingerprint className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">PersonaTrace<span className="text-neon">.</span></h1>
            <p className="text-[10px] text-neon font-bold uppercase tracking-[0.3em]">Exposure Intelligence Engine</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-2 transition-all text-sm font-bold hover:border-violet-500/50"
          >
            <History className="w-4 h-4 text-violet-400" /> Database Logs
          </button>
          
          {result && (
            <button 
              onClick={exportPDF}
              className="px-4 py-2 rounded-xl bg-neon text-black hover:bg-white flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,255,198,0.4)] text-sm font-black"
            >
              <FileDown className="w-4 h-4" /> Export Report
            </button>
          )}
        </div>
      </header>
      
      {/* History Drawer Overlay */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex print:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
          <div className="relative w-full max-w-sm h-full bg-slate-950 border-r border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" /> Target Database
              </h2>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-white/10 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                 <p className="text-slate-500 text-center text-sm mt-10">No targets tracked yet.</p>
              ) : (
                history.map((log) => (
                  <button 
                    key={log.id} 
                    onClick={() => { setEmail(log.email); loadHistoricalTarget(log.id); }}
                    className="w-full text-left p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-200 truncate pr-2">{log.email}</span>
                      <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${
                        log.risk_level === 'High' ? 'bg-rose-500/20 text-rose-400' :
                        log.risk_level === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>{log.risk_level}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col items-center relative z-10" id="threat-report">
        
        {/* Intro */}
        {!result && !loading && (
          <div className="max-w-4xl text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 mb-6">
              <Zap className="w-3 h-3 text-amber-500" /> Live OSINT Tracking Array
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              Analyze Your Digital <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Threat Surface Area
              </span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed">
              PersonaTrace simulates real-world attacker reconnaissance by correlating identity fragments across the open web and known breach databases.
            </p>
          </div>
        )}

        {/* 🛡️ Unified Collective Identity Probe Console */}
        <div className={`print:hidden w-full max-w-5xl transition-all duration-700 ${result || loading ? 'mb-8 scale-[0.98]' : 'mb-16'}`}>
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-1 md:p-1.5 rounded-[2.5rem] shadow-2xl relative">
            
            {/* Animated Indicator for Collective Search */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] z-20 flex items-center gap-2">
               <Activity className="w-3 h-3 animate-pulse" /> Collective Correlation Active
            </div>

            <form onSubmit={handleScan} className="grid grid-cols-1 md:grid-cols-12 gap-2 relative z-10">
              <div className="md:col-span-5 relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-indigo-400 group-focus-within:text-neon transition-colors" />
                </div>
                <input 
                  type="email" 
                  placeholder="Primary Email Identity *" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 text-white placeholder-slate-500 rounded-[2rem] pl-14 pr-6 py-5 focus:outline-none focus:ring-2 focus:ring-neon/30 focus:border-neon/30 transition-all font-medium"
                />
              </div>

              {/* Visual "Link" Connector */}
              <div className="hidden md:flex md:col-span-1 items-center justify-center">
                 <div className="w-full h-[2px] bg-gradient-to-r from-indigo-500/20 to-violet-500/20"></div>
                 <Link2 className="w-4 h-4 text-white/20 shrink-0" />
                 <div className="w-full h-[2px] bg-gradient-to-r from-violet-500/20 to-indigo-500/20"></div>
              </div>

              <div className="md:col-span-4 relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Fingerprint className="w-5 h-5 text-violet-400 group-focus-within:text-neon transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="Associated Username (Optional)" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 text-white placeholder-slate-500 rounded-[2rem] pl-14 pr-6 py-5 focus:outline-none focus:ring-2 focus:ring-neon/30 focus:border-neon/30 transition-all font-medium"
                />
              </div>

              <div className="md:col-span-2 p-1">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-full bg-white text-black hover:bg-neon hover:text-black font-black uppercase text-xs tracking-widest rounded-[1.8rem] transition-all duration-500 shadow-xl flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                      <span>Launch Trace</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Secondary Options */}
          <div className="mt-4 px-6 flex flex-wrap gap-6 justify-center text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                Cross-Platform Mapping
             </div>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
                Breach Hash Correlation
             </div>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]"></div>
                OSINT Pattern Search
             </div>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-danger/10 border border-danger/20 rounded-2xl text-center">
              <p className="text-danger text-sm font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}
        </div>

        {/* 🎬 SUPER IMPORTANT: Cyber Intelligence Loading */}
        {loading && (
          <div className="w-full max-w-4xl flex flex-col items-center py-20 animate-in fade-in duration-500">
            <div className="mb-8 p-12 bg-white/5 backdrop-blur-2xl rounded-full border border-neon/20 shadow-[0_0_50px_rgba(0,255,198,0.1)] relative">
               <Shield className="w-16 h-16 text-neon animate-pulse" />
               <div className="absolute inset-0 border-2 border-neon/30 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="bg-black/40 border border-white/10 p-4 rounded-xl min-w-[300px] text-center shadow-inner">
              <TypeAnimation
                sequence={[
                  'INITIALIZING SECURE ENCLAVE...',
                  1000,
                  'QUERYING BREACH INTELLIGENCE NODES...',
                  1000,
                  'CORRELATING IDENTITY FRAGMENTS...',
                  1000,
                  'CONSTRUCTING ATTACK GRAPH...',
                  1000,
                  'SYNTHESIZING AI RISK INSIGHTS...',
                  1000,
                ]}
                wrapper="span"
                speed={50}
                className="text-neon font-mono text-sm uppercase tracking-widest"
                repeat={Infinity}
              />
            </div>
          </div>
        )}

        {/* 🚀 CYBER INTELLIGENCE DASHBOARD CONTENT */}
        {result && !loading && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Print Only Executive Summary Header */}
            <div className="hidden print:block border-b-4 border-slate-900 pb-6 mb-8 pt-4">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2">TARGET EXPOSURE REPORT</h1>
                  <p className="font-mono text-sm font-bold text-indigo-700">CONFIDENTIAL INTEL OVERVIEW | PERSONATRACE SECURE ENCLAVE</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-bold italic text-xs uppercase tracking-widest mb-1">Authenticated Intelligence Cluster</p>
                  <p className="text-slate-700 font-bold">Target Instance: <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{email}</span></p>
                  <p className="text-slate-500 font-bold text-[10px] mt-2 font-mono uppercase">Reference: PT-TRACE-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Correlation Engine Logic</p>
                  <p className="text-xs font-mono text-indigo-800">{result.correlation_engine?.mapping_logic || 'Heuristic Alias Matching'}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Mapping Confidence</p>
                   <p className="text-xl font-black text-slate-900">{result.correlation_engine?.mapping_confidence.toFixed(1)}%</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Legal Notice: This document contains sensitive OSINT data correlated via PersonaTrace. Unauthorized distribution is prohibited.</p>
              </div>
            </div>
            
            {/* Top Stat row: WOW Elements */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
              
              {/* ⚡ Animated Risk Score Card */}
              <div className="col-span-1 md:col-span-6 lg:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:shadow-neon/20 transition-all flex flex-col items-center justify-center text-center">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-neon/10 blur-[60px] rounded-full group-hover:bg-neon/20 transition-all"></div>
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6">Threat Criticality</h3>
                <RiskGauge score={result.risk_score} level={result.risk_level} />
                <div className={`mt-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 ${getRiskColor(result.risk_score)}`}>
                   {result.risk_level} THREAT ZONE
                </div>
              </div>

              {/* 🧠 AI Insight Panel */}
              <div className="col-span-1 md:col-span-6 lg:col-span-6 flex flex-col gap-6">
                 <AIInsight score={result.risk_score} breachCount={result.breach_status ? result.breach_details.length : 0} />
                 <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-danger/30 transition-colors flex items-center gap-4 group">
                       <div className="p-3 bg-danger/10 rounded-xl text-danger group-hover:scale-110 transition-transform"><ShieldAlert className="w-6 h-6" /></div>
                       <div>
                         <p className="text-white font-black text-xl">{result.breach_status ? result.breach_details.length : 0}</p>
                         <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">Breach Vectors</p>
                       </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-violet-500/30 transition-colors flex items-center gap-4 group">
                       <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400 group-hover:scale-110 transition-transform"><Link2 className="w-6 h-6" /></div>
                       <div>
                         <p className="text-white font-black text-xl">{result.simulated_accounts.length}</p>
                         <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">Surface Nodes</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* 📊 Industry Standard Chart */}
              <div className="col-span-1 md:col-span-12 lg:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                 <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                    <PieIcon className="w-3 h-3 text-neon" /> Exposure Vectors
                 </h3>
                 <RiskBreakdown accountsCount={result.simulated_accounts.length} breachCount={result.breach_status ? result.breach_details.length : 0} />
                 <div className="mt-2 space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                      <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-danger"></span> Breaches</span>
                      <span>High Impact</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                      <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-warning"></span> Profiles</span>
                      <span>OSINT Trace</span>
                    </div>
                 </div>
              </div>

            </div>

            {/* ⚙️ Identity Correlation Engine Panel (Matches Architecture Flow) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
               <div className="col-span-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 flex items-center gap-4">
                     <Fingerprint className="w-24 h-24" />
                     <Activity className="w-24 h-24" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                     <div className="text-center md:text-left">
                        <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                           <div className="w-2.5 h-2.5 rounded-full bg-neon animate-pulse"></div>
                           <h2 className="text-xl font-black text-white uppercase tracking-tighter">Identity Correlation Engine</h2>
                        </div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-6">Phase 3: Fragment Matching & Linking Logic</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                           <div>
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Engine Status</p>
                              <p className="text-xs font-black text-neon">OPERATIONAL</p>
                           </div>
                           <div>
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Source Reliability</p>
                              <p className="text-xs font-black text-white">{result.correlation_engine?.reliability_index || 'High'}</p>
                           </div>
                           <div className="md:col-span-2">
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Mapping Logic</p>
                              <p className="text-xs font-mono text-slate-300 truncate max-w-[300px]">{result.correlation_engine?.mapping_logic || 'Heuristic Alias Mapping'}</p>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 w-full max-w-md">
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Correlation Confidence</span>
                           <span className="text-2xl font-black text-neon">{result.correlation_engine?.mapping_confidence.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                           <div 
                              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-neon transition-all duration-1000 ease-out"
                              style={{ width: `${result.correlation_engine?.mapping_confidence || 0}%` }}
                           ></div>
                        </div>
                        <p className="mt-3 text-[9px] text-slate-500 font-medium italic">
                           * Deterministic verification based on {result.correlation_engine?.fragments_matched || 0} discovered identity fragments.
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Middle Dashboard Layer: Visuals & Intelligence */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6 print:block">
              
              {/* Intelligence Stream (Left Col) */}
              <div className="xl:col-span-4 space-y-6 flex flex-col h-full print:block">
                 
                 {/* 🎯 Threat Visual Panel */}
                 <div className="print:hidden">
                    <ThreatVisual score={result.risk_score} />
                 </div>

                 {/* 🧠 Live Simulation Terminal Style */}
                 <div className="print:hidden bg-black/60 backdrop-blur-3xl border border-neon/20 rounded-3xl p-6 shadow-[0_0_30px_rgba(0,255,198,0.05)] relative overflow-hidden h-[300px] flex flex-col font-mono group">
                  <div className="flex gap-1.5 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-danger/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-neon/50"></div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <TypeAnimation
                      sequence={[
                        `ACCESSING PERSONATRACE CORE...\nTARGET: ${result.email}\nENCRYPTING CONNECTION...\n${result.attack_narrative ? result.attack_narrative.join('\n\n') : 'No narrative available'}`,
                        500
                      ]}
                      wrapper="div"
                      speed={70}
                      className="text-white/80 text-xs leading-relaxed whitespace-pre-wrap"
                      cursor={true}
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-bold text-neon/40 uppercase tracking-widest">
                    <span>Active Probe Status: STABLE</span>
                    <Activity className="w-3 h-3 animate-pulse" />
                  </div>
                </div>

                 {/* 🕵️ What Attacker Sees Section */}
                 <div className="print:hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 group hover:border-danger/30 transition-colors">
                    <h3 className="text-xs font-black text-danger mb-4 flex items-center gap-2 uppercase tracking-widest">
                       <Target className="w-4 h-4" /> Adversary Viewpoint
                    </h3>
                    <img src="/images/attacker-view.png" className="w-full h-32 object-cover rounded-xl border border-white/5 mb-4 grayscale hover:grayscale-0 transition-all duration-700" alt="Attacker View" />
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                       "Your digital fragmentation enables targeted reconnaissance. Attackers leverage your correlated web profile to craft precision phishing campaigns."
                    </p>
                 </div>
              </div>

              {/* 🌌 High-Impact Graph Section (Right Col) */}
              <div className="xl:col-span-8 flex flex-col print:hidden gap-6">
                 
                  {/* Graph with Cyber Background */}
                  <div className="bg-[url('/images/grid-bg.png')] bg-cover bg-center rounded-3xl border border-white/10 p-1 relative group overflow-hidden h-[600px]">
                      <div className="absolute inset-0 bg-bgDark/40 backdrop-blur-[1px]"></div>
                      <div className="absolute top-6 left-6 z-20 pointer-events-none">
                         <div className="bg-black/60 backdrop-blur-md border border-neon/30 px-4 py-2 rounded-xl">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                               <BarChart3 className="w-3 h-3 text-neon" /> Live Topology Mapping
                            </h4>
                         </div>
                      </div>
                      <div className="w-full h-full relative z-10">
                        {result.graph_data && <IdentityGraph data={result.graph_data} />}
                      </div>
                  </div>

                  {/* 🧬 Attack Flow Story (Visual Diagram) */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row gap-8 items-center group">
                      <div className="flex-1">
                        <h3 className="text-xs font-black text-neon mb-4 uppercase tracking-widest">Simulated Attack Cascade</h3>
                        <div className="flex items-center gap-4 text-white/80 font-mono text-[10px] md:text-sm">
                           <span className="p-2 bg-white/5 rounded-lg border border-white/10">EMAIL</span>
                           <ChevronRight className="w-4 h-4 text-neon" />
                           <span className="p-2 bg-danger/10 rounded-lg border border-danger/20 text-danger">BREACH</span>
                           <ChevronRight className="w-4 h-4 text-neon" />
                           <span className="p-2 bg-warning/10 rounded-lg border border-warning/20 text-warning">BYPASS</span>
                           <ChevronRight className="w-4 h-4 text-neon" />
                           <span className="p-3 bg-neon/10 rounded-lg border border-neon/30 text-neon font-black shadow-[0_0_15px_rgba(0,255,198,0.2)]">TAKEOVER</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-6 leading-relaxed">
                           Our simulation tracks how an initial email compromise propagates through historical breaches to eventually bypass 2FA via SIM-swapping or session hijacking.
                        </p>
                      </div>
                      <div className="w-full md:w-48 overflow-hidden rounded-2xl border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-700">
                         <img src="/images/attack-flow.png" className="w-full h-full object-cover" alt="Attack Flow" />
                      </div>
                  </div>
              </div>

            </div>

            {/* 🎥 Final Polish: Breach Detail Expansion & Strategic Recovery */}
            <div className="w-full">
              {/* 🛡️ Remediation & Strategic Recovery Section */}
              <div className="col-span-1 md:col-span-12 mt-8 print:mt-4">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 relative overflow-hidden group print:bg-white print:text-slate-900 print:shadow-none print:border-slate-200">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none print:hidden">
                    <ShieldCheck className="w-96 h-96 text-neon" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                      <div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3 print:text-slate-900">
                          <ShieldCheck className="w-8 h-8 text-neon" /> Strategic Remediation
                        </h2>
                        <p className="text-slate-400 font-medium max-w-xl print:text-slate-600">
                          PersonaTrace has synthesized a custom recovery protocol based on your specific exposure vectors. Follow these prioritized steps to harden your digital perimeter.
                        </p>
                      </div>
                      <div className="px-6 py-2 bg-neon/10 border border-neon/20 rounded-full print:border-slate-300">
                        <span className="text-neon text-xs font-black uppercase tracking-[0.2em] print:text-slate-900">Priority: Immediate Action Required</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {result.recommendations.map((rec, i) => (
                        <div key={i} className="bg-black/40 border border-white/10 p-6 rounded-2xl hover:border-neon/30 transition-all group/card relative overflow-hidden print:bg-slate-50 print:border-slate-200">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-neon/5 rounded-bl-3xl translate-x-1/2 -translate-y-1/2 transition-transform group-hover/card:scale-150 print:hidden"></div>
                          <div className="w-10 h-10 bg-neon/10 rounded-xl flex items-center justify-center mb-4 text-neon font-black print:bg-slate-200 print:text-slate-900">
                            {i + 1}
                          </div>
                          <p className="text-sm font-bold text-slate-200 leading-relaxed mb-4 print:text-slate-800">{rec}</p>
                        </div>
                      ))}
                    </div>

                    {/* Proactive Security Roadmap */}
                    <div className="mt-12 bg-white/[0.02] border border-white/5 rounded-3xl p-8 print:bg-slate-100 print:border-slate-200">
                       <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 text-center print:text-slate-900">90-Day Security Roadmap</h3>
                       <div className="relative">
                          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2 hidden md:block print:bg-slate-300"></div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                             {[
                               { t: "Phase 1: Lockdown", d: "Credential rotation & MFA enforcement.", c: "bg-danger/20 text-danger", i: Key },
                               { t: "Phase 2: Data Cleanup", d: "Account deletion & privacy hardening.", c: "bg-warning/20 text-warning", i: User },
                               { t: "Phase 3: Monitoring", d: "ID theft protection & credit monitoring.", c: "bg-violet-500/20 text-violet-400", i: Activity },
                               { t: "Phase 4: Resilience", d: "Operational security audits & training.", c: "bg-neon/20 text-neon", i: ShieldCheck }
                             ].map((phase, i) => (
                               <div key={i} className="text-center group/phase">
                                  <div className={`w-14 h-14 ${phase.c} rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/10 print:bg-white print:border-slate-300`}>
                                     <phase.i className="w-6 h-6 print:text-slate-900" />
                                  </div>
                                  <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2 print:text-slate-900">{phase.t}</h4>
                                  <p className="text-[10px] text-slate-500 font-bold print:text-slate-600">{phase.d}</p>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📑 Detailed Intelligence Findings (The "Report Content") */}
              <div className="mt-12 mb-20 bg-black/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-inner print:mt-10 print:bg-white print:border-slate-300 print:text-slate-900">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-white/10 pb-12 mb-12 print:border-slate-200">
                  <div className="max-w-2xl">
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase print:text-slate-900">Intelligence Inventory</h2>
                    <p className="text-lg text-slate-400 font-medium print:text-slate-600">
                      A granular breakdown of all identity fragments, breach intersections, detected profiles that strictly correlate to the target identity cluster.
                    </p>
                  </div>
                  <div className="flex gap-4 print:hidden">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center min-w-[140px]">
                       <p className="text-3xl font-black text-white mb-1">{result.breach_details.length}</p>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Breaches</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   
                   {/* Col 1: Breach Details */}
                   <div className="print:col-span-2">
                     <div className="flex items-center gap-3 mb-8">
                       <ShieldAlert className="w-6 h-6 text-danger" /> 
                       <h3 className="text-lg font-black text-white uppercase tracking-widest print:text-slate-900">Data Breach Registry</h3>
                     </div>
                     <div className="space-y-4">
                        {result.breach_status ? result.breach_details.map((breach, idx) => (
                          <div key={idx} className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl border-l-4 border-l-danger print:bg-slate-50 print:border-slate-200">
                             <div className="flex justify-between items-start mb-3">
                               <h4 className="font-black text-white text-lg print:text-slate-900">{breach.Name}</h4>
                               <span className="text-[10px] font-black uppercase text-danger bg-danger/10 px-3 py-1 rounded-full print:border print:border-danger/30">{breach.BreachDate}</span>
                             </div>
                             <p className="text-xs text-slate-400 mb-4 leading-relaxed font-medium print:text-slate-700">{breach.Description}</p>
                             <div className="flex flex-wrap gap-2">
                               {breach.DataClasses.map((dc, i) => (
                                 <span key={i} className="text-[9px] font-bold text-slate-500 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 print:bg-slate-200 print:text-slate-800">{dc}</span>
                               ))}
                             </div>
                          </div>
                        )) : (
                          <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/10 border-dashed">
                             <ShieldCheck className="w-12 h-12 text-neon mx-auto mb-4 opacity-50" />
                             <p className="text-slate-400 font-bold uppercase tracking-widest">No major breaches indexed for this target.</p>
                          </div>
                        )}
                     </div>
                   </div>

                   {/* Col 2: Correlated Profiles */}
                   <div className="print:col-span-2">
                     <div className="flex items-center gap-3 mb-8">
                       <Fingerprint className="w-6 h-6 text-violet-400" /> 
                       <h3 className="text-lg font-black text-white uppercase tracking-widest print:text-slate-900">Digital Footprint Cluster</h3>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {result.simulated_accounts.length > 0 ? result.simulated_accounts.map((acc, idx) => (
                          <a 
                            key={idx} 
                            href={acc.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white/[0.02] border border-white/10 p-5 rounded-2xl flex items-center gap-4 group hover:border-violet-500/50 hover:bg-violet-500/5 transition-all print:p-4 print:border-slate-200"
                          >
                             <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400 group-hover:scale-110 transition-transform print:bg-slate-200 print:text-slate-900">
                               <User className="w-5 h-5" />
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 mb-0.5">
                                 <h4 className="font-bold text-white text-sm print:text-slate-900">{acc.platform}</h4>
                                 {acc.confidence === 'High' && (
                                   <span className="text-[8px] font-black uppercase text-neon tracking-tighter shrink-0">Linked ✅</span>
                                 )}
                               </div>
                               <p className="text-[10px] text-slate-500 font-mono truncate">@{acc.username}</p>
                               <p className="text-[8px] text-indigo-400/50 font-black uppercase tracking-widest mt-1 group-hover:text-indigo-400 transition-colors">Trace: Unified with {email}</p>
                             </div>
                             <Link2 className="w-4 h-4 text-white/5 group-hover:text-white/40 ml-auto transition-colors print:hidden" />
                          </a>
                        )) : (
                          <div className="col-span-2 p-8 text-center bg-white/5 rounded-3xl border border-white/10 border-dashed">
                             <Search className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                             <p className="text-slate-400 font-bold uppercase tracking-widest">No linked profiles detected.</p>
                          </div>
                        )}
                     </div>

                     {/* Intelligence Insights Table */}
                     <div className="mt-8 bg-white/5 rounded-3xl p-6 border border-white/10 print:bg-slate-100 print:border-slate-300">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 print:text-slate-700">Attacker Insight Feed</h4>
                        <div className="space-y-3">
                           {result.attack_insights.map((insight, i) => (
                             <div key={i} className="flex gap-4 p-4 rounded-xl bg-black/40 border border-white/5 print:bg-white print:border-slate-200">
                                <div className="mt-1"><AlertTriangle className="w-4 h-4 text-warning" /></div>
                                <p className="text-xs text-slate-300 font-medium leading-relaxed print:text-slate-800">{insight}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                   </div>

                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default App;
