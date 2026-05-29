import { LayoutDashboard, ChefHat, Wine, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function RoleDashboardScreen() {
  const navigation = useNavigation<any>();
  return (
    <V2ListScreen title="Dashboard por Cargo" subtitle="Acesso por função" showBack items={[
      { icon: LayoutDashboard, label: 'Dono / Gerente', subtitle: 'Visão executiva', onPress: () => navigation.navigate('Hub') },
      { icon: ChefHat, label: 'Chef / Cozinha', subtitle: 'KDS e produção', onPress: () => navigation.navigate('Kitchen') },
      { icon: Wine, label: 'Barman', subtitle: 'Bar KDS', onPress: () => navigation.navigate('BarKDS') },
      { icon: Bell, label: 'Garçom / Maître', subtitle: 'Sala e atendimento', onPress: () => navigation.navigate('Waiter') },
    ]} />
  );
}
