import React from 'react';
import { Link } from 'react-router-dom';
import NooweLogo from './NooweLogo';
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
    <footer className="border-t border-border py-16 bg-background">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <NooweLogo size="sm" />
            <p className="text-muted-foreground text-xs mt-4 leading-relaxed max-w-[220px]">
              The Operating System
              <br />for Restaurants.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-foreground text-xs font-semibold uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-muted-foreground text-sm hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-border flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} NOOWE. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
