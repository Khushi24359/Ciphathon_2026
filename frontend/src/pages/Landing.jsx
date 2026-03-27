import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { Fingerprint, Monitor, ShieldCheck, Zap } from 'lucide-react';

export default function Landing({ dark, toggleTheme }) {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-8, 8, -8],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="bg-background text-foreground min-h-screen relative overflow-hidden font-sans">
      {/* Subtle Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[80px]"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <Navbar dark={dark} toggleTheme={toggleTheme} isLanding={true} />

      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24 relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          
          {/* Left Content */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20"
              whileHover={{ scale: 1.02 }}
            >
              <Fingerprint className="w-3.5 h-3.5 mr-2" />
              Advanced Identity Protection
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Protect your <br />
                <span className="text-primary italic">digital identity.</span>
              </motion.h1>

              <motion.p
                className="text-muted-foreground text-lg leading-relaxed max-w-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                PersonaTrace delivers enterprise-grade exposure intelligence. We analyze global breach databases and social platforms to map your attack surface before threats materialize.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-wrap gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.button
                onClick={() => navigate("/scan")}
                className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Launch Intelligence Trace <Zap className="w-4 h-4 fill-current" />
              </motion.button>
              <motion.button
                onClick={() => navigate("/scan", { state: { email: "demo@personatrace.com" } })}
                className="px-8 py-4 bg-card border border-border text-foreground font-bold rounded-xl hover:bg-muted/50 transition-all"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Demo
              </motion.button>
            </motion.div>

            {/* Trust Markers */}
            <motion.div
              className="flex flex-wrap gap-8 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[
                { label: "Real-time Monitoring", icon: Monitor },
                { label: "High Confidence Correlation", icon: ShieldCheck },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.section>

          {/* Right Section: Interactive Card Mockup */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <motion.div
              className="w-full max-w-[440px] bg-card border border-border rounded-3xl p-8 shadow-2xl relative"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Profile Bar */}
              <div className="flex gap-4 items-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border border-border">
                  <img
                    src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=256&q=80"
                    alt="Sample Profile"
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Identity Profile</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-red-500/10 text-red-500 font-black px-2 py-0.5 rounded-full uppercase">High Risk</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">3 Breaches</span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { l: "Platform", v: "LinkedIn", s: "bg-primary/10 text-primary" },
                  { l: "Platform", v: "Adobe", s: "bg-primary/10 text-primary" },
                  { l: "Status", v: "Exposed", s: "text-red-500" },
                  { l: "Last Trace", v: "2m ago", s: "text-muted-foreground" },
                ].map((item, i) => (
                  <div key={i} className="bg-background border border-border/50 rounded-xl p-3">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">{item.l}</p>
                    <p className={`text-xs font-bold ${item.s}`}>{item.v}</p>
                  </div>
                ))}
                <div className="col-span-2 bg-background border border-border/50 rounded-xl p-4">
                  <p className="text-[9px] font-black uppercase text-muted-foreground mb-2">Exposed Credentials</p>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded text-red-500 font-bold">P@ssw0rd123</span>
                    <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground font-bold">user_77</span>
                  </div>
                </div>
              </div>

              {/* Decorative Terminal Line */}
              <div className="bg-background/50 border border-border rounded-lg p-3 font-mono text-[10px] text-muted-foreground">
                <span className="text-primary mr-1">$</span> correlation_engine --trace identity
                <br />
                <span className="text-primary mr-1">&gt;</span> status: match_found (98.2%)
              </div>
            </motion.div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
