import { useState } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import { ArrowLeft, Baby, Plus, X, Minus, ChefHat, Puzzle, Zap, AlertCircle, Armchair, Check } from 'lucide-react';

const allergyOptions = ['Glúten', 'Lactose', 'Amendoim', 'Frutos do mar', 'Ovos', 'Nenhuma'];

const familyFeatures = [
  { icon: ChefHat, title: 'Menu Kids', desc: 'Cardápio adaptado com porções menores e sabores atrativos' },
  { icon: Armchair, title: 'Cadeirão', desc: 'Cadeira alta disponível para bebês e crianças pequenas' },
  { icon: Puzzle, title: 'Kit Atividades', desc: 'Desenhos, jogos e passatempos para entreter' },
  { icon: Zap, title: 'Kids First', desc: 'Pratos das crianças são priorizados na cozinha' },
  { icon: AlertCircle, title: 'Alerta Alérgenos', desc: 'Equipe avisada sobre restrições alimentares' },
];

interface Child { id: string; name: string; age: number; allergies: string[]; }

export const FamilyModeScreen = () => {
  const { goBack, navigate } = useMobilePreview();
  const [children, setChildren] = useState<Child[]>([{ id: '1', name: 'Sofia', age: 5, allergies: [] }]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(5);
  const [newAllergies, setNewAllergies] = useState<string[]>([]);

  const addChild = () => {
    if (newName) {
      setChildren([...children, { id: Date.now().toString(), name: newName, age: newAge, allergies: newAllergies }]);
      setNewName(''); setNewAge(5); setNewAllergies([]); setShowAdd(false);
    }
  };

  const removeChild = (id: string) => setChildren(children.filter(c => c.id !== id));
  const toggleAllergy = (a: string) => setNewAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          <Baby className="h-5 w-5 text-accent" /> Modo Família
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 pb-28 space-y-4">
        {/* Features */}
        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20">
          <h3 className="font-semibold text-sm text-foreground mb-3">Recursos para Famílias</h3>
          <div className="space-y-3">
            {familyFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Children */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-sm text-foreground mb-3">Crianças ({children.length})</h3>
          {children.map(child => (
            <div key={child.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {child.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{child.name}</p>
                <p className="text-xs text-muted-foreground">{child.age} anos {child.allergies.length > 0 ? `• ${child.allergies.join(', ')}` : ''}</p>
              </div>
              <button onClick={() => removeChild(child.id)} className="p-1 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
            </div>
          ))}

          {!showAdd ? (
            <button onClick={() => setShowAdd(true)} className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-primary text-primary text-sm font-medium flex items-center justify-center gap-1">
              <Plus className="h-4 w-4" /> Adicionar Criança
            </button>
          ) : (
            <div className="mt-3 space-y-3 p-3 rounded-xl bg-background border border-border">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da criança" className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground" />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Idade</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setNewAge(Math.max(0, newAge - 1))} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="text-lg font-bold text-foreground w-8 text-center">{newAge}</span>
                  <button onClick={() => setNewAge(Math.min(17, newAge + 1))} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><Plus className="h-3.5 w-3.5 text-primary-foreground" /></button>
                  <span className="text-xs text-muted-foreground">anos</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Alergias</label>
                <div className="flex flex-wrap gap-1.5">
                  {allergyOptions.map(a => (
                    <button key={a} onClick={() => toggleAllergy(a)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${newAllergies.includes(a) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl border border-border text-sm text-foreground">Cancelar</button>
                <button onClick={addChild} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Adicionar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <button onClick={() => navigate('family-activities')} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
          Entrar na Fila com Modo Família
        </button>
      </div>
    </div>
  );
};
