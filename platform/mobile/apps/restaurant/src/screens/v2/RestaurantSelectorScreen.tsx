import { Store, Check } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function RestaurantSelectorScreen() {
  return (
    <V2ListScreen title="Selecionar Restaurante" subtitle="Multi-unidade" showBack items={[
      { icon: Check, label: 'Omakase Sushi', subtitle: 'Unidade ativa · Pinheiros' },
      { icon: Store, label: 'Noowe Lab', subtitle: 'Unidade teste' },
      { icon: Store, label: 'Bistrô Centro', subtitle: 'Segunda unidade' },
    ]} />
  );
}
