import { useState } from 'react';
import { useMobilePreview } from '../context/MobilePreviewContext';
import { ArrowLeft, Eye, EyeOff, Check, Shield, Mail, User, Lock } from 'lucide-react';

export const RegisterScreen = () => {
  const { navigate, goBack } = useMobilePreview();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const isValid = fullName && email && password && confirmPassword && acceptedTerms && confirmedAge && password === confirmPassword;

  const handleRegister = () => {
    if (isValid) navigate('home');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button onClick={goBack} className="p-1 rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 pb-24">
        <h1 className="font-display text-2xl font-bold text-center mb-6 text-foreground">Criar Conta</h1>

        {/* Full Name */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-1 block">Nome completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-1 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-1 block">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Crie uma senha"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-5">
          <label className="text-sm text-muted-foreground mb-1 block">Confirmar senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-destructive mt-1">As senhas não coincidem</p>
          )}
        </div>

        {/* Age Confirmation */}
        <label className="flex items-start gap-3 mb-3 cursor-pointer">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${confirmedAge ? 'bg-primary border-primary' : 'border-border'}`}>
            {confirmedAge && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <span className="text-sm text-foreground">Confirmo que tenho 18 anos ou mais</span>
        </label>

        {/* Terms */}
        <label className="flex items-start gap-3 mb-3 cursor-pointer">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${acceptedTerms ? 'bg-primary border-primary' : 'border-border'}`}>
            {acceptedTerms && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <span className="text-sm text-foreground">
            Li e aceito os <span className="text-primary font-medium">Termos de Uso</span> e <span className="text-primary font-medium">Política de Privacidade</span>
          </span>
        </label>

        {/* Marketing */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors ${marketingConsent ? 'bg-primary border-primary' : 'border-border'}`}>
            {marketingConsent && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <span className="text-sm text-muted-foreground">Aceito receber ofertas e novidades por email (opcional)</span>
        </label>

        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={!isValid}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
            isValid
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Criar Conta
        </button>

        {/* Login Link */}
        <button onClick={() => navigate('login')} className="w-full text-center py-3 text-sm text-primary font-medium">
          Já tem uma conta? Entrar
        </button>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>Seus dados estão protegidos com criptografia</span>
        </div>
      </div>
    </div>
  );
};
