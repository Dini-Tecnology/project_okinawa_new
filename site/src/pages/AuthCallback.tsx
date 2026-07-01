import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabaseAuthService } from '@/lib/supabase-auth';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirmando sua sessão...');

  useEffect(() => {
    const confirmSession = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          await supabaseAuthService.exchangeCodeForSession(code);
        } else {
          await supabaseAuthService.getCurrentUser();
        }
        setStatus('success');
        setMessage('Sessão confirmada com sucesso.');
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Link inválido ou expirado.');
      }
    };

    confirmSession();
  }, []);

  const Icon = status === 'loading' ? Loader2 : status === 'success' ? CheckCircle2 : XCircle;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon className={`h-6 w-6 text-primary ${status === 'loading' ? 'animate-spin' : ''}`} />
          </div>
          <CardTitle>Autenticação Supabase</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" disabled={status === 'loading'}>
            <Link to="/admin">Ir para o painel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
