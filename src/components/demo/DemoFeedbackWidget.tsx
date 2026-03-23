/**
 * DemoFeedbackWidget — Contextual feedback for demo pages
 * Auto-captures: route, viewport mode, active role, journey step, recent actions
 * Discrete trigger button that expands into a rich form
 * Fully translated via DemoI18n
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  MessageSquarePlus, Bug, Lightbulb, MousePointerClick, HelpCircle,
  Star, Check, Loader2, Monitor, Smartphone, Tablet, MapPin, User, Route,
} from 'lucide-react';
import { toast } from 'sonner';
import { useDemoI18n } from '@/components/demo/DemoI18n';

// ─── Feedback types ───
const FEEDBACK_TYPE_KEYS = [
  { value: 'bug', icon: Bug, colorClass: 'text-destructive', tKey: 'typeBug' },
  { value: 'improvement', icon: Lightbulb, colorClass: 'text-warning', tKey: 'typeImprovement' },
  { value: 'usability', icon: MousePointerClick, colorClass: 'text-primary', tKey: 'typeUsability' },
  { value: 'question', icon: HelpCircle, colorClass: 'text-info', tKey: 'typeQuestion' },
] as const;

type FeedbackType = typeof FEEDBACK_TYPE_KEYS[number]['value'];

const VIEWPORT_ICONS: Record<string, React.ElementType> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

// ─── Action tracker (singleton) ───
const MAX_ACTIONS = 5;
let recentActionsBuffer: string[] = [];

export function trackDemoAction(action: string) {
  recentActionsBuffer = [...recentActionsBuffer.slice(-(MAX_ACTIONS - 1)), action];
}

// ─── Context interface ───
export interface DemoFeedbackContext {
  viewportMode?: string;
  activeRole?: string;
  journeyStep?: string;
  currentScreen?: string;
}

// ─── Component ───
const DemoFeedbackWidget: React.FC<{ context?: DemoFeedbackContext }> = ({ context }) => {
  const location = useLocation();
  const { t } = useDemoI18n();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('improvement');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [pulse, setPulse] = useState(false);

  const email = typeof window !== 'undefined' ? sessionStorage.getItem('demo-email') || '' : '';

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1500);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    trackDemoAction(`navigate:${location.pathname}`);
  }, [location.pathname]);

  useEffect(() => {
    if (context?.currentScreen) {
      trackDemoAction(`screen:${context.currentScreen}`);
    }
  }, [context?.currentScreen]);

  const resetForm = () => {
    setType('improvement');
    setRating(0);
    setHoverRating(0);
    setDescription('');
    setSent(false);
  };

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(resetForm, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!description.trim() && rating === 0) return;
    setSending(true);
    try {
      const payload: Record<string, unknown> = {
        email: email || null,
        feedback_type: type,
        rating: rating || null,
        description: description.trim(),
        page_route: location.pathname,
        demo_step: context?.journeyStep || null,
        viewport_mode: context?.viewportMode || null,
        active_role: context?.activeRole || null,
        journey_step: context?.journeyStep || null,
        recent_actions: recentActionsBuffer.length > 0 ? recentActionsBuffer : null,
      };

      const { error } = await supabase.from('demo_feedback').insert(payload as any);
      if (error) throw error;
      setSent(true);
      toast.success(t('feedback', 'toastSuccess'));
      setTimeout(() => setOpen(false), 1200);
    } catch {
      toast.error(t('feedback', 'toastError'));
    } finally {
      setSending(false);
    }
  };

  const activeRating = hoverRating || rating;
  const ViewportIcon = context?.viewportMode ? VIEWPORT_ICONS[context.viewportMode] || Monitor : null;

  return (
    <>
      {/* ── Floating trigger ── */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 group flex items-center gap-2 rounded-2xl border border-border bg-card/95 backdrop-blur-sm px-3 py-2.5 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:bg-card active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          pulse ? 'animate-pulse ring-2 ring-primary/20' : ''
        }`}
        aria-label={t('feedback', 'button')}
      >
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <MessageSquarePlus size={16} className="text-primary" />
        </div>
        <span className="text-xs font-semibold text-foreground hidden sm:inline group-hover:inline transition-all">
          {t('feedback', 'button')}
        </span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[440px] flex flex-col">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-lg font-bold">{t('feedback', 'title')}</SheetTitle>
            <SheetDescription className="text-sm">{t('feedback', 'subtitle')}</SheetDescription>
          </SheetHeader>

          {sent ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
                <Check size={28} className="text-success" />
              </div>
              <p className="text-foreground font-semibold">{t('feedback', 'successTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('feedback', 'successDesc')}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 pt-2 overflow-y-auto">
              {/* ── Auto-captured context ── */}
              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {t('feedback', 'contextLabel')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-card border border-border px-2 py-1 text-[10px] text-muted-foreground">
                    <MapPin size={10} className="shrink-0" />
                    {location.pathname}
                  </span>
                  {context?.viewportMode && ViewportIcon && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-card border border-border px-2 py-1 text-[10px] text-muted-foreground">
                      <ViewportIcon size={10} className="shrink-0" />
                      {context.viewportMode}
                    </span>
                  )}
                  {context?.activeRole && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-card border border-border px-2 py-1 text-[10px] text-muted-foreground">
                      <User size={10} className="shrink-0" />
                      {context.activeRole}
                    </span>
                  )}
                  {context?.journeyStep && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-card border border-border px-2 py-1 text-[10px] text-muted-foreground">
                      <Route size={10} className="shrink-0" />
                      {context.journeyStep}
                    </span>
                  )}
                </div>
                {recentActionsBuffer.length > 0 && (
                  <div className="mt-1.5">
                    <p className="text-[9px] font-medium text-muted-foreground/70 mb-1">{t('feedback', 'recentActions')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {recentActionsBuffer.map((action, i) => (
                        <span key={i} className="inline-block rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground font-mono">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Feedback type ── */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t('feedback', 'typeLabel')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {FEEDBACK_TYPE_KEYS.map(({ value, icon: Icon, colorClass, tKey }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-200 ${
                        type === value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/20 hover:bg-muted/50'
                      }`}
                      aria-pressed={type === value}
                    >
                      <Icon size={20} className={type === value ? colorClass : 'text-muted-foreground'} />
                      <span className={`text-[11px] font-medium leading-tight ${type === value ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {t('feedback', tKey)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Star rating ── */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t('feedback', 'ratingLabel')}</label>
                <div className="flex items-center gap-1" role="radiogroup" aria-label={t('feedback', 'ratingLabel')}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      role="radio"
                      aria-checked={rating === star}
                      aria-label={`${star}/5`}
                    >
                      <Star
                        size={28}
                        className={`transition-colors duration-150 ${
                          star <= activeRating ? 'text-warning fill-warning' : 'text-border'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Description ── */}
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2 block">{t('feedback', 'descriptionLabel')}</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('feedback', 'descriptionPlaceholder')}
                  className="flex-1 min-h-[100px] resize-none"
                  maxLength={2000}
                />
              </div>

              {/* ── Submit ── */}
              <Button
                onClick={handleSubmit}
                disabled={sending || (!description.trim() && rating === 0)}
                className="w-full"
                size="lg"
              >
                {sending ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    {t('feedback', 'sending')}
                  </>
                ) : (
                  t('feedback', 'submit')
                )}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default DemoFeedbackWidget;
