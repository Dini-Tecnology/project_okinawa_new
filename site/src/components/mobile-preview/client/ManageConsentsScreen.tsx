import { useState } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { ArrowLeft, Shield, FileText, Eye, MapPin, Mail, BarChart3, Info } from 'lucide-react';

interface ConsentItem {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: any;
  revocable: boolean;
  active: boolean;
  version: string;
  acceptedAt: string;
}

const initialConsents: ConsentItem[] = [
  { id: '1', type: 'terms_of_service', label: 'Termos de Uso', description: 'Necessário para utilizar a plataforma.', icon: FileText, revocable: false, active: true, version: '1.0', acceptedAt: '15/01/2025' },
  { id: '2', type: 'privacy_policy', label: 'Política de Privacidade', description: 'Necessário para utilizar a plataforma.', icon: Shield, revocable: false, active: true, version: '1.0', acceptedAt: '15/01/2025' },
  { id: '3', type: 'marketing', label: 'Comunicações de Marketing', description: 'Receber ofertas, novidades e promoções por email e push.', icon: Mail, revocable: true, active: true, version: '1.0', acceptedAt: '15/01/2025' },
  { id: '4', type: 'analytics', label: 'Análise de Uso', description: 'Permitir coleta de dados anônimos para melhoria do app.', icon: BarChart3, revocable: true, active: true, version: '1.0', acceptedAt: '15/01/2025' },
  { id: '5', type: 'geolocation', label: 'Geolocalização', description: 'Permitir uso da localização para encontrar restaurantes próximos.', icon: MapPin, revocable: true, active: false, version: '1.0', acceptedAt: '' },
];

export const ManageConsentsScreen = () => {
  const { goBack } = useMobilePreview();
  const [consents, setConsents] = useState(initialConsents);

  const toggleConsent = (id: string) => {
    setConsents(prev => prev.map(c => c.id === id && c.revocable ? { ...c, active: !c.active } : c));
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> Gerenciar Consentimentos
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 pb-24 space-y-3">
        {/* Info Banner */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-foreground">
            Você pode gerenciar seus consentimentos a qualquer momento conforme a LGPD. Consentimentos obrigatórios não podem ser revogados sem encerrar sua conta.
          </p>
        </div>

        {consents.map(consent => {
          const Icon = consent.icon;
          return (
            <div key={consent.id} className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${consent.active ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon className={`h-5 w-5 ${consent.active ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm text-foreground">{consent.label}</h3>
                    {/* Toggle */}
                    <button
                      onClick={() => toggleConsent(consent.id)}
                      disabled={!consent.revocable}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        consent.active ? 'bg-primary' : 'bg-muted'
                      } ${!consent.revocable ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${consent.active ? 'translate-x-5.5 left-[1px]' : 'left-[2px]'}`}
                        style={{ transform: consent.active ? 'translateX(22px)' : 'translateX(0)' }}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{consent.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {!consent.revocable && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium">Obrigatório</span>}
                    <span className="text-[10px] text-muted-foreground">v{consent.version}</span>
                    {consent.acceptedAt && <span className="text-[10px] text-muted-foreground">Aceito em {consent.acceptedAt}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Delete Account */}
        <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/5">
          <h3 className="font-semibold text-sm text-destructive mb-1">Excluir Conta e Dados</h3>
          <p className="text-xs text-muted-foreground mb-3">Ao excluir sua conta, todos os dados pessoais serão permanentemente removidos conforme a LGPD.</p>
          <button className="w-full py-2.5 rounded-xl border border-destructive text-destructive text-sm font-medium">Solicitar Exclusão</button>
        </div>
      </div>
    </div>
  );
};
