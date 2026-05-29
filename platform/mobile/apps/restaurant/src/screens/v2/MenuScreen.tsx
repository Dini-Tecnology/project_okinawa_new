import { UtensilsCrossed, Plus, Tag } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function MenuScreen() {
  return (
    <V2ListScreen
      title="Cardápio"
      subtitle="Gestão de itens e categorias"
      showBack
      items={[
        { icon: UtensilsCrossed, label: 'Entradas', subtitle: '12 itens ativos' },
        { icon: UtensilsCrossed, label: 'Pratos Principais', subtitle: '24 itens ativos' },
        { icon: Tag, label: 'Promoções do cardápio', subtitle: '3 ativas' },
        { icon: Plus, label: 'Adicionar item', subtitle: 'Novo prato ou bebida' },
      ]}
    />
  );
}
