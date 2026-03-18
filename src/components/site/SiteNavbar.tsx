import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NooweLogo from './NooweLogo';
import { useLang } from '@/lib/i18n';
import { Menu, X, ArrowRight } from 'lucide-react';

const SiteNavbar: React.FC = () => {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const links = [
    { to: '/platform', label: t('nav.platform') },
    { to: '/para-voce', label: t('nav.foryou') },
    { to: '/request-demo', label: t('nav.demo') },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/98 backdrop-blur-xl shadow-sm border-b border-border/50'
          : 'bg-transparent'
      }`}
      style={{ height: 72 }}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/" className="flex-shrink-0">
          <NooweLogo size="sm" />
        </Link>

        <div className="hidden md:flex items-center gap-10">
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

        <div className="hidden md:flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            {(['pt', 'en', 'es'] as const).map((l, i) => (
              <React.Fragment key={l}>
                {i > 0 && <span className="text-border">|</span>}
                <button
                  onClick={() => setLang(l)}
                  className={`transition-colors px-1 py-0.5 rounded ${
                    lang === l ? 'text-foreground font-semibold' : 'hover:text-foreground'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              </React.Fragment>
            ))}
          </div>

          <Link
            to="/request-demo"
            className="group text-sm font-semibold bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-all duration-200 inline-flex items-center gap-2"
          >
            {t('nav.request_demo')}
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="px-6 py-6 flex flex-col gap-4">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-base text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2 text-sm">
              {(['pt', 'en', 'es'] as const).map((l, i) => (
                <React.Fragment key={l}>
                  {i > 0 && <span className="text-border">|</span>}
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
              className="mt-2 text-center text-sm font-semibold bg-primary text-primary-foreground px-5 py-3 rounded-lg"
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
