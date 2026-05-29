import { QrCode, Download } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function QRGeneratorScreen() {
  return (
    <V2ListScreen title="Gerar QR Code" subtitle="Mesa ou estação" showBack items={[
      { icon: QrCode, label: 'Mesa 12', subtitle: 'QR individual' },
      { icon: QrCode, label: 'Estação Bar', subtitle: 'QR operacional' },
      { icon: Download, label: 'Baixar PNG', subtitle: 'Exportar imagem' },
    ]} />
  );
}
