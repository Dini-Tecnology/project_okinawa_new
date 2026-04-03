import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquarePlus, Bug, Lightbulb, MousePointerClick, HelpCircle, Star, Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const FEEDBACK_TYPES = [
  { value: 'bug', icon: Bug, colorClass: 'text-destructive' },
  { value: 'improvement', icon: Lightbulb, colorClass: 'text-warning' },
  { value: 'usability', icon: MousePointerClick, colorClass: 'text-primary' },
  { value: 'question', icon: HelpCircle, colorClass: 'text-info' },
] as const;

type FeedbackType = typeof FEEDBACK_TYPES[number]['value'];

const FeedbackWidget: React.FC = () => {
  const { t } = useLang();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('improvement');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Get email from sessionStorage (set during demo access)
  const email = typeof window !== 'undefined' ? sessionStorage.getItem('demo-email') || '' : '';

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
      const { error } = await supabase.from('demo_feedback').insert({
        email: email || null,
        feedback_type: type,
        rating: rating || null,
        description: description.trim(),
        page_route: location.pathname,
      });
      if (error) throw error;
      setSent(true);
      toast.success(t('fb.success'));
      setTimeout(() => setOpen(false), 1200);
    } catch {
      toast.error(t('fb.error'));
    } finally {
      setSending(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={t('fb.button_label')}
      >
        <MessageSquarePlus size={18} />
        <span className="text-sm font-semibold hidden sm:inline">{t('fb.button_label')}</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[420px] flex flex-col">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-lg font-bold">{t('fb.title')}</SheetTitle>
            <SheetDescription className="text-sm">{t('fb.subtitle')}</SheetDescription>
          </SheetHeader>

          {sent ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
                <Check size={28} className="text-success" />
              </div>
              <p className="text-foreground font-semibold">{t('fb.success')}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-5 pt-2">
              {/* Page context */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <span className="font-medium">{t('fb.page')}:</span>
                <code className="text-xs">{location.pathname}</code>
              </div>

              {/* Type selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t('fb.type')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {FEEDBACK_TYPES.map(({ value, icon: Icon, colorClass }) => (
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
                        {t(`fb.type_${value}`)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Star rating */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">{t('fb.rating')}</label>
                <div className="flex items-center gap-1" role="radiogroup" aria-label={t('fb.rating')}>
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
                          star <= activeRating
                            ? 'text-warning fill-warning'
                            : 'text-border'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-medium text-foreground mb-2 block">{t('fb.description')}</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('fb.description_placeholder')}
                  className="flex-1 min-h-[100px] resize-none"
                  maxLength={2000}
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={sending || (!description.trim() && rating === 0)}
                className="w-full"
                size="lg"
              >
                {sending ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    {t('fb.sending')}
                  </>
                ) : (
                  t('fb.submit')
                )}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FeedbackWidget;
