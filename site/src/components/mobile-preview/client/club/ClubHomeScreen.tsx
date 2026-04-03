import { useMobilePreview } from '../../context/MobilePreviewContext';
import { ArrowLeft, Music, Calendar, Clock, MapPin, Users, Ticket, Star, ChevronRight } from 'lucide-react';

const events = [
  {
    id: '1', name: 'Friday Night Party', artist: 'DJ Snake', genre: 'EDM / House',
    date: 'Sex, 31 Jan', time: '23:00 - 05:00', cover: 60, vipCover: 200,
    status: 'available' as const, venue: 'Club Okinawa',
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&h=300&fit=crop',
    remaining: 120,
  },
  {
    id: '2', name: 'Neon Jungle', artist: 'Alok', genre: 'Brazilian Bass',
    date: 'Sáb, 1 Fev', time: '22:00 - 06:00', cover: 80, vipCover: 300,
    status: 'available' as const, venue: 'Club Okinawa',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=300&fit=crop',
    remaining: 45,
  },
  {
    id: '3', name: 'Retro Wave', artist: 'DJ Vintage', genre: 'Synthwave',
    date: 'Sex, 7 Fev', time: '23:00 - 04:00', cover: 50, vipCover: 150,
    status: 'soldout' as const, venue: 'Club Okinawa',
    image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&h=300&fit=crop',
    remaining: 0,
  },
];

export const ClubHomeScreen = () => {
  const { goBack, navigate } = useMobilePreview();

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={goBack} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <div className="flex-1">
          <h1 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" /> Club & Balada
          </h1>
          <p className="text-xs text-muted-foreground">Club Okinawa</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-24 space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <button onClick={() => navigate('club-queue')} className="flex-1 p-3 rounded-2xl bg-card border border-border flex flex-col items-center gap-1.5">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-foreground">Fila Virtual</span>
          </button>
          <button onClick={() => navigate('vip-table')} className="flex-1 p-3 rounded-2xl bg-card border border-border flex flex-col items-center gap-1.5">
            <Star className="h-5 w-5 text-accent" />
            <span className="text-xs font-medium text-foreground">VIP</span>
          </button>
          <button onClick={() => navigate('birthday-booking')} className="flex-1 p-3 rounded-2xl bg-card border border-border flex flex-col items-center gap-1.5">
            <span className="text-lg">🎂</span>
            <span className="text-xs font-medium text-foreground">Aniversário</span>
          </button>
          <button onClick={() => navigate('lineup')} className="flex-1 p-3 rounded-2xl bg-card border border-border flex flex-col items-center gap-1.5">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Agenda</span>
          </button>
        </div>

        {/* Events */}
        <h2 className="font-semibold text-sm text-foreground">Próximos Eventos</h2>
        {events.map(event => (
          <div key={event.id} className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="relative h-32">
              <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-bold text-white text-sm">{event.name}</h3>
                <p className="text-xs text-white/80">{event.artist} • {event.genre}</p>
              </div>
              {event.status === 'soldout' && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-destructive text-white text-[10px] font-bold">ESGOTADO</div>
              )}
              {event.status === 'available' && event.remaining < 50 && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">Últimos {event.remaining}</div>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => event.status !== 'soldout' && navigate('ticket-purchase')}
                  disabled={event.status === 'soldout'}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 ${
                    event.status === 'soldout' ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <Ticket className="h-4 w-4" /> {event.status === 'soldout' ? 'Esgotado' : `A partir de R$ ${event.cover}`}
                </button>
                <button onClick={() => navigate('vip-table')} className="py-2.5 px-4 rounded-xl border border-border text-sm font-medium text-foreground flex items-center gap-1">
                  VIP <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
