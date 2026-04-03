import { useState } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { ArrowLeft, CreditCard, Smartphone, Banknote, Wallet, QrCode, Check, Plus, ChevronRight } from 'lucide-react';

const savedCards = [
  { id: '1', brand: 'Visa', last4: '4242', expiry: '12/27', isDefault: true },
  { id: '2', brand: 'Mastercard', last4: '8888', expiry: '03/26', isDefault: false },
];

const orderItems = [
  { name: 'Risoto de Camarão', qty: 1, price: 68 },
  { name: 'Bruschetta Caprese', qty: 2, price: 32 },
  { name: 'Limonada Siciliana', qty: 2, price: 16 },
];

export const PaymentScreen = () => {
  const { goBack, navigate } = useMobilePreview();
  const [paymentType, setPaymentType] = useState<string>('saved_card');
  const [selectedCard, setSelectedCard] = useState('1');

  const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.1;
  const tip = subtotal * 0.1;
  const total = subtotal + tax + tip;

  const methods = [
    { id: 'saved_card', label: 'Cartão Salvo', icon: CreditCard },
    { id: 'pix', label: 'PIX', icon: QrCode },
    { id: 'wallet', label: 'Carteira', icon: Wallet },
    { id: 'cash', label: 'Dinheiro', icon: Banknote },
    { id: 'apple_pay', label: 'Apple Pay', icon: Smartphone },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="font-display text-lg font-bold text-foreground">Pagamento</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 pb-28 space-y-4">
        {/* Order Summary */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-sm text-foreground mb-3">Resumo do Pedido</h3>
          {orderItems.map((item, i) => (
            <div key={i} className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">{item.qty}x {item.name}</span>
              <span className="text-foreground">R$ {(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border my-3" />
          <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">R$ {subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Taxa</span><span className="text-foreground">R$ {tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Gorjeta</span><span className="text-foreground">R$ {tip.toFixed(2)}</span></div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-bold text-primary text-lg">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-sm text-foreground mb-3">Método de Pagamento</h3>
          <div className="space-y-2">
            {methods.map(m => (
              <button
                key={m.id}
                onClick={() => setPaymentType(m.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  paymentType === m.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentType === m.id ? 'bg-primary/10' : 'bg-muted'}`}>
                  <m.icon className={`h-4 w-4 ${paymentType === m.id ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className="text-sm font-medium text-foreground flex-1 text-left">{m.label}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentType === m.id ? 'border-primary bg-primary' : 'border-border'}`}>
                  {paymentType === m.id && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Saved Cards (when card selected) */}
        {paymentType === 'saved_card' && (
          <div className="p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-foreground">Cartões Salvos</h3>
              <button className="flex items-center gap-1 text-xs text-primary font-medium">
                <Plus className="h-3 w-3" /> Novo
              </button>
            </div>
            {savedCards.map(card => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border mb-2 last:mb-0 transition-all ${
                  selectedCard === card.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{card.brand} •••• {card.last4}</p>
                  <p className="text-xs text-muted-foreground">Exp: {card.expiry}</p>
                </div>
                {card.isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Padrão</span>}
              </button>
            ))}
          </div>
        )}

        {/* PIX */}
        {paymentType === 'pix' && (
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <div className="w-32 h-32 mx-auto bg-muted rounded-xl flex items-center justify-center mb-3">
              <QrCode className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">O QR Code PIX será gerado ao confirmar o pagamento</p>
          </div>
        )}

        {/* Wallet */}
        {paymentType === 'wallet' && (
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Wallet className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="font-bold text-lg text-primary">R$ 250,00</p>
            <p className="text-xs text-muted-foreground mt-1">Saldo disponível na carteira</p>
          </div>
        )}
      </div>

      {/* Pay Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <button
          onClick={() => navigate('payment-success')}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          Pagar R$ {total.toFixed(2)}
        </button>
      </div>
    </div>
  );
};
