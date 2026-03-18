import React from 'react';
import { Link } from 'react-router-dom';
import NooweLogo from './NooweLogo';
import WaitlistCard from './WaitlistCard';
import { useLang } from '@/lib/i18n';

const SiteFooter: React.FC = () => {
  const { t } = useLang();

  const cols = [
    {
      title: t('footer.platform'),
      links: [
        { label: t('footer.overview'), to: '/platform' },
        { label: t('footer.service_types'), to: '/platform#services' },
        { label: t('footer.roles'), to: '/platform#roles' },
      ],
    },
    {
      title: t('footer.foryou'),
      links: [
        { label: t('nav.foryou'), to: '/para-voce' },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), to: '#' },
        { label: t('footer.careers'), to: '#' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), to: '#' },
        { label: t('footer.terms'), to: '#' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        {/* Waitlist strip */}
        <div className="mb-14 pb-14 border-b border-border">
          <div className="max-w-2xl mx-auto">
            <h4 className="text-foreground font-display font-bold text-lg mb-1 text-center">{t('footer.waitlist_title')}</h4>
            <p className="text-muted-foreground text-sm text-center mb-5">{t('waitlist.sub')}</p>
            <WaitlistCard compact />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-1">
            <NooweLogo size="sm" />
            <p className="text-muted-foreground text-sm mt-4 leading-relaxed max-w-[240px]">
              The Operating System
              <br />for Restaurants.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-foreground text-xs font-semibold uppercase tracking-wider mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} NOOWE. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#FF5E3A' }} />
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#0D4F4F' }} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
