import { Wine } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function BarKDSScreen() {
  return (
    <V2ListScreen title="KDS Bar" subtitle="Bebidas e drinks" items={[
      { icon: Wine, label: 'Mesa 5 · Negroni', subtitle: '3 min · Preparando' },
      { icon: Wine, label: 'Mesa 12 · Gin Tônica', subtitle: '1 min · Novo' },
      { icon: Wine, label: 'Mesa 3 · Caipirinha', subtitle: 'Pronto' },
    ]} />
  );
}
