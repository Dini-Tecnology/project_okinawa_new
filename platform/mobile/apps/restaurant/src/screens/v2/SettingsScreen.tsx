import { Alert } from 'react-native';
import { Store, Clock, Bell, CreditCard, LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { V2ListScreen } from './shared/V2ListScreen';
import { authService } from '@/shared/services/auth';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();

  const handleSignOut = () => {
    Alert.alert('Sair da conta', 'Deseja encerrar sua sessão neste dispositivo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          void authService.logout();
        },
      },
    ]);
  };

  return (
    <V2ListScreen
      title="Configurações"
      items={[
        {
          icon: Store,
          label: 'Dados do Restaurante',
          subtitle: 'Nome, endereço, CNPJ',
          onPress: () => navigation.navigate('RestaurantProfile'),
        },
        {
          icon: Clock,
          label: 'Horário de Funcionamento',
          subtitle: 'Seg-Dom, 11h-23h',
          onPress: () => navigation.navigate('BusinessHours'),
        },
        {
          icon: Bell,
          label: 'Notificações',
          subtitle: 'Alertas e avisos',
          onPress: () => navigation.navigate('NotificationSettings'),
        },
        {
          icon: CreditCard,
          label: 'Pagamentos',
          subtitle: 'Métodos aceitos',
          onPress: () => navigation.navigate('PaymentSettings'),
        },
        {
          icon: LogOut,
          label: 'Sair da conta',
          subtitle: 'Encerrar sessão neste dispositivo',
          onPress: handleSignOut,
        },
      ]}
    />
  );
}
