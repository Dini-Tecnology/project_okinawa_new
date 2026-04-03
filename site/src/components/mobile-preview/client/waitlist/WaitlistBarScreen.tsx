import { useState, useMemo } from 'react';
import { useMobilePreview } from '../../context/MobilePreviewContext';
import { ArrowLeft, Plus, Minus, ShoppingCart, Wine, Beer, Coffee, Droplets, Send } from 'lucide-react';

interface BarItem { id: string; name: string; price: number; icon: any; category: string; }
interface CartItem extends BarItem { quantity: number; }

const barMenu: BarItem[] = [
  { id: '1', name: 'Caipirinha', price: 22, icon: Wine, category: 'Drinks' },
  { id: '2', name: 'Cerveja Artesanal', price: 18, icon: Beer, category: 'Drinks' },
  { id: '3', name: 'Suco Natural', price: 12, icon: Coffee, category: 'Drinks' },
  { id: '4', name: 'Água com Gás', price: 8, icon: Droplets, category: 'Drinks' },
  { id: '5', name: 'Pão de Alho', price: 16, icon: ShoppingCart, category: 'Petiscos' },
  { id: '6', name: 'Bruschetta', price: 24, icon: ShoppingCart, category: 'Petiscos' },
];

export const WaitlistBarScreen = () => {
  const { goBack } = useMobilePreview();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);

  const addItem = (item: BarItem) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === id);
      if (ex && ex.quantity > 1) return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter(i => i.id !== id);
    });
  };

  if (submitted) {
    return (
      <div className="h-full flex flex-col bg-background items-center justify-center px-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
          <ShoppingCart className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Pedido Enviado!</h2>
        <p className="text-sm text-muted-foreground text-center mb-4">Seu pedido antecipado de R$ {subtotal.toFixed(2)} será entregue assim que você for acomodado.</p>
        <button onClick={goBack} className="py-2.5 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Voltar à Fila</button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">Peça enquanto espera</h1>
          <p className="text-xs text-muted-foreground">Seu pedido estará pronto na mesa</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 pb-32 space-y-3">
        {barMenu.map(item => {
          const cartItem = cart.find(i => i.id === item.id);
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <span className="text-sm font-bold text-primary mr-2">R$ {item.price}</span>
              <div className="flex items-center gap-1.5">
                {(cartItem?.quantity || 0) > 0 && (
                  <>
                    <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="text-sm font-semibold w-5 text-center text-foreground">{cartItem!.quantity}</span>
                  </>
                )}
                <button onClick={() => addItem(item)} className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"><Plus className="h-3.5 w-3.5 text-primary-foreground" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
          <button onClick={() => setSubmitted(true)} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
            <Send className="h-4 w-4" /> Enviar Pedido • R$ {subtotal.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
};
