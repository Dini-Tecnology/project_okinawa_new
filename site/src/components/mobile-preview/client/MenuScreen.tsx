import { useState } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { ArrowLeft, Search, Plus, Minus, ShoppingCart, Clock, AlertTriangle } from 'lucide-react';

const categories = ['Todos', 'Entradas', 'Principais', 'Massas', 'Sobremesas', 'Bebidas'];

const menuItems = [
  { id: '1', name: 'Bruschetta Caprese', description: 'Tomate fresco, mozzarella de búfala e manjericão', price: 32, category: 'Entradas', time: 10, image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=120&h=120&fit=crop', allergens: ['Glúten', 'Laticínios'] },
  { id: '2', name: 'Risoto de Camarão', description: 'Camarões salteados com arroz arbóreo e açafrão', price: 68, category: 'Principais', time: 25, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=120&h=120&fit=crop', allergens: ['Frutos do mar'] },
  { id: '3', name: 'Fettuccine Alfredo', description: 'Massa fresca com molho cremoso de parmesão', price: 52, category: 'Massas', time: 18, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023882a?w=120&h=120&fit=crop', allergens: ['Glúten', 'Laticínios'] },
  { id: '4', name: 'Tiramisù Classico', description: 'Mascarpone, café espresso e cacau', price: 28, category: 'Sobremesas', time: 5, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=120&h=120&fit=crop', allergens: ['Laticínios', 'Ovos'] },
  { id: '5', name: 'Filé Mignon Grelhado', description: 'Com molho de vinho tinto e legumes grelhados', price: 89, category: 'Principais', time: 30, image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=120&h=120&fit=crop', allergens: [] },
  { id: '6', name: 'Limonada Siciliana', description: 'Limão siciliano, hortelã e água com gás', price: 16, category: 'Bebidas', time: 3, image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=120&h=120&fit=crop', allergens: [] },
];

export const MenuScreen = () => {
  const { goBack, navigate, addToCart, cartItems } = useMobilePreview();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const filtered = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => {
      const newVal = Math.max(0, (prev[id] || 0) + delta);
      if (newVal === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newVal };
    });
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(quantities).reduce((sum, [id, qty]) => {
    const item = menuItems.find(i => i.id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);

  const handleGoToCart = () => {
    Object.entries(quantities).forEach(([id, qty]) => {
      const item = menuItems.find(i => i.id === id);
      if (item && qty > 0) {
        for (let i = 0; i < qty; i++) addToCart(item);
      }
    });
    navigate('cart');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={goBack} className="p-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-bold text-foreground flex-1">Cardápio</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar no cardápio..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-thin">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-32">
        {filtered.map(item => (
          <div key={item.id} className="flex gap-3 py-3 border-b border-border last:border-0">
            <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">{item.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />{item.time}min
                </span>
                {item.allergens.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-amber-500">
                    <AlertTriangle className="h-3 w-3" />{item.allergens[0]}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-sm text-primary">R$ {item.price.toFixed(2)}</span>
                <div className="flex items-center gap-2">
                  {(quantities[item.id] || 0) > 0 && (
                    <>
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                        <Minus className="h-3.5 w-3.5 text-foreground" />
                      </button>
                      <span className="text-sm font-semibold text-foreground w-5 text-center">{quantities[item.id]}</span>
                    </>
                  )}
                  <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <Plus className="h-3.5 w-3.5 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Bar */}
      {totalItems > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
          <button onClick={handleGoToCart} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Ver Carrinho ({totalItems} itens) • R$ {totalPrice.toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
};
