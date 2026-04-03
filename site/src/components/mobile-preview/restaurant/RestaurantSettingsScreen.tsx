import { Store, Clock, MapPin, Phone, Globe, Bell, Users, CreditCard, Shield, HelpCircle, ChevronRight, Camera, Settings } from "lucide-react";
import { useMobilePreview } from '../context/MobilePreviewContext';

const settings = [
  { icon: Settings, label: "Config Hub", value: "Centro de Configuração", category: "business", screen: "config-hub" },
  { icon: Clock, label: "Horário de Funcionamento", value: "11:00 - 23:00", category: "business" },
  { icon: MapPin, label: "Endereço", value: "Rua das Flores, 123", category: "business" },
  { icon: Phone, label: "Telefone", value: "(11) 99999-9999", category: "business" },
  { icon: Globe, label: "Website", value: "sakuraramen.com.br", category: "business" },
  { icon: Bell, label: "Notificações", value: "Ativadas", category: "app" },
  { icon: Users, label: "Equipe", value: "8 membros", category: "app" },
  { icon: CreditCard, label: "Formas de Pagamento", value: "Cartão, PIX, Dinheiro", category: "app" },
  { icon: Shield, label: "Segurança", value: "2FA Ativado", category: "app" },
  { icon: HelpCircle, label: "Suporte", value: "", category: "app" },
];

export const RestaurantSettingsScreen = () => {
  const { navigate } = useMobilePreview();
  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-5 py-6 bg-gradient-to-br from-secondary to-accent text-secondary-foreground">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center">
              <Store className="h-10 w-10" />
            </div>
            <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Sakura Ramen</h1>
            <p className="text-sm opacity-80">Culinária Japonesa</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 bg-success rounded-full" />
              <span className="text-xs">Aberto agora</span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Settings */}
      <div className="px-5 py-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">INFORMAÇÕES DO NEGÓCIO</h2>
        <div className="space-y-1">
          {settings.filter(s => s.category === 'business').map((setting) => (
            <button 
              key={setting.label} 
              onClick={() => (setting as any).screen && navigate((setting as any).screen)}
              className="w-full p-4 rounded-xl bg-card border border-border flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <setting.icon className="h-5 w-5 text-secondary" />
                <div className="text-left">
                  <p className="font-medium text-sm">{setting.label}</p>
                  <p className="text-xs text-muted-foreground">{setting.value}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* App Settings */}
      <div className="px-5 py-4 flex-1">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">CONFIGURAÇÕES DO APP</h2>
        <div className="space-y-1">
          {settings.filter(s => s.category === 'app').map((setting) => (
            <button 
              key={setting.label} 
              className="w-full p-4 rounded-xl bg-card border border-border flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <setting.icon className="h-5 w-5 text-secondary" />
                <div className="text-left">
                  <p className="font-medium text-sm">{setting.label}</p>
                  {setting.value && <p className="text-xs text-muted-foreground">{setting.value}</p>}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="px-5 py-4 text-center">
        <p className="text-xs text-muted-foreground">Okinawa Restaurant v1.0.0</p>
      </div>
    </div>
  );
};
