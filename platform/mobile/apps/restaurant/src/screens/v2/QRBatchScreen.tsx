import { Layers, QrCode } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function QRBatchScreen() {
  return (
    <V2ListScreen title="QR Codes em Lote" subtitle="Gerar para várias mesas" showBack items={[
      { icon: Layers, label: 'Salão principal', subtitle: 'Mesas 1-20' },
      { icon: Layers, label: 'Varanda', subtitle: 'Mesas 21-30' },
      { icon: QrCode, label: 'Gerar lote selecionado', subtitle: 'PDF com todos os QRs' },
    ]} />
  );
}
