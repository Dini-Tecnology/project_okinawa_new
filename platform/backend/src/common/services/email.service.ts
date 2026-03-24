import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { CircuitBreakerService } from '@common/utils/circuit-breaker.module';
import { CircuitBreaker } from '@common/utils/circuit-breaker';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly isEnabled: boolean;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(
    private configService: ConfigService,
    private circuitBreakerService: CircuitBreakerService,
  ) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.isEnabled = !!apiKey && apiKey !== 'your-sendgrid-api-key';

    if (this.isEnabled && apiKey) {
      sgMail.setApiKey(apiKey);
      this.logger.log('SendGrid email service initialized');
    } else {
      this.logger.warn(
        'SendGrid API key not configured. Email sending is disabled.',
      );
    }

    this.circuitBreaker = this.circuitBreakerService.getBreaker('sendgrid', {
      failureThreshold: 5,
      resetTimeout: 60_000, // 1 minute before retrying SendGrid
      halfOpenMax: 1,
    });
  }

  /**
   * Send email using SendGrid
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isEnabled) {
      this.logger.warn(
        `Email sending is disabled. Would have sent email to ${options.to}`,
      );
      this.logger.debug(`Subject: ${options.subject}`);
      this.logger.debug(`HTML: ${options.html}`);
      return false;
    }

    const msg = {
      to: options.to,
      from: {
        email:
          this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
          'noreply@okinawa.com',
        name:
          this.configService.get<string>('SENDGRID_FROM_NAME') ||
          'Project Okinawa',
      },
      subject: options.subject,
      html: options.html,
      text: options.text || this.stripHtml(options.html),
    };

    return this.circuitBreaker.execute(
      async () => {
        await sgMail.send(msg);
        this.logger.log(`Email sent successfully to ${options.to}`);
        return true;
      },
      () => {
        this.logger.warn(
          `SendGrid circuit open — email to ${options.to} queued for later retry`,
        );
        return false;
      },
    );
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName?: string,
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8081';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    const expirationMinutes = 30;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - Project Okinawa</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #333;
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .content p {
      margin-bottom: 20px;
      color: #666;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning p {
      margin: 0;
      color: #856404;
      font-size: 14px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
      border-top: 1px solid #e9ecef;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .token-box {
      background-color: #f8f9fa;
      border: 2px dashed #dee2e6;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
      font-family: 'Courier New', monospace;
      font-size: 16px;
      color: #495057;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍜 Project Okinawa</h1>
    </div>
    <div class="content">
      <h2>Redefinir Senha</h2>
      <p>Olá${userName ? ` ${userName}` : ''},</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:</p>

      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Redefinir Senha</a>
      </div>

      <p style="margin-top: 30px;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
      <div class="token-box">${resetUrl}</div>

      <div class="warning">
        <p><strong>⏰ Este link expira em ${expirationMinutes} minutos.</strong></p>
        <p>Se você não solicitou esta redefinição de senha, ignore este email. Sua senha permanecerá inalterada.</p>
      </div>

      <p style="margin-top: 30px; color: #999; font-size: 14px;">
        Por questões de segurança, nunca compartilhe este link com outras pessoas.
      </p>
    </div>
    <div class="footer">
      <p>Este é um email automático, por favor não responda.</p>
      <p>© ${new Date().getFullYear()} Project Okinawa. Todos os direitos reservados.</p>
      <p>
        <a href="${frontendUrl}/privacy">Política de Privacidade</a> |
        <a href="${frontendUrl}/terms">Termos de Uso</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Redefinir Senha - Project Okinawa

Olá${userName ? ` ${userName}` : ''},

Recebemos uma solicitação para redefinir a senha da sua conta.

Para criar uma nova senha, acesse o link abaixo:
${resetUrl}

Este link expira em ${expirationMinutes} minutos.

Se você não solicitou esta redefinição de senha, ignore este email. Sua senha permanecerá inalterada.

Por questões de segurança, nunca compartilhe este link com outras pessoas.

---
Este é um email automático, por favor não responda.
© ${new Date().getFullYear()} Project Okinawa. Todos os direitos reservados.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Redefinir Senha - Project Okinawa',
      html,
      text,
    });
  }

  /**
   * Send password changed confirmation email
   */
  async sendPasswordChangedEmail(
    email: string,
    userName?: string,
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:8081';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Senha Alterada - Project Okinawa</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .success-icon {
      font-size: 64px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #333;
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .content p {
      margin-bottom: 20px;
      color: #666;
    }
    .alert {
      background-color: #fee;
      border-left: 4px solid #dc3545;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert p {
      margin: 0;
      color: #721c24;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
      border-top: 1px solid #e9ecef;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">✓</div>
      <h1>Senha Alterada com Sucesso</h1>
    </div>
    <div class="content">
      <h2>Sua senha foi atualizada</h2>
      <p>Olá${userName ? ` ${userName}` : ''},</p>
      <p>Confirmamos que a senha da sua conta Project Okinawa foi alterada com sucesso em <strong>${new Date().toLocaleString('pt-BR')}</strong>.</p>

      <div class="alert">
        <p><strong>⚠️ Você não reconhece esta alteração?</strong></p>
        <p>Se você não solicitou esta mudança, entre em contato conosco imediatamente através do suporte.</p>
      </div>

      <div style="text-align: center;">
        <a href="${frontendUrl}/support" class="button">Entrar em Contato com Suporte</a>
      </div>

      <p style="margin-top: 30px; color: #999; font-size: 14px;">
        Por questões de segurança, recomendamos que você altere sua senha regularmente e nunca compartilhe suas credenciais.
      </p>
    </div>
    <div class="footer">
      <p>Este é um email automático, por favor não responda.</p>
      <p>© ${new Date().getFullYear()} Project Okinawa. Todos os direitos reservados.</p>
      <p>
        <a href="${frontendUrl}/privacy">Política de Privacidade</a> |
        <a href="${frontendUrl}/terms">Termos de Uso</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Senha Alterada com Sucesso - Project Okinawa

Olá${userName ? ` ${userName}` : ''},

Confirmamos que a senha da sua conta Project Okinawa foi alterada com sucesso em ${new Date().toLocaleString('pt-BR')}.

⚠️ Você não reconhece esta alteração?
Se você não solicitou esta mudança, entre em contato conosco imediatamente através do suporte: ${frontendUrl}/support

Por questões de segurança, recomendamos que você altere sua senha regularmente e nunca compartilhe suas credenciais.

---
Este é um email automático, por favor não responda.
© ${new Date().getFullYear()} Project Okinawa. Todos os direitos reservados.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Senha Alterada - Project Okinawa',
      html,
      text,
    });
  }

  /**
   * Strip HTML tags from string
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}
