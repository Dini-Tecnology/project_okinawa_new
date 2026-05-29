import { Tag, Percent } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function PromotionsScreen() {
  return (
    <V2ListScreen title="Promoções" subtitle="Campanhas ativas" showBack items={[
      { icon: Percent, label: 'Happy Hour Drinks', subtitle: 'Seg-Sex 17h-19h' },
      { icon: Tag, label: 'Combo Executivo', subtitle: '15% off almoço' },
    ]} />
  );
}
