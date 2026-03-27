import React from 'react';
import { Fingerprint, Sun, Moon, LayoutDashboard, Globe, Network, Crosshair, HeartPulse, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ dark, toggleTheme, activeTab, setActiveTab, isLanding }) => {
  const location = useLocation();
  const isDashboard = location.pathname === '/scan';

  const navClass = 'bg-background/90 border-b border-border shadow-sm backdrop-blur-md sticky top-0 z-50 print:hidden';
  const textClass = 'text-foreground';
  const mutedClass = 'text-muted-foreground';

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-6 flex items-center h-16 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mr-6 shrink-0 no-underline">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className={`text-lg font-black tracking-tight ${textClass}`}>PersonaTrace</span>
        </Link>

        {/* Tabs - Only show on Dashboard */}
        {isDashboard && setActiveTab && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
            {[
              { id: 'home', l: 'Home', i: LayoutDashboard },
              { id: 'breaches', l: 'Breach Analysis', i: Globe },
              { id: 'graph', l: 'Graph', i: Network },
              { id: 'simulation', l: 'Attack Simulation', i: Crosshair },
              { id: 'remediation', l: 'Remediation', i: HeartPulse },
              { id: 'report', l: 'Executive Report', i: FileText },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
              >
                <tab.i className="w-3.5 h-3.5" />
                <span className="hidden sm:block">{tab.l}</span>
              </button>
            ))}
          </div>
        )}

        {/* Right side controls */}
        <div className="ml-auto flex items-center gap-4">
          {!isDashboard && !isLanding && (
            <Link to="/scan" className="text-sm font-bold text-primary hover:opacity-80 transition-opacity">
              Launch Dashboard
            </Link>
          )}

          {/* Dark/Light Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${dark ? 'bg-muted text-yellow-400 hover:bg-muted' : 'bg-muted text-muted-foreground hover:bg-muted'}`}
            title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
