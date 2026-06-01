import { Wine } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';
import { BAR_KDS_LIST_MOCK } from './shared/v2Mocks';

export default function BarKDSScreen() {
  return (
    <V2ListScreen
      title="KDS Bar"
      subtitle="Bebidas e drinks"
      items={BAR_KDS_LIST_MOCK.map((item) => ({
        icon: Wine,
        label: item.label,
        subtitle: item.subtitle,
      }))}
    />
  );
}
