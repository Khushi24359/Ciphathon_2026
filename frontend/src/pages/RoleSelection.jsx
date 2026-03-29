import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield, ArrowRight, Zap, Fingerprint } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function RoleSelection({ dark, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state || {};

  const selectRole = (role) => {
    navigate('/scan', { state: { ...initialData, role } });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="bg-background text-foreground min-h-screen relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <Navbar dark={dark} toggleTheme={toggleTheme} isLanding={true} />

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 mb-4">
            <Zap className="w-3.5 h-3.5 mr-2" />
            Personalized Experience
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            How will you use <span className="text-primary italic">PersonaTrace?</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Select your profile to tailor the intelligence dashboard and reports to your specific needs.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 md:grid-cols-2 w-full max-w-5xl"
        >
          {/* Standard User Card */}
          <motion.button
            variants={cardVariants}
            onClick={() => selectRole('user')}
            className="group relative bg-card border border-border rounded-[2.5rem] p-10 text-left hover:border-primary/50 transition-all shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
          >
            <div className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <ArrowRight className="w-6 h-6" />
            </div>
            
            <div className="w-16 h-16 rounded-3xl bg-secondary/10 flex items-center justify-center mb-8 border border-secondary/20">
              <User className="w-8 h-8 text-secondary" />
            </div>

            <h3 className="text-2xl font-bold mb-3">Standard User</h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Focus on personal digital safety. Simple summaries, easy-to-follow remediation, and clear risk explanations.
            </p>

            <ul className="space-y-3">
              {['Simplified Risk Analysis', 'Non-Technical Guides', 'Executive Summary'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.button>

          {/* Developer / Auditor Card */}
          <motion.button
            variants={cardVariants}
            onClick={() => selectRole('auditor')}
            className="group relative bg-card border border-border rounded-[2.5rem] p-10 text-left hover:border-primary/50 transition-all shadow-xl hover:shadow-primary/5 active:scale-[0.98]"
          >
            <div className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <ArrowRight className="w-6 h-6" />
            </div>

            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
              <Shield className="w-8 h-8 text-primary" />
            </div>

            <h3 className="text-2xl font-bold mb-3">Developer / Auditor</h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Deep-dive forensic analysis. Technical audit reports, graph visualizations, and detailed attack simulations.
            </p>

            <ul className="space-y-3">
              {['Identity Correlation Graph', 'Attack Kill-Chain Simulation', 'Technical Audit Reports'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 flex items-center gap-2 text-muted-foreground"
        >
          <Fingerprint className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Enterprise-Grade Forensic Intelligence</span>
        </motion.div>
      </main>
    </div>
  );
}
