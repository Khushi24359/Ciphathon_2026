import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldAlert, ShieldCheck, Mail, User, AlertTriangle, Activity,
  Link2, Shield, ChevronRight, Fingerprint, Zap, X, Network, Crosshair,
  HeartPulse, CheckCircle2, Globe, LayoutDashboard, Sun, Moon,
  Play, Square, ChevronDown, BookOpen, TrendingUp, Lock, Eye,
  FileText, Download, Copy, Calendar, Info, Target, AlertCircle
} from 'lucide-react';
import IdentityGraph from '../components/IdentityGraph';
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { TypeAnimation } from 'react-type-animation';
import Navbar from '../components/Navbar';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const riskColor = (score) => {
  if (score >= 75) return { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', hex: '#ef4444', label: 'CRITICAL' };
  if (score >= 50) return { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', hex: '#f59e0b', label: 'HIGH' };
  if (score >= 25) return { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', hex: '#facc15', label: 'MEDIUM' };
  return { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', hex: '#10b981', label: 'LOW' };
};

// ─── MINI GRAPH PREVIEWS ──────────────────────────────────────────────────────
const MiniGraph = ({ step, dark }) => {
  const configs = [
    { nodes: [{ l: 'Email', x: 50, y: 50, c: '#6366f1' }, { l: 'OSINT', x: 80, y: 30, c: '#94a3b8' }, { l: 'Handle', x: 20, y: 30, c: '#94a3b8' }], edges: [[0, 1], [0, 2]] },
    { nodes: [{ l: 'Email', x: 50, y: 50, c: '#6366f1' }, { l: 'Breach A', x: 80, y: 30, c: '#ef4444' }, { l: 'Breach B', x: 20, y: 30, c: '#ef4444' }, { l: 'Hash', x: 50, y: 15, c: '#f59e0b' }], edges: [[0, 1], [0, 2], [1, 3]] },
    { nodes: [{ l: 'Email', x: 50, y: 50, c: '#6366f1' }, { l: 'Platform', x: 80, y: 30, c: '#ef4444' }, { l: 'Platform', x: 20, y: 30, c: '#ef4444' }, { l: 'Breach', x: 50, y: 10, c: '#f59e0b' }], edges: [[0, 1], [0, 2], [1, 3], [2, 3]] },
    { nodes: [{ l: 'Email', x: 50, y: 50, c: '#ef4444' }, { l: 'Account', x: 80, y: 25, c: '#ef4444' }, { l: 'Account', x: 20, y: 25, c: '#ef4444' }, { l: 'Data', x: 80, y: 70, c: '#f59e0b' }, { l: 'Data', x: 20, y: 70, c: '#f59e0b' }], edges: [[0, 1], [0, 2], [1, 3], [2, 4]] },
  ];
  const c = configs[step];
  const nodeR = 12;
  return (
    <svg viewBox="0 0 100 90" className="w-full h-full">
      {c.edges.map(([a, b], i) => (
        <line key={i} x1={c.nodes[a].x} y1={c.nodes[a].y} x2={c.nodes[b].x} y2={c.nodes[b].y}
          stroke={dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'} strokeWidth="1" />
      ))}
      {c.nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={nodeR} fill={n.c} fillOpacity="0.15" stroke={n.c} strokeWidth="1.5" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="7" fill={n.c} fontWeight="700">{n.l[0]}</text>
        </g>
      ))}
    </svg>
  );
};

// ─── RISK GAUGE COMPONENT ─────────────────────────────────────────────────────
const RiskGauge = ({ score, level }) => {
  const c = riskColor(score);
  return (
    <div className="w-36 h-36">
      <CircularProgressbar value={score} text={`${score}`}
        styles={buildStyles({ pathColor: c.hex, textColor: c.hex, trailColor: 'rgba(128,128,128,0.1)', textSize: '22px', pathTransitionDuration: 1.2 })}
      />
    </div>
  );
};

// ─── ATTACK SIMULATION SUITE ──────────────────────────────────────────────────
const AttackSimulationSuite = ({ narrative, riskScore, dark }) => {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const stages = [
    {
      id: 'recon', title: 'Reconnaissance', shortTag: 'Recon',
      threat: riskScore < 30 ? 'LOW' : riskScore < 60 ? 'MEDIUM' : 'HIGH',
      impact: 'The attacker passively gathers your publicly available information — email addresses, usernames, and social profiles — without triggering any alerts.',
      evidence: 'Public web scraping, OSINT tools, username enumeration',
      source: 'Open Web / OSINT',
      caseStudy: 'Using your email prefix, an attacker queries 50+ social platforms within minutes, discovering active accounts on GitHub, Reddit, and Instagram — all without contacting you.',
    },
    {
      id: 'weapon', title: 'Weaponization', shortTag: 'Weaponize',
      threat: riskScore < 50 ? 'MEDIUM' : 'HIGH',
      impact: 'After finding your email in breach databases, the attacker creates targeted attack tools — custom password lists, phishing templates — built around your specific data.',
      evidence: 'Breach database correlation, credential hash extraction',
      source: 'Dark Web / Breach Registries',
      caseStudy: 'Your email appears in 3 breach databases. The attacker extracts hashed passwords and runs them through crackers. Reused passwords across sites are now compromised.',
    },
    {
      id: 'exploit', title: 'Exploitation', shortTag: 'Exploit',
      threat: riskScore < 60 ? 'HIGH' : 'CRITICAL',
      impact: 'The attacker uses weaponized data to gain unauthorized access. This is the active compromise — credential stuffing, session hijacking, or social engineering.',
      evidence: 'Cross-platform identity match, reused credentials',
      source: 'Identity Correlation Engine',
      caseStudy: 'Using credentials from one breach, the attacker tries them on 200+ websites in minutes. Your banking, email, and social accounts using the same password are instantly vulnerable.',
    },
    {
      id: 'exfil', title: 'Exfiltration', shortTag: 'Exfiltrate',
      threat: 'CRITICAL',
      impact: 'After gaining access, the attacker silently extracts sensitive data — personal files, financial info, contact lists — or sells account access on dark web marketplaces.',
      evidence: 'Verified account takeover, session persistence',
      source: 'Post-Compromise Analysis',
      caseStudy: 'Account access sold for $15 on a dark web forum. The buyer downloads your contact list, reads private messages, and uses your identity to scam your connections.',
    },
  ];

  useEffect(() => {
    let t;
    if (auto) t = setInterval(() => setStep(p => (p < 3 ? p + 1 : (setAuto(false), 3))), 4000);
    return () => clearInterval(t);
  }, [auto]);

  const currentRisk = Math.min(Math.round(((step + 1) / 4) * (riskScore || 50)), 100);
  const rc = riskColor(currentRisk);
  const s = stages[step];

  const card = 'bg-card border border-border shadow-sm';
  const cardHover = 'hover:bg-muted/40';
  const muted = 'text-muted-foreground';
  const sub = 'bg-background border border-border';

  return (
    <div className="w-full space-y-6">

      {/* ── Top Controls Row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Attack Kill-Chain Simulator</h2>
          <p className={`text-sm mt-1 ${muted}`}>Trace how an attacker would exploit your exposed identity step by step.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>Mode:</span>
          <button
            onClick={() => { setAuto(!auto); if (!auto) setStep(0); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${auto ? 'bg-red-500 text-foreground' : 'bg-muted hover:bg-muted/80 text-foreground'}`}
          >
            {auto ? <><Square className="w-3.5 h-3.5" /> Stop Auto</> : <><Play className="w-3.5 h-3.5" /> Auto Play</>}
          </button>
        </div>
      </div>

      {/* ── Horizontal Stage Timeline ── */}
      <div className={`${card} rounded-2xl p-5`}>
        <div className="relative flex items-center justify-between">
          {/* Progress line behind */}
          <div className={`absolute left-0 right-0 top-5 h-0.5 ${dark ? 'bg-muted' : 'bg-muted'}`} />
          <div
            className="absolute left-0 top-5 h-0.5 bg-primary transition-all duration-700"
            style={{ width: `${(step / 3) * 100}%` }}
          />
          {stages.map((st, idx) => {
            const isActive = idx === step;
            const isDone = idx < step;
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                <button
                  onClick={() => { setStep(idx); setAuto(false); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${isActive ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20' :
                      isDone ? 'bg-primary/20 border-primary text-primary' :
                        'bg-background border-border text-muted-foreground'
                    }`}
                >
                  {isDone ? <ShieldCheck className="w-4 h-4" /> : idx + 1}
                </button>
                <span className={`text-xs font-semibold text-center leading-tight ${isActive ? 'text-primary' : muted}`}>
                  {st.shortTag}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Grid: Left (Intelligence) | Right (Risk + Case Study) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Stage Intelligence Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Stage Header */}
          <div className={`${card} rounded-2xl p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-primary/10 uppercase tracking-widest">Phase {step + 1} of 4</span>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${s.threat === 'CRITICAL' ? 'bg-red-500/15 text-red-500' :
                      s.threat === 'HIGH' ? 'bg-amber-500/15 text-amber-500' :
                        s.threat === 'MEDIUM' ? 'bg-yellow-400/15 text-yellow-500' :
                          'bg-emerald-500/15 text-emerald-500'
                    }`}>{s.threat}</span>
                </div>
                <h3 className={`text-xl font-bold text-foreground`}>{s.title}</h3>
              </div>
              <div className="w-20 h-20 shrink-0">
                <MiniGraph step={step} dark={dark} />
              </div>
            </div>

            {/* Narrative Feed */}
            <div className={`${sub} rounded-xl p-4 mb-4`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>Live Intelligence Feed</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {narrative?.[step] ?? 'Analyzing target surface...'}
              </p>
            </div>

            {/* Evidence + Source Pills */}
            <div className="flex flex-wrap gap-3">
              <div className={`${sub} rounded-lg px-4 py-2`}>
                <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${muted}`}>Evidence</p>
                <p className="text-xs font-semibold text-foreground">{s.evidence}</p>
              </div>
              <div className={`${sub} rounded-lg px-4 py-2`}>
                <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${muted}`}>Source</p>
                <p className="text-xs font-semibold text-foreground">{s.source}</p>
              </div>
            </div>
          </div>

          {/* Why This Matters Panel */}
          <div className="rounded-2xl p-5 border bg-amber-500/10 border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">Why This Matters</h4>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.impact}</p>
          </div>

          {/* Expandable Stage Cards for ALL stages */}
          <div className="space-y-2">
            <p className={`text-xs font-bold uppercase tracking-widest ${muted}`}>All Phases</p>
            {stages.map((st, idx) => (
              <div key={idx} className={`${card} rounded-xl overflow-hidden transition-all duration-200 ${idx === step ? 'ring-1 ring-primary/10/50' : cardHover}`}>
                <button
                  className="w-full flex items-center justify-between p-4"
                  onClick={() => { setStep(idx); setExpanded(expanded === idx ? null : idx); setAuto(false); }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idx === step ? 'bg-primary text-primary-foreground' :
                        idx < step ? 'bg-primary/10 text-primary' :
                          'bg-muted text-muted-foreground'
                      }`}>{idx + 1}</div>
                    <span className="text-sm font-semibold text-foreground">{st.title}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${st.threat === 'CRITICAL' ? 'bg-red-500/15 text-red-500' :
                        st.threat === 'HIGH' ? 'bg-amber-500/15 text-amber-500' :
                          'bg-emerald-500/15 text-emerald-500'
                      }`}>{st.threat}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 ${muted} transition-transform ${expanded === idx ? 'rotate-180' : ''}`} />
                </button>
                {expanded === idx && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
                    <p className="mb-2"><strong className="text-foreground">Source:</strong> {st.source}</p>
                    <p><strong className="text-foreground">Evidence:</strong> {st.evidence}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Risk Meter + Case Study */}
        <div className="space-y-5">
          {/* Risk Score Meter */}
          <div className={`${card} rounded-2xl p-6 flex flex-col items-center text-center`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${muted}`}>Risk Progression</p>
            <RiskGauge score={currentRisk} level={rc.label} />
            <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${rc.bg} ${rc.text} border ${rc.border}`}>
              {rc.label} RISK
            </div>
            <div className="mt-4 w-full h-2 rounded-full overflow-hidden bg-muted/50">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${currentRisk}%`, backgroundColor: rc.hex }} />
            </div>
            <p className={`text-[9px] mt-2 ${muted}`}>{currentRisk}% of total exposure calculated</p>
          </div>

          {/* Case Study Panel */}
          <div className={`${card} rounded-2xl p-6`}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary/80" />
              <h4 className="text-sm font-bold text-foreground">Real-World Case Study</h4>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{s.caseStudy}</p>
          </div>

          {/* Stage Navigation Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => { setStep(p => Math.max(0, p - 1)); setAuto(false); }}
              disabled={step === 0}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm border border-border disabled:opacity-30 bg-muted hover:bg-muted/60 text-foreground"
            >
              ← Previous
            </button>
            <button
              onClick={() => { setStep(p => Math.min(3, p + 1)); setAuto(false); }}
              disabled={step === 3}
              className="flex-1 py-3 rounded-xl shadow-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── REMEDIATION PAGE ─────────────────────────────────────────────────────────
const RemediationPage = ({ recommendations, role, dark }) => {
  const [checked, setChecked] = useState({});
  const toggle = (i) => setChecked(p => ({ ...p, [i]: !p[i] }));

  const card = 'bg-card border border-border shadow-md';
  const muted = 'text-muted-foreground';

  const getSimpleStep = (rec) => {
    const map = {
      'Immediately rotate the password for the breached accounts and any platforms sharing the same credential.': {
        what: 'Change your passwords',
        how: 'Go to each website where you use this email and update your password immediately.',
        why: 'Locks out hackers who might have stolen your old password in a data leak.'
      },
      'Audit your password manager to ensure zero credential reuse across financial or core email accounts.': {
        what: 'Check for reused passwords',
        how: 'Open your password manager and ensure every account has a different, random password.',
        why: 'Stops a "domino effect" where one hack leads to all your accounts being compromised.'
      },
      'Enforce strict Multi-Factor Authentication (MFA) on all critical nodes, preferring hardware keys (YubiKey) over standard apps.': {
        what: 'Turn on extra security (MFA)',
        how: 'Go to security settings on Google, bank, and social media. Turn on "2-Step Verification".',
        why: 'Even if a hacker has your password, they still can\'t get in without your physical phone or key.'
      },
      'Monitor financial accounts linked to this email address for unauthorized access, and freeze credit reporting if banking details were potentially leaked.': {
        what: 'Watch your bank statements',
        how: 'Log into your bank app weekly. If you see weird charges, call the bank and "freeze" your cards.',
        why: 'Allows you to stop identity theft and fraud before it becomes a major financial problem.'
      },
      'Implement data-compartmentalization: Use disconnected pseudonyms and separate emails for personal vs. professional web presence.': {
        what: 'Separate your online identities',
        how: 'Use one email for work and a different one for personal stuff. Use different nicknames too.',
        why: 'Keeps your private life private if your work email is ever involved in a professional leak.'
      },
      'Review public privacy settings on identified social profiles to limit Open Source Intelligence (OSINT) gathering by adversaries.': {
        what: 'Hide your social profiles',
        how: 'Set your Instagram, Twitter, or Facebook profiles to "Private" in the settings menu.',
        why: 'Prevents strangers from seeing your personal info and using it to trick you or hack you.'
      },
      'Never use SMS-based 2FA. Migrate completely to Time-Based One-Time Passwords (TOTP) immediately.': {
        what: 'Stop using text-message codes',
        how: 'Switch from "Text Message" security to an app like Google Authenticator or Microsoft Authenticator.',
        why: 'Hackers can steal text messages (SIM swapping), but they can\'t steal codes from inside your phone app.'
      },
      'Contact your cellular carrier to place a high-security PIN or "Port Freeze" on your phone number to stop SIM Swapping.': {
        what: 'Protect your phone number',
        how: 'Call your mobile carrier (Airtel, Jio, etc.) and ask them to "Lock" your SIM with a secret PIN.',
        why: 'Stops thieves from stealing your phone number to gain access to your bank or email.'
      },
      'Your digital footprint is currently secure. Maintain operational security by utilizing a Password Manager and MFA globally.': {
        what: 'Keep up the good work',
        how: 'Continue using your password manager and keep MFA turned on everywhere.',
        why: 'Proactive security is much easier than fixing a hack after it happens.'
      },
      'Consider using email aliasing services (like SimpleLogin or Apple Hide My Email) when signing up for new untrusted services.': {
        what: 'Use fake email addresses',
        how: 'Use services like "Hide My Email" so you don\'t have to give your real address to random websites.',
        why: 'If that website gets hacked or sends spam, your real email address remains safe and hidden.'
      },
      'Regularly monitor your historical exposure by running this trace quarterly.': {
        what: 'Check back every 3 months',
        how: 'Come back to PersonaTrace every few months to see if your info appeared in any new leaks.',
        why: 'New hacks happen every day. Regular checks help you catch leaks as soon as they occur.'
      }
    };
    return map[rec] || { 
      what: 'Strengthen Security', 
      how: 'Review account security settings and follow platform-specific hardening guides.', 
      why: 'To reduce your overall attack surface and protect your identity bits.' 
    };
  };

  const categories = role === 'user' ? [
    {
      title: 'Actionable Security Steps',
      icon: Lock,
      color: 'rose',
      items: recommendations ?? ['Rotate all breach-exposed passwords immediately.', 'Enable hardware security keys (YubiKey) where supported.'],
      priorities: ['CRITICAL', 'HIGH', 'HIGH'],
    }
  ] : [
    {
      title: 'Account Security',
      icon: Lock,
      color: 'rose',
      items: recommendations?.filter((_, i) => i % 3 === 0) ?? ['Rotate all breach-exposed passwords immediately.', 'Enable hardware security keys (YubiKey) where supported.'],
      priorities: ['CRITICAL', 'HIGH', 'HIGH'],
    },
    {
      title: 'Data Exposure',
      icon: Eye,
      color: 'amber',
      items: recommendations?.filter((_, i) => i % 3 === 1) ?? ['Monitor financial accounts for suspicious activity.', 'Set up dark web breach monitoring alerts.'],
      priorities: ['HIGH', 'MEDIUM', 'MEDIUM'],
    },
    {
      title: 'Identity Protection',
      icon: Shield,
      color: 'blue',
      items: recommendations?.filter((_, i) => i % 3 === 2) ?? ['Use unique pseudonyms per platform.', 'Compartmentalize personal and professional digital presence.'],
      priorities: ['MEDIUM', 'MEDIUM', 'LOW'],
    },
  ];

  const priorityStyle = (p) => {
    if (p === 'CRITICAL') return 'bg-red-500/10 text-red-500';
    if (p === 'HIGH') return 'bg-amber-500/10 text-amber-500';
    return 'bg-primary/10 text-primary';
  };

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const totalChecked = Object.values(checked).filter(Boolean).length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 px-4 py-8">
      <div className="text-center">
        <h2 className={`text-3xl font-bold tracking-tight mb-2 text-foreground`}>{role === 'user' ? 'Simple Security Checklist' : 'Security Hardening Checklist'}</h2>
        <p className={`text-sm ${muted}`}>{role === 'user' ? 'Easy steps you can take right now to protect yourself.' : 'Prioritized recommendations based on your exposure scan results.'}</p>
      </div>

      {/* Progress Bar */}
      <div className={`${card} rounded-2xl p-6`}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-foreground">My Safety Progress</span>
          <span className="text-sm font-bold text-primary">{totalChecked} / {totalItems} {role === 'user' ? 'Steps' : 'items'} complete</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden bg-muted/50 border border-border/50">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: totalItems ? `${(totalChecked / totalItems) * 100}%` : '0%' }} />
        </div>
      </div>

      {/* Categories */}
      {categories.map((cat, ci) => {
        const Icon = cat.icon;
        return (
          <div key={ci} className={`${card} rounded-2xl overflow-hidden`}>
            <div className={`px-6 py-4 border-b border-border flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-xl bg-${cat.color}-500/10 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${cat.color}-500`} />
              </div>
              <h3 className={`text-base font-bold text-foreground`}>{cat.title}</h3>
              <span className={`ml-auto text-xs ${muted}`}>{cat.items.length} steps</span>
            </div>
            <div className="divide-y divide-border">
              {cat.items.map((rec, ri) => {
                const key = `${ci}-${ri}`;
                const isChecked = checked[key];
                const s = getSimpleStep(rec);
                return (
                  <div key={ri} className="flex flex-col gap-2 px-6 py-6 transition-all hover:bg-muted/30">
                    <div className="flex items-start gap-4 cursor-pointer" onClick={() => toggle(key)}>
                      <div className="shrink-0 mt-0.5">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${isChecked ? 'bg-primary border-primary' : 'border-muted-foreground/30 hover:border-primary/50'}`}
                        >
                          {isChecked && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`text-base font-bold transition-colors ${isChecked ? 'line-through text-muted-foreground opacity-60' : 'text-foreground'}`}>
                          {role === 'user' ? s.what : rec}
                        </p>
                      </div>
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 ${priorityStyle(cat.priorities[ri] ?? 'MEDIUM')}`}>
                        {cat.priorities[ri] ?? 'MEDIUM'}
                      </span>
                    </div>

                    {role === 'user' && !isChecked && (
                      <div className="ml-10 mt-3 grid gap-4">
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-2 flex items-center gap-2">
                            <Zap className="w-3 h-3" /> Step-by-Step Instructions
                          </p>
                          <div className="space-y-2">
                            {s.how.split('. ').map((step, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <span className="w-5 h-5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">{step.endsWith('.') ? step : `${step}.`}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 mb-1 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Why this protects you
                          </p>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{s.why}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── EXECUTIVE REPORT COMPONENT ────────────────────────────────────────────────
const ExecutiveReport = ({ result, email, username, role, dark }) => {
  if (!result) return null;

  const handlePrint = () => window.print();
  const handleCopy = () => {
    const text = document.getElementById('report-content').innerText;
    navigator.clipboard.writeText(text);
    alert('Report copied to clipboard!');
  };

  const getSimpleStep = (rec) => {
    const map = {
      'Immediately rotate the password for the breached accounts and any platforms sharing the same credential.': 'Change your passwords on all affected platforms immediately.',
      'Audit your password manager to ensure zero credential reuse across financial or core email accounts.': 'Check for reused passwords in your password manager.',
      'Enforce strict Multi-Factor Authentication (MFA) on all critical nodes, preferring hardware keys (YubiKey) over standard apps.': 'Turn on 2-step verification (MFA) using an app or hardware key.',
      'Monitor financial accounts linked to this email address for unauthorized access, and freeze credit reporting if banking details were potentially leaked.': 'Watch your bank statements for suspicious charges.',
      'Implement data-compartmentalization: Use disconnected pseudonyms and separate emails for personal vs. professional web presence.': 'Use different usernames and emails for work and personal life.',
      'Review public privacy settings on identified social profiles to limit Open Source Intelligence (OSINT) gathering by adversaries.': 'Make your social media profiles private.',
      'Never use SMS-based 2FA. Migrate completely to Time-Based One-Time Passwords (TOTP) immediately.': 'Switch from text-message security to a security app.',
      'Contact your cellular carrier to place a high-security PIN or "Port Freeze" on your phone number to stop SIM Swapping.': 'Lock your SIM card with a PIN via your carrier.',
      'Your digital footprint is currently secure. Maintain operational security by utilizing a Password Manager and MFA globally.': 'Keep using MFA and password managers for safety.',
      'Consider using email aliasing services (like SimpleLogin or Apple Hide My Email) when signing up for new untrusted services.': 'Use "Hide My Email" features for random websites.',
      'Regularly monitor your historical exposure by running this trace quarterly.': 'Return here every few months to check for new hacks.'
    };
    return map[rec] || rec;
  };

  const sections = role === 'user' ? [
    {
      title: '1. Basic Overview',
      icon: Info,
      content: [
        `Identity checked: ${email}`,
        `Username checked: ${username || 'N/A'}`,
        `Checked on: ${new Date().toLocaleString()}`,
      ]
    },
    {
      title: '2. Breach Summary',
      icon: ShieldAlert,
      content: result.breach_status ? [
        `Found ${result.breach_details.length} leaks of your data.`,
        `Major sites affected: ${result.breach_details.slice(0, 3).map(b => b.Name).join(', ')}`,
        `Type of info leaked: Most recent leaks involved your email and passwords.`,
      ] : ['No major leaks of your information found.']
    },
    {
      title: '3. Your Risk level',
      icon: AlertCircle,
      content: [
        `Risk Rating: ${result.risk_level}`,
        `Severity: ${result.risk_score} / 100`,
        `Reason: ${result.risk_level === 'High' ? 'Your information was found in multiple leaks and public surfaces.' : 'Only a few fragments of your identity were found.'}`,
      ]
    },
    {
      title: '4. Suggested Steps to Fix',
      icon: ShieldCheck,
      content: result.recommendations.slice(0, 5).map(rec => getSimpleStep(rec))
    }
  ] : [
    {
      title: '1. Basic Overview',
      icon: Info,
      content: [
        `Email analyzed: ${email}`,
        `Username provided: ${username || 'N/A'}`,
        `Scan timestamp: ${new Date().toLocaleString()}`,
        `Analysis Engine: Sherlock Holmes Investigative Engine`,
      ]
    },
    {
      title: '2. Detailed Forensic Compromise Analysis',
      icon: ShieldAlert,
      content: result.breach_status ? [
        `Verified Exposure Cluster: Found ${result.breach_details.length} historical audit matches.`,
        ...result.breach_details.map(b => 
          `[PLATFORM_AUDIT] ID: ${b.Name} | Site: ${b.Domain} | Vectors: ${b.DataClasses.join(', ')} | Status: Verified Compromise`
        ),
        `Forensic Indicator: Presence of ${result.breach_details.filter(b => b.DataClasses.includes('Passwords')).length} plaintext or hashed credential pools identified.`
      ] : ['No digital breaches found in known databases.']
    },
    {
      title: '3. Risk Topology Assessment',
      icon: AlertCircle,
      content: [
        `Risk Probability Index: ${result.risk_score}% Severity`,
        `Exposure Classification: ${result.risk_level} Impact`,
        `Surface Analysis: ${result.risk_level === 'High' ? 'Critical correlation between breach registries and public OSINT surfaces detected.' : 'Isolated identity fragments discovered with minimal cross-linkage.'}`,
        `Identity Correlation Certainty: ${(result.correlation_engine?.mapping_confidence ?? 0).toFixed(2)}%`
      ]
    },
    {
      title: '4. Footprint Mapping & Alias Tracking',
      icon: Network,
      content: [
        `Active Digital Footprints Discovered: ${result.simulated_accounts.length}`,
        `High-Confidence Surface Tracking: ${result.simulated_accounts.slice(0, 5).map(a => a.platform).join(', ')}`,
        `Alias Uniqueness Analysis: ${result.simulated_accounts.length > 3 ? 'Deterministic handle reuse patterns facilitate high-precision tracking.' : 'Stochastic alias usage reduces total identity surface linkability.'}`,
        `Forensic Logic Engine: ${result.correlation_engine?.mapping_logic || 'Sherlock Investigative Trace'}`
      ]
    },
    {
      title: '5. Technical Hardening Recommendations',
      icon: ShieldCheck,
      content: result.recommendations.map(rec => `[REMEDIATION_PROTOCOL] ${rec}`)
    }
  ];

  const cardClass = 'bg-card border border-border shadow-md';
  const textClass = 'text-foreground';
  const mutedClass = 'text-muted-foreground';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 px-4 py-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
      {/* Controls Row - Hidden on Print */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2 print:hidden">
        <div>
          <h2 className={`text-2xl font-bold ${textClass}`}>{role === 'user' ? 'Executive Intelligence Summary' : 'Executive Intelligence Report'}</h2>
          <p className={`text-sm ${mutedClass}`}>{role === 'user' ? 'A simple overview of your digital safety and risk profile.' : 'Professional summary of your digital footprint and risk profile.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold text-foreground transition-all">
            <Copy className="w-4 h-4" /> Copy Report
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* The Report Document */}
      <div id="report-content" className={`${cardClass} rounded-2xl p-8 sm:p-12 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none`}>
        {/* Header Section */}
        <div className="border-b border-border pb-8 mb-8 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Fingerprint className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground print:text-black">PersonaTrace</h1>
              <p className={`text-xs font-bold uppercase tracking-widest ${mutedClass} print:text-slate-500`}>Security Audit & Intel Summary</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-bold text-primary uppercase mb-1">Confidential Audit</p>
            <p className={`text-xs font-semibold ${mutedClass} print:text-slate-500`}>Ref ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
            <p className={`text-xs font-semibold ${mutedClass} print:text-slate-500`}>{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Report Body */}
        <div className="space-y-10">
          {sections.map((section, idx) => (
            <div key={idx} className="page-break-inside-avoid">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-1.5 rounded-lg ${dark ? 'bg-primary/10' : 'bg-primary/5'}`}>
                  <section.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground print:text-black">{section.title}</h3>
              </div>
              <ul className="space-y-3 ml-12">
                {section.content.map((item, i) => (
                  <li key={i} className={`text-sm leading-relaxed ${mutedClass} print:text-slate-700 relative`}>
                    <span className="absolute -left-5 top-2.5 w-1.5 h-1.5 rounded-full bg-primary/40 print:bg-black/20" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className={`text-[10px] font-bold ${mutedClass} print:text-slate-400`}>© 2026 PersonaTrace Forensic Intelligence</p>
          <p className={`text-[10px] font-bold ${mutedClass} print:text-slate-400`}>Generated via Sherlock Investigative Engine</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; background: white !important; }
          #report-content, #report-content * { visibility: visible; }
          #report-content { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
          .page-break-inside-avoid { page-break-inside: avoid; }
        }
      `}} />
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export default function Dashboard({ dark, toggleTheme }) {
  const location = useLocation();
  const role = location.state?.role || 'user';
  const [activeTab, setActiveTab] = useState('breaches');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const onGraphNodeClick = useCallback((u) => {
    setUsername(u);
    handleScan(null, u);
  }, [email, username]); // Include dependencies for handleScan

  // ── Theme-aware class helpers ──
  const bg = 'bg-background';
  const card = 'bg-card border border-border shadow-md';
  const text = 'text-foreground';
  const muted = 'text-muted-foreground';
  const input = 'bg-input border-border text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-ring focus:border-ring outline-none transition-all';

  // ── Scan Logic ──
  const validateEmail = (val) => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setEmailError(ok || val === '' ? '' : 'Please enter a valid email address');
    return ok;
  };

  const handleScan = async (e, overrideUsername = null) => {
    if (e) e.preventDefault();
    const finalUsername = overrideUsername || username;
    
    if (!email || !validateEmail(email)) {
      setEmailError('A valid email address is required to run a trace.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await axios.post('http://127.0.0.1:8000/scan', { 
        email, 
        username: finalUsername || null 
      });
      setResult(res.data);
      // Stay on current tab if it was a deep scan from graph
      if (!overrideUsername) setActiveTab('breaches');
    } catch {
      setError('Trace execution failed. Ensure the PersonaTrace backend is operational.');
    } finally { setLoading(false); }
  };

  // ── RENDER: HOME ──
  const renderHome = () => (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-[600ms] ease-out fill-mode-both px-4">
      {/* Hero */}
      <div className="text-center mb-16 pt-8 space-y-5">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border ${dark ? 'bg-primary/10 border-primary/20 text-primary/90' : 'bg-primary/5 border-primary/20 text-primary'}`}>
          <Activity className="w-3 h-3" /> Exposure Intelligence Platform
        </div>
        <h1 className={`text-5xl md:text-7xl font-black tracking-tight leading-[1.05] ${text}`}>
          Know Your <br />
          <span className="text-primary">Digital Risk.</span>
        </h1>
        <p className={`max-w-xl mx-auto text-base leading-relaxed ${muted}`}>
          PersonaTrace analyzes your digital exposure across breach databases and social platforms, then maps how an attacker could exploit your identity.
        </p>
      </div>

      {/* Scan Form */}
      <div className={`w-full max-w-2xl ${card} rounded-3xl p-8 mb-20 shadow-xl`}>
        <h2 className={`text-lg font-bold mb-6 ${text}`}>Start an Identity Trace</h2>
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${muted}`}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm font-medium transition-all outline-none ${input} ${emailError ? 'border-red-500' : ''}`}
                required
              />
            </div>
            {emailError && <p className="text-red-500 text-xs mt-1.5 font-medium">{emailError}</p>}
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${muted}`}>
              Username <span className={`normal-case font-normal ${muted}`}>(optional)</span>
            </label>
            <div className="relative">
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
              <input
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm font-medium transition-all outline-none ${input}`}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-500 text-xs font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!emailError || !email}
            className="w-full flex items-center justify-center gap-3 py-4 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            {loading ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? 'Running Trace...' : 'Launch Identity Trace'}
          </button>
        </form>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16 px-4">
        {[
          { t: 'Breach Detection', d: 'Check your email against global breach databases.', i: ShieldAlert, c: 'rose' },
          { t: 'Identity Correlation', d: 'Map your digital footprint across social platforms.', i: Network, c: 'blue' },
          { t: 'Attack Simulation', d: 'Visualize how an attacker exploits your identity.', i: Crosshair, c: 'amber' },
        ].map((f, i) => (
          <div key={i} className={`${card} rounded-2xl p-6 hover:scale-[1.02] transition-transform`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-${f.c}-500/10`}>
              <f.i className={`w-5 h-5 text-${f.c}-500`} />
            </div>
            <h3 className={`font-bold mb-2 ${text}`}>{f.t}</h3>
            <p className={`text-sm leading-relaxed ${muted}`}>{f.d}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ── RENDER: BREACH ANALYSIS ──
  const renderBreaches = () => {
    if (!result) return renderHome();

    const breaches = result.breach_details ?? [];
    const rc = riskColor(result.risk_score ?? 0);

    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-[600ms] ease-out fill-mode-both">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${card} rounded-2xl p-8 flex flex-col items-center text-center`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${muted}`}>Risk Score</p>
            <RiskGauge score={result.risk_score ?? 0} level={result.risk_level} />
            <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${rc.text} ${rc.bg} ${rc.border}`}>
              {result.risk_level} Threat
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className={`${card} rounded-2xl p-6`}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span className={`text-xs font-black uppercase tracking-[0.2em] ${muted}`}>Source Email</span>
                  </div>
                  <span className={`text-sm font-bold text-foreground`}>{email}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${muted}`}>Associated Handles</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[username || email.split('@')[0], ...(result.possible_usernames ?? [])].slice(0, 6).map((u, i) => (
                      <span key={i} className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold text-foreground border border-border/50">
                        @{u}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { l: 'Breaches Found', v: breaches.length, c: 'text-red-600', desc: 'Leaked databases' },
                  { l: 'Active Profiles', v: result.simulated_accounts?.length ?? 0, c: 'text-amber-600', desc: 'Discovered accounts' },
                  { l: 'Correlation Score', v: `${(result.correlation_engine?.mapping_confidence ?? 0).toFixed(1)}%`, c: 'text-blue-600', desc: 'Identity certainty' },
                  { l: 'Surface Scanned', v: result.platforms_probed ?? 450, c: 'text-emerald-600', desc: 'Platforms checked' },
                ].map((s, i) => (
                  <div key={i} className="bg-background/50 border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-muted-foreground">{s.l}</p>
                    <p className={`text-3xl font-black mb-1 ${s.c}`}>{s.v}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-primary to-primary/80 border border-primary/20 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                   <Target className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white">Advanced Correlation Logic</p>
              </div>
              <p className="text-sm text-white/90 font-medium leading-relaxed">{result.correlation_engine?.mapping_logic || 'Standard Heuristic Trace'}</p>
            </div>
          </div>
        </div>


        <div className="flex items-center gap-3 mt-12">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <h3 className={`text-lg font-bold ${text}`}>Breach Intelligence Feed</h3>
        </div>

        {breaches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {breaches.map((b, i) => (
              <div key={i} className={`${card} rounded-2xl p-6 hover:scale-[1.01] transition-transform`}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-base font-bold truncate max-w-[60%] text-foreground">{b.Name}</h4>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 uppercase">
                      {b.BreachDate?.includes('-') ? b.BreachDate : 'Historical'}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground mt-1 tracking-tighter">
                      Year: {b.BreachDate?.split('-')[0] || (b.Name.match(/\d{4}/) || ['Unknown'])[0]}
                    </span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed mb-4 line-clamp-3 text-muted-foreground">{b.Description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(b.DataClasses ?? []).slice(0, 4).map((dc, j) => (
                    <span key={j} className="text-[9px] font-semibold px-2 py-0.5 rounded bg-muted text-foreground">{dc}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border text-muted-foreground">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
            <p className="font-bold text-foreground">No breaches detected.</p>
          </div>
        )}
      </div>
    );
  };

  const renderGraph = () => (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-[600ms] ease-out fill-mode-both">
      {!result ? (
        <div className="text-center py-32">
          <Network className={`w-12 h-12 mx-auto mb-4 opacity-20 ${muted}`} />
          <p className={`font-bold text-foreground`}>Run a scan first.</p>
        </div>
      ) : (
        <div className={`${card} rounded-3xl overflow-hidden`} style={{ height: '75vh', minHeight: '600px' }}>
          <IdentityGraph 
            data={result.graph_data ?? { nodes: [], edges: [] }} 
            onNodeClick={(u) => {
              setUsername(u);
              handleScan(null, u);
            }} 
          />
        </div>
      )}
    </div>
  );

  const renderSimulation = () => (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-[600ms] ease-out fill-mode-both">
      {!result ? (
        <div className="text-center py-32">
          <Crosshair className={`w-12 h-12 mx-auto mb-4 opacity-20 ${muted}`} />
          <p className={`font-bold text-foreground`}>Run a scan first.</p>
        </div>
      ) : (
        <AttackSimulationSuite narrative={result.attack_narrative} riskScore={result.risk_score ?? 50} dark={dark} />
      )}
    </div>
  );

  return (
    <div className={`min-h-screen ${bg} ${text} font-sans transition-colors duration-300`}>
      <Navbar dark={dark} toggleTheme={toggleTheme} activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
      <main className="min-h-[calc(100vh-64px)] flex flex-col items-center">
        {activeTab === 'breaches' && renderBreaches()}
        {activeTab === 'graph' && (
          <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-[600ms] ease-out fill-mode-both">
            {!result ? (
              <div className="text-center py-32">
                <Network className={`w-12 h-12 mx-auto mb-4 opacity-20 ${muted}`} />
                <p className={`font-bold text-foreground`}>Run a scan first.</p>
              </div>
            ) : (
              <div className={`${card} rounded-3xl overflow-hidden`} style={{ height: '75vh', minHeight: '600px' }}>
                <IdentityGraph 
                  data={result.graph_data ?? { nodes: [], edges: [] }} 
                  onNodeClick={onGraphNodeClick} 
                />
              </div>
            )}
          </div>
        )}
        {activeTab === 'simulation' && renderSimulation()}
        {activeTab === 'remediation' && <RemediationPage recommendations={result?.recommendations} role={role} dark={dark} />}
        {activeTab === 'report' && <ExecutiveReport result={result} email={email} username={username} role={role} dark={dark} />}
      </main>

      {loading && (
        <div className={`fixed inset-0 z-[100] ${dark ? 'bg-[#1c2a1f]/90' : 'bg-[#f8f5f0]/80'} backdrop-blur-xl flex flex-col items-center justify-center`}>
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-primary/10 border-t-primary/50 rounded-full animate-spin" />
            <Shield className="absolute inset-0 m-auto w-7 h-7 text-primary" />
          </div>
          <TypeAnimation
            sequence={['Initializing scan...', 1000, 'Checking breaches...', 1000, 'Mapping identity...', 1000]}
            speed={60}
            className={`text-xs font-bold uppercase tracking-[0.3em] ${muted}`}
            repeat={Infinity}
          />
        </div>
      )}
    </div>
  );
}
