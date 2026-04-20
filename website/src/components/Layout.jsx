import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Market Overview', icon: LayoutDashboard },
  { path: '/market-positioning', label: 'Market Positioning', icon: BarChart3 },
  { path: '/indian-ecosystem', label: 'Indian Ecosystem', icon: Lightbulb },
  { path: '/technology-roadmap', label: 'Technology Roadmap', icon: TrendingUp },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-foreground hover:bg-muted/80 lg:hidden"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <div className="flex min-w-0 items-center gap-3">
              <LayoutDashboard className="h-9 w-9 shrink-0 text-primary" />
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                  Automotive Intelligence
                </h1>
                <p className="truncate text-xs leading-5 text-muted-foreground">
                  Market Overview, Positioning, Ecosystem, Roadmap
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-border bg-accent px-3 py-1 md:flex">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </header>

      <div className="relative mx-auto flex max-w-[1400px] items-start">
        <aside
          className={cn(
            'fixed inset-y-16 left-0 z-40 w-72 border-r border-border bg-card/95 backdrop-blur-sm transition-transform duration-300 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:translate-x-0',
            sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full',
          )}
        >
          <div className="flex h-full flex-col">
            <nav className="flex-1 space-y-2 overflow-y-auto p-4 sm:p-5">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-start gap-3 rounded-xl px-4 py-3 text-sm leading-5 transition-all duration-200',
                        isActive
                          ? 'bg-accent text-primary font-medium shadow-sm before:absolute before:bottom-2 before:left-1 before:top-2 before:w-1 before:rounded-full before:bg-primary'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            'relative z-10 mt-0.5 h-5 w-5 shrink-0',
                            isActive ? 'text-primary' : 'text-muted-foreground',
                          )}
                        />
                        <span className="relative z-10 min-w-0 flex-1 whitespace-normal break-words">
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="border-t border-border p-4 sm:p-5">
              <div className="app-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-muted-foreground">AI Powered</span>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  Intelligent insights and predictions
                </p>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 top-16 z-30 bg-slate-900/25 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation overlay"
          />
        )}

        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
