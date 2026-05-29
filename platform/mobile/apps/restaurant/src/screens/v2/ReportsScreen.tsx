import { BarChart, TrendingUp, Users, Clock, Download } from 'lucide-react-native';
import { V2ListScreen } from './shared/V2ListScreen';

export default function ReportsScreen() {
  return (
    <V2ListScreen
      title="Relatórios"
      subtitle="Análises e métricas"
      showBack
      items={[
        { icon: TrendingUp, label: 'Vendas por Período' },
        { icon: Users, label: 'Clientes Atendidos' },
        { icon: Clock, label: 'Tempo de Atendimento' },
        { icon: Download, label: 'Exportar Dados' },
      ]}
    />
  );
}
