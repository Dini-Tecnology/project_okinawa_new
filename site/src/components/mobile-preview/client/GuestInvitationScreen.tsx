import { useState } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { ArrowLeft, UserPlus, X, Send, Link, Search, Check, Clock, Users } from 'lucide-react';

const currentGuests = [
  { id: '1', name: 'Você', status: 'accepted' as const, isHost: true, avatar: 'VO' },
  { id: '2', name: 'Ana Silva', status: 'accepted' as const, isHost: false, avatar: 'AS', method: 'App' },
  { id: '3', name: 'Carlos Lima', status: 'pending' as const, isHost: false, avatar: 'CL', method: 'SMS' },
];

const contacts = [
  { id: 'c1', name: 'Bruno Costa', phone: '+55 11 99876-5432', isAppUser: true },
  { id: 'c2', name: 'Daniela Souza', phone: '+55 11 98765-4321', isAppUser: true },
  { id: 'c3', name: 'Eduardo Martins', phone: '+55 11 97654-3210', isAppUser: false },
  { id: 'c4', name: 'Fernanda Oliveira', email: 'fer@email.com', isAppUser: false },
];

const statusColors: Record<string, string> = {
  accepted: 'bg-emerald-500',
  pending: 'bg-amber-500',
  declined: 'bg-destructive',
};

const statusLabels: Record<string, string> = {
  accepted: 'Confirmado',
  pending: 'Pendente',
  declined: 'Recusado',
};

export const GuestInvitationScreen = () => {
  const { goBack } = useMobilePreview();
  const [search, setSearch] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  const partySize = 6;
  const confirmed = currentGuests.filter(g => g.status === 'accepted').length;
  const pending = currentGuests.filter(g => g.status === 'pending').length;
  const remaining = partySize - confirmed;

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="font-display text-lg font-bold text-foreground">Convidar Amigos</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 pb-24 space-y-4">
        {/* Summary Card */}
        <div className="p-4 rounded-2xl bg-primary text-primary-foreground">
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-2xl font-bold">{confirmed}</p>
              <p className="text-xs opacity-80">Confirmados</p>
            </div>
            <div className="w-px bg-primary-foreground/30" />
            <div className="text-center">
              <p className="text-2xl font-bold">{pending}</p>
              <p className="text-xs opacity-80">Pendentes</p>
            </div>
            <div className="w-px bg-primary-foreground/30" />
            <div className="text-center">
              <p className={`text-2xl font-bold ${remaining <= 0 ? 'text-amber-300' : ''}`}>{remaining}</p>
              <p className="text-xs opacity-80">Vagas</p>
            </div>
          </div>
        </div>

        {/* Current Guests */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" /> Convidados ({currentGuests.length})
          </h3>
          {currentGuests.map(guest => (
            <div key={guest.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <div className={`w-9 h-9 rounded-full ${statusColors[guest.status]} flex items-center justify-center text-white text-xs font-bold`}>
                {guest.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{guest.name}</span>
                  {guest.isHost && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">Host</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full text-white ${statusColors[guest.status]}`}>
                    {statusLabels[guest.status]}
                  </span>
                  {guest.method && <span className="text-[10px] text-muted-foreground">via {guest.method}</span>}
                </div>
              </div>
              {!guest.isHost && guest.status === 'pending' && (
                <button className="p-1 text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
              )}
            </div>
          ))}
        </div>

        {/* Invite from Contacts */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <h3 className="font-semibold text-sm text-foreground mb-3">Convidar Contatos</h3>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar contatos..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none"
            />
          </div>
          {filteredContacts.map(contact => (
            <div key={contact.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {contact.name.split(' ').map(w => w[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.phone || contact.email}</p>
              </div>
              {contact.isAppUser && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">No app</span>}
              <button className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <UserPlus className="h-3.5 w-3.5 text-primary-foreground" />
              </button>
            </div>
          ))}
        </div>

        {/* Manual Add */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          {!showManual ? (
            <button onClick={() => setShowManual(true)} className="w-full py-2.5 rounded-xl border border-dashed border-primary text-primary text-sm font-medium flex items-center justify-center gap-2">
              <UserPlus className="h-4 w-4" /> Adicionar Manualmente
            </button>
          ) : (
            <div className="space-y-3">
              <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Nome" className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground" />
              <input value={manualPhone} onChange={e => setManualPhone(e.target.value)} placeholder="Telefone ou email" className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground" />
              <div className="flex gap-2">
                <button onClick={() => setShowManual(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground">Cancelar</button>
                <button className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1">
                  <Send className="h-3.5 w-3.5" /> Enviar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Share Link */}
        <button className="w-full py-3 rounded-xl border border-border text-foreground font-medium text-sm flex items-center justify-center gap-2">
          <Link className="h-4 w-4" /> Compartilhar Link de Convite
        </button>
      </div>
    </div>
  );
};
