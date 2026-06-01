import { Calendar, ClipboardList, Map, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { MaitreRoleView, useRestaurantRole } from '../../contexts/RestaurantRoleContext';
import { V2ListScreen } from './shared/V2ListScreen';

export default function MaitreScreen() {
  const navigation = useNavigation<any>();
  const { setRole, setMaitreView } = useRestaurantRole();

  const openMaitreView = (view: MaitreRoleView) => {
    setRole('maitre');
    setMaitreView(view);
    navigation.navigate('Tabs');
  };

  return (
    <V2ListScreen title="Maître" subtitle="Sala, fluxo e reservas" showBack items={[
      { icon: Calendar, label: 'Reservas', subtitle: '5 reservas hoje', onPress: () => openMaitreView('maitre-reservations') },
      { icon: Users, label: 'Fluxo do Salão', subtitle: '25min de fila estimada', onPress: () => openMaitreView('maitre-flow') },
      { icon: Map, label: 'Mapa de Mesas', subtitle: '4 mesas livres', onPress: () => openMaitreView('maitre-tables') },
      { icon: ClipboardList, label: 'Gestão de Reservas', subtitle: 'Confirmação, grupos e no-show', onPress: () => openMaitreView('maitre-management') },
    ]} />
  );
}
