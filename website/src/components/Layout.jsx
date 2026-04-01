import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Market Overview', icon: LayoutDashboard },
  { path: '/market-positioning', label: 'Market Positioning', icon: BarChart3 },
  { path: '/indian-ecosystem', label: 'Indian Ecosystem', icon: Lightbulb },
  { path: '/technology-roadmap', label: 'Technology Roadmap', icon: TrendingUp },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal background - flat and calm */}

      <header className="bg-card/95 border-b border-border sticky top-0 z-50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-foreground hover:bg-muted/80"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <LayoutDashboard className="h-9 w-9 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Automotive Intelligence</h1>
                <p className="text-xs text-muted-foreground">Market Overview, Positioning, Ecosystem, Roadmap</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-accent border border-border">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] bg-card border-r border-border transition-transform duration-300 z-40",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            "w-64"
          )}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                      isActive
                        ? "bg-accent text-primary font-medium shadow-sm before:absolute before:left-1 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-primary"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn("h-5 w-5 relative z-10", isActive ? "text-primary" : "text-muted-foreground")} />
                      <span className="relative z-10">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="app-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground">AI Powered</span>
              </div>
              <p className="text-xs text-muted-foreground">Intelligent insights and predictions</p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
