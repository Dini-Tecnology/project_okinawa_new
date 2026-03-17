import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NooweLogo from './NooweLogo';
import { useLang } from '@/lib/i18n';
import { Menu, X } from 'lucide-react';

const SiteNavbar: React.FC = () => {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const links = [
    { to: '/platform', label: t('nav.platform') },
    { to: '/demo', label: t('nav.demo') },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-card/90 backdrop-blur-xl border-b border-border/50 shadow-sm'
          : 'bg-transparent'
      }`}
      style={{ height: 56 }}
    >
      <div className="max-w-[1080px] mx-auto px-5 h-full flex items-center justify-between">
        <Link to="/" className="flex-shrink-0">
          <NooweLogo size="sm" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname === l.to ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs">
            {(['pt', 'en', 'es'] as const).map((l, i) => (
              <React.Fragment key={l}>
                {i > 0 && <span className="text-muted-foreground/40">|</span>}
                <button
                  onClick={() => setLang(l)}
                  className={`transition-colors px-0.5 ${
                    lang === l ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              </React.Fragment>
            ))}
          </div>

          <Link
            to="/request-demo"
            className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2 rounded-full hover:bg-primary-dark transition-all duration-200 hover:scale-[1.03] shadow-sm"
          >
            {t('nav.request_demo')}
          </Link>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-t border-border">
          <div className="px-5 py-6 flex flex-col gap-4">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-base text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2 text-sm">
              {(['pt', 'en', 'es'] as const).map((l, i) => (
                <React.Fragment key={l}>
                  {i > 0 && <span className="text-muted-foreground/40">|</span>}
                  <button
                    onClick={() => setLang(l)}
                    className={lang === l ? 'text-foreground font-semibold' : 'text-muted-foreground'}
                  >
                    {l.toUpperCase()}
                  </button>
                </React.Fragment>
              ))}
            </div>
            <Link
              to="/request-demo"
              className="mt-2 text-center text-sm font-semibold bg-primary text-primary-foreground px-5 py-2.5 rounded-full"
            >
              {t('nav.request_demo')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default SiteNavbar;
