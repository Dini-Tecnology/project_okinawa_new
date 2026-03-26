# NOOWE — Guia Completo de Configuração para Produção

> Documento gerado em 2026-03-26. Cobre **TODAS** as variáveis de ambiente, URLs, credenciais de terceiros, configurações mobile e ações manuais necessárias antes do go-live.

---

## Índice

1. [Variáveis de Ambiente — Backend](#1-variáveis-de-ambiente--backend)
2. [Variáveis de Ambiente — Mobile](#2-variáveis-de-ambiente--mobile)
3. [Configuração Mobile (app.json / EAS)](#3-configuração-mobile)
4. [Credenciais de Terceiros](#4-credenciais-de-terceiros)
5. [GitHub Actions Secrets](#5-github-actions-secrets)
6. [URLs e Domínios](#6-urls-e-domínios)
7. [Database Setup](#7-database-setup)
8. [Docker & Infraestrutura](#8-docker--infraestrutura)
9. [Checklist de Segurança](#9-checklist-de-segurança)
10. [Ações Manuais Pendentes](#10-ações-manuais-pendentes)
11. [Script de Deploy Rápido](#11-script-de-deploy-rápido)

---

## 1. Variáveis de Ambiente — Backend

**Arquivo:** `.env` no diretório `platform/backend/` (copiar de `.env.example`)

### 1.1 Aplicação (Obrigatórias)

| Variável | Obrigatória | Default Dev | Valor Produção | Gerar com |
|----------|:-----------:|-------------|----------------|-----------|
| `NODE_ENV` | Sim | development | **production** | — |
| `PORT` | Não | 3000 | 3000 | — |

### 1.2 Banco de Dados (PostgreSQL 16 + PostGIS)

| Variável | Obrigatória | Default | Valor Produção | Notas |
|----------|:-----------:|---------|----------------|-------|
| `DATABASE_HOST` | **Sim** | localhost | `pg.rds.amazonaws.com` | Endpoint RDS/managed DB |
| `DATABASE_PORT` | Não | 5432 | 5432 | — |
| `DATABASE_USER` | **Sim** | okinawa | `noowe_prod` | Usuário com permissões mínimas |
| `DATABASE_PASSWORD` | **Sim** | — | `[min 32 chars]` | `openssl rand -base64 24` |
| `DATABASE_NAME` | **Sim** | okinawa | `noowe` | — |
| `DATABASE_SSL` | **Sim** (prod) | false | **true** | Obrigatório em produção |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | Não | true | true | Manter true |
| `DATABASE_SYNCHRONIZE` | — | false | **false** | NUNCA true em produção |
| `DATABASE_LOGGING` | Não | true | **false** | Desabilitar para performance |
| `DATABASE_POOL_MAX` | Não | 20 | 20-30 | Ajustar conforme carga |
| `DATABASE_POOL_MIN` | Não | 2 | 5 | — |
| `DATABASE_CONNECTION_TIMEOUT` | Não | 10000 | 10000 | ms |
| `DATABASE_IDLE_TIMEOUT` | Não | 30000 | 30000 | ms |
| `DATABASE_STATEMENT_TIMEOUT` | Não | 30000 | 30000 | Query timeout (ms) |
| `DATABASE_IDLE_IN_TRANSACTION_TIMEOUT` | Não | 60000 | 60000 | Transaction idle timeout (ms) |

### 1.3 Redis

| Variável | Obrigatória | Default | Valor Produção |
|----------|:-----------:|---------|----------------|
| `REDIS_HOST` | **Sim** | localhost | `redis.prod.internal` |
| `REDIS_PORT` | Não | 6379 | 6379 |
| `REDIS_PASSWORD` | **Sim** (prod) | — | `[min 32 chars]` |

### 1.4 Secrets (TODAS obrigatórias, TODAS diferentes entre si)

| Variável | Min Chars | Gerar com | Rotação |
|----------|:---------:|-----------|---------|
| `JWT_SECRET` | 32 | `openssl rand -base64 24` | Trimestral |
| `JWT_REFRESH_SECRET` | 32 | `openssl rand -base64 24` | Trimestral |
| `CSRF_SECRET` | 32 | `openssl rand -base64 24` | Trimestral |
| `FIELD_ENCRYPTION_KEY` | 32 | `openssl rand -base64 24` | Anual (requer re-encrypt) |

> **IMPORTANTE:** Cada secret DEVE ser um valor único. Nunca reutilizar o mesmo valor.

### 1.5 CORS & Segurança

| Variável | Obrigatória | Default | Valor Produção |
|----------|:-----------:|---------|----------------|
| `CORS_ORIGIN` | **Sim** (prod) | localhost:3000 | `https://noowebr.com,https://app.noowebr.com` |
| `CORS_CREDENTIALS` | Não | false | true (se usar cookies) |
| `SWAGGER_ENABLED` | Não | false | **false** (nunca em prod) |
| `METRICS_ENABLED` | Não | false | true (se Prometheus ativo) |
| `TRUSTED_PROXIES` | Não | redes privadas | IPs do load balancer |

### 1.6 Rate Limiting

| Variável | Default | Descrição |
|----------|---------|-----------|
| `THROTTLE_TTL` | 60000 | Janela de tempo (ms) |
| `THROTTLE_LIMIT` | 100 | Requests por janela (API geral) |
| `THROTTLE_STRICT_LIMIT` | 10 | Requests por janela (auth) |
| `THROTTLE_PAYMENT_LIMIT` | 30 | Requests por janela (pagamentos) |

### 1.7 Logging

| Variável | Default | Valor Produção |
|----------|---------|----------------|
| `LOG_LEVEL` | debug | **info** ou **warn** |

---

## 2. Variáveis de Ambiente — Mobile

**Configurar via:** EAS Build environment (`eas.json` → `build.production.env`) ou `eas secret:create`

| Variável | Valor Produção | Obrigatória |
|----------|----------------|:-----------:|
| `API_BASE_URL` | `https://api.noowebr.com` | **Sim** |
| `WS_URL` | `wss://api.noowebr.com` | **Sim** |
| `SENTRY_DSN` | `https://[key]@sentry.io/[id]` | Recomendado |
| `FIREBASE_PROJECT_ID` | `[Firebase Project]` | Sim (push) |
| `FIREBASE_APP_ID` | `[Firebase App]` | Sim (push) |
| `FIREBASE_API_KEY` | `[Firebase Key]` | Sim (push) |
| `FIREBASE_MESSAGING_SENDER_ID` | `[Sender ID]` | Sim (push) |
| `APP_STORE_URL` | `https://apps.apple.com/app/noowe/id[ID]` | Após publicação |
| `PLAY_STORE_URL` | `https://play.google.com/store/apps/details?id=com.noowe.client` | Após publicação |

---

## 3. Configuração Mobile

### 3.1 Bundle IDs (ambos app.json)

| App | Campo | Valor Atual | Valor Produção |
|-----|-------|-------------|----------------|
| Client iOS | bundleIdentifier | com.okinawa.client | **com.noowe.client** |
| Client Android | package | com.okinawa.client | **com.noowe.client** |
| Restaurant iOS | bundleIdentifier | com.okinawa.restaurant | **com.noowe.restaurant** |
| Restaurant Android | package | com.okinawa.restaurant | **com.noowe.restaurant** |

### 3.2 EAS Project IDs

| App | Localização | Valor Atual | Ação |
|-----|-------------|-------------|------|
| Client | `apps/client/app.json` → extra.eas.projectId | `your-project-id` | **Substituir pelo ID real do EAS** |
| Restaurant | `apps/restaurant/app.json` → extra.eas.projectId | `your-project-id` | **Substituir pelo ID real do EAS** |

### 3.3 EAS Submit (eas.json)

| Campo | Valor Atual | Ação |
|-------|-------------|------|
| ios.appleId | PLACEHOLDER | **Email do Apple ID** |
| ios.ascAppId | PLACEHOLDER | **App Store Connect App ID** |
| ios.appleTeamId | PLACEHOLDER | **Apple Developer Team ID** |
| android.serviceAccountKeyPath | ./google-services.json | **Path para JSON do Google Play Console** |

---

## 4. Credenciais de Terceiros

Todos opcionais — sistema degrada graciosamente se ausentes.

| Serviço | Variável(is) | Onde Obter | Impacto se Ausente |
|---------|-------------|------------|---------------------|
| **Google OAuth** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | console.cloud.google.com | Login social Google indisponível |
| **Apple Sign In** | `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | developer.apple.com | Login social Apple indisponível |
| **SendGrid** | `SENDGRID_API_KEY` | sendgrid.com/settings/api_keys | Emails transacionais desabilitados |
| **Firebase** | `FCM_SERVER_KEY`, `FCM_PROJECT_ID` | firebase.google.com | Push notifications desabilitadas |
| **Asaas** | `ASAAS_API_KEY`, `ASAAS_ENVIRONMENT=production` | asaas.com | Pagamentos simulados (não processados) |
| **OpenAI** | `OPENAI_API_KEY` | platform.openai.com | Fallback para análise rule-based |
| **Sentry** | `SENTRY_DSN` | sentry.io | Error tracking desabilitado |
| **AWS S3** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` | AWS IAM | Upload de arquivos desabilitado |
| **Twilio** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SERVICE_SID` | twilio.com | SMS/OTP via Twilio desabilitado |
| **AWS SNS** | `AWS_SNS_ACCESS_KEY`, `AWS_SNS_SECRET_KEY` | AWS IAM | SMS via SNS desabilitado |

### Callbacks OAuth (ajustar para domínio real)

```
GOOGLE_CALLBACK_URL=https://api.noowebr.com/api/v1/auth/google/callback
APPLE_CALLBACK_URL=https://api.noowebr.com/api/v1/auth/apple/callback
MICROSOFT_CALLBACK_URL=https://api.noowebr.com/api/v1/auth/microsoft/callback
ASAAS_WEBHOOK_URL=https://api.noowebr.com/api/v1/webhooks/asaas
```

---

## 5. GitHub Actions Secrets

Configurar em: **GitHub → Settings → Secrets and variables → Actions**

| Secret | Obrigatório | Descrição |
|--------|:-----------:|-----------|
| `DEPLOY_SSH_KEY` | **Sim** | Chave SSH privada para deploy nos servidores |
| `STAGING_HOST` | **Sim** | IP/hostname do servidor staging |
| `STAGING_USER` | **Sim** | Usuário SSH no staging (ex: `deploy`) |
| `STAGING_DEPLOY_DIR` | **Sim** | Diretório de deploy (ex: `/opt/noowe`) |
| `PRODUCTION_HOST` | **Sim** | IP/hostname do servidor produção |
| `PRODUCTION_USER` | **Sim** | Usuário SSH na produção |
| `PRODUCTION_DEPLOY_DIR` | **Sim** | Diretório de deploy produção |
| `SLACK_WEBHOOK_URL` | Não | Webhook Slack para notificações de deploy |

### Environments (GitHub)

Criar 2 environments em **Settings → Environments**:

1. **staging** — URL: `https://staging.noowebr.com`
2. **production** — URL: `https://noowebr.com` — Habilitar **Required reviewers** para approval gate

---

## 6. URLs e Domínios

### 6.1 DNS Records Necessários

| Subdomínio | Tipo | Destino | Uso |
|------------|------|---------|-----|
| `noowebr.com` | A/CNAME | IP do CDN/LB | Site principal |
| `api.noowebr.com` | A/CNAME | IP do backend | API REST + WebSocket |
| `staging.noowebr.com` | A/CNAME | IP staging | Ambiente staging |
| `status.noowebr.com` | CNAME | statuspage | Página de status |

### 6.2 Verificações de Domínio

- **Apple Associated Domains:** Servir `apple-app-site-association` em `https://noowebr.com/.well-known/`
- **Android App Links:** Servir `assetlinks.json` em `https://noowebr.com/.well-known/`
- **robots.txt:** Já configurado em `site/public/robots.txt` com domínio `noowebr.com`
- **sitemap.xml:** Já configurado em `site/public/sitemap.xml` com domínio `noowebr.com`

---

## 7. Database Setup

### Pré-deploy (uma vez)

```bash
# 1. Criar database com PostGIS
psql -h $DATABASE_HOST -U postgres -c "CREATE DATABASE noowe;"
psql -h $DATABASE_HOST -U postgres -d noowe -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql -h $DATABASE_HOST -U postgres -d noowe -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# 2. Criar usuário com permissões mínimas
psql -h $DATABASE_HOST -U postgres -c "CREATE USER noowe_prod WITH PASSWORD '[password]';"
psql -h $DATABASE_HOST -U postgres -d noowe -c "GRANT CONNECT ON DATABASE noowe TO noowe_prod;"
psql -h $DATABASE_HOST -U postgres -d noowe -c "GRANT USAGE ON SCHEMA public TO noowe_prod;"
psql -h $DATABASE_HOST -U postgres -d noowe -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO noowe_prod;"
psql -h $DATABASE_HOST -U postgres -d noowe -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO noowe_prod;"

# 3. Rodar migrations
cd platform/backend && npm run typeorm:migration:run
```

### Em cada deploy

```bash
npm run typeorm:migration:run  # Automático no deploy.yml
```

### Backup

Já configurado no `docker-compose.yml` (service `db-backup`):
- Diário com retenção 7 dias
- Semanal com retenção 4 semanas
- Mensal com retenção 3 meses

---

## 8. Docker & Infraestrutura

### Build de produção

```bash
docker buildx build \
  --target production \
  --tag ghcr.io/dinipedro/project_okinawa/backend:$(git rev-parse --short HEAD) \
  ./platform/backend
```

### Iniciar serviços

```bash
# Produção (backend + worker + postgres + redis + backup)
docker compose --profile prod up -d

# Apenas ferramentas (pgadmin)
docker compose --profile tools up -d
```

### Resource Limits (já configurados)

| Container | Memória | CPU |
|-----------|---------|-----|
| backend | 1 GB | 1.0 |
| worker | 512 MB | 0.5 |

---

## 9. Checklist de Segurança

- [ ] 6 secrets gerados com `openssl rand -base64 24` (todos diferentes)
- [ ] `DATABASE_SSL=true` em produção
- [ ] `CORS_ORIGIN` configurado com domínios explícitos (sem `*`)
- [ ] `SWAGGER_ENABLED` NÃO definido (ou `false`)
- [ ] `NODE_ENV=production`
- [ ] Secrets armazenados em gerenciador seguro (não em código)
- [ ] Usuário de banco com permissões mínimas (não superuser)
- [ ] SSH keys de deploy restritas ao servidor
- [ ] GitHub Environments com required reviewers para produção
- [ ] Certificados SSL configurados e com renovação automática
- [ ] `LOG_LEVEL=info` ou `warn` (nunca `debug` em produção)

---

## 10. Ações Manuais Pendentes

### Criticidade Alta (antes do go-live)

| # | Ação | Responsável | Detalhes |
|---|------|-------------|----------|
| 1 | Assinar DPAs com terceiros | **Legal** | Enviar `docs/DPA-TEMPLATE.md` para: Stripe, OpenAI, Firebase, Sentry, SendGrid |
| 2 | Definir escala de on-call | **Gestão** | Quem responde a incidentes, canais de comunicação, rotação |
| 3 | Substituir EAS Project IDs | **DevOps** | Criar projetos no EAS e atualizar ambos `app.json` |
| 4 | Alterar bundle IDs para com.noowe.* | **DevOps** | Client + Restaurant, iOS + Android |
| 5 | Gerar todos os secrets de produção | **DevOps** | 4 secrets + 2 passwords = 6 valores únicos de 32+ chars |
| 6 | Configurar DNS para noowebr.com | **DevOps** | api.noowebr.com, staging.noowebr.com, status.noowebr.com |

### Criticidade Média (até 7 dias após go-live)

| # | Ação | Responsável | Detalhes |
|---|------|-------------|----------|
| 7 | Configurar CDN (CloudFront/Cloudflare) | **DevOps** | Assets estáticos do site e mobile |
| 8 | Criar Apple Distribution Certificate | **DevOps** | Apple Developer Program → Certificates |
| 9 | Gerar Android Keystore de produção | **DevOps** | `keytool -genkey`, backup seguro, Google Play App Signing |
| 10 | Criar screenshots para stores | **Design** | iOS: 6.5" + 5.5", Android: phone + tablet |
| 11 | Configurar alertas de custo na cloud | **DevOps** | Budget threshold 80% |
| 12 | Finalizar RIPD com dados da empresa | **Legal** | Preencher `docs/RIPD-TEMPLATE.md` com CNPJ, endereço, DPO |

### Criticidade Baixa (até 30 dias)

| # | Ação | Responsável | Detalhes |
|---|------|-------------|----------|
| 13 | Configurar WAF | **DevOps** | Seguir `docs/WAF-CONFIGURATION.md` |
| 14 | Executar load tests | **DevOps** | `k6 run platform/backend/test/load/load-test.js` |
| 15 | Configurar status page | **DevOps** | Seguir `docs/STATUS-PAGE.md` |
| 16 | Executar DR drill | **Time** | Seguir `docs/DISASTER-RECOVERY.md` |
| 17 | Configurar Playwright CI | **Frontend** | `npm i -D @playwright/test && npx playwright install` |

---

## 11. Script de Deploy Rápido

```bash
#!/bin/bash
set -euo pipefail

echo "=== NOOWE Production Deploy ==="

# 1. Gerar secrets (EXECUTAR APENAS UMA VEZ)
echo "[1/6] Generating secrets..."
JWT_SECRET=$(openssl rand -base64 24)
JWT_REFRESH_SECRET=$(openssl rand -base64 24)
CSRF_SECRET=$(openssl rand -base64 24)
FIELD_ENCRYPTION_KEY=$(openssl rand -base64 24)
DB_PASSWORD=$(openssl rand -base64 24)
REDIS_PASSWORD=$(openssl rand -base64 24)

echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo "CSRF_SECRET=$CSRF_SECRET"
echo "FIELD_ENCRYPTION_KEY=$FIELD_ENCRYPTION_KEY"
echo "DATABASE_PASSWORD=$DB_PASSWORD"
echo "REDIS_PASSWORD=$REDIS_PASSWORD"
echo ""
echo "⚠️  SALVE ESTES VALORES EM LOCAL SEGURO!"
echo ""

# 2. Criar .env de produção
echo "[2/6] Creating production .env..."
cat > platform/backend/.env << EOF
NODE_ENV=production
PORT=3000

# Database
DATABASE_HOST=SUBSTITUIR
DATABASE_PORT=5432
DATABASE_USER=noowe_prod
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_NAME=noowe
DATABASE_SSL=true
DATABASE_POOL_MAX=20

# Redis
REDIS_HOST=SUBSTITUIR
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# Secrets
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
CSRF_SECRET=$CSRF_SECRET
FIELD_ENCRYPTION_KEY=$FIELD_ENCRYPTION_KEY

# CORS
CORS_ORIGIN=https://noowebr.com,https://app.noowebr.com
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
SWAGGER_ENABLED=false
METRICS_ENABLED=false
EOF

echo "✅ .env criado. Substitua DATABASE_HOST e REDIS_HOST."

# 3. Build
echo "[3/6] Building Docker image..."
docker buildx build --target production \
  --tag noowe-backend:$(date +%Y%m%d) \
  ./platform/backend

# 4. Migrations
echo "[4/6] Running migrations..."
cd platform/backend && npm run typeorm:migration:run && cd ../..

# 5. Start
echo "[5/6] Starting services..."
docker compose --profile prod up -d

# 6. Health check
echo "[6/6] Checking health..."
sleep 10
curl -sf http://localhost:3000/api/v1/health | jq .status
echo ""
echo "🚀 Deploy concluído!"
```

---

## Resumo de Contagem

| Categoria | Total | Obrigatórios | Opcionais |
|-----------|:-----:|:------------:|:---------:|
| Env vars backend | 50+ | 15 | 35+ |
| Env vars mobile | 12 | 6 | 6 |
| GitHub Secrets | 8 | 6 | 2 |
| Configurações app.json | 8 | 6 | 2 |
| Credenciais terceiros | 18 | 0 | 18 |
| Ações manuais | 17 | 6 | 11 |
| **Total** | **~113** | **39** | **74** |

> **39 itens obrigatórios** antes do go-live. 74 opcionais que podem ser configurados progressivamente.

---

## 12. Pendências de Submissão às Stores (Mobile)

> Itens mapeados na auditoria de Store Submission. Todos requerem ação humana.

### 12.1 Ações Obrigatórias Antes de Submeter (Bloqueadoras)

| # | Ação | Responsável | Detalhes | Esforço |
|---|------|-------------|----------|---------|
| S1 | Criar assets visuais do restaurant app | **Design** | `apps/restaurant/assets/`: icon.png (1024x1024), splash.png (2048x2048), adaptive-icon.png, notification-icon.png, favicon.png | 4h |
| S2 | Criar EAS projects e substituir projectId | **DevOps** | `eas project:create` para client e restaurant. Atualizar `extra.eas.projectId` nos 2 `app.json` | 0.5h |
| S3 | Popular credenciais Apple no eas.json | **DevOps** | `appleId`, `ascAppId`, `appleTeamId` — obter do Apple Developer Program | 1h |
| S4 | Gerar google-services.json | **DevOps** | Firebase Console → Project Settings → Add Android app → Download `google-services.json` → colocar na raiz do projeto mobile | 1h |
| S5 | Gerar Google Play Service Account Key | **DevOps** | Google Play Console → Setup → API Access → Create Service Account → Download JSON key → atualizar `serviceAccountKeyPath` no eas.json | 0.5h |

### 12.2 Store Metadata — App Store Connect (iOS)

| # | Ação | Responsável | Detalhes | Esforço |
|---|------|-------------|----------|---------|
| S6 | Screenshots Client App — iOS | **Design** | 3 tamanhos obrigatórios: iPhone 6.9" (1320x2868), 6.5" (1242x2688), 5.5" (1242x2208). Mínimo 5 screenshots por tamanho. Mostrar: Home, Menu, Cart, Payment, Orders | 4h |
| S7 | Screenshots Restaurant App — iOS | **Design** | Mesmos tamanhos. Mostrar: KDS, Orders, Tables, Dashboard, Config | 2h |
| S8 | Privacy Nutrition Labels | **Product** | App Store Connect → App Privacy: declarar dados coletados (localização, email, nome, pagamento), finalidade, linked-to-user. Deve bater com o comportamento real do app | 1h |
| S9 | Age Rating (IARC) | **Product** | App Store Connect → Content Ratings: preencher questionário honestamente. App de restaurante = sem conteúdo restrito = classificação livre (4+) | 0.5h |
| S10 | Conta de teste para revisor | **Product** | Criar user demo com: pedidos existentes, reservas, favoritos, wallet com saldo. Fornecer email/senha nas Review Notes. Se usa OTP, fornecer bypass | 0.5h |
| S11 | Review Notes | **Product** | Explicar: "App para gestão de restaurantes e pedidos de comida. Pagamentos são para bens físicos (comida), não conteúdo digital — IAP não é necessário." | 0.5h |
| S12 | Textos da loja (pt-BR) | **Product** | Título (máx 30 chars): "NOOWE" ou "NOOWE Restaurantes". Subtítulo (máx 30 chars). Descrição (máx 4000 chars). Palavras-chave (máx 100 chars). Sem "Grátis", "#1", "Melhor" | 1h |

### 12.3 Store Metadata — Google Play Console (Android)

| # | Ação | Responsável | Detalhes | Esforço |
|---|------|-------------|----------|---------|
| S13 | Screenshots Client App — Android | **Design** | Phone (1080x1920+): mín 2, recomendado 5-8. Tablet 7" e 10" (recomendado). Mesmas telas do iOS | 2h |
| S14 | Feature Graphic | **Design** | 1024x500px JPG/PNG para ambos apps. Usado no topo da listagem do Play Store | 1h |
| S15 | Data Safety Section | **Product** | Play Console → App Content → Data Safety: declarar todos os dados coletados, finalidade, compartilhamento com terceiros, criptografia em trânsito, exclusão disponível | 1h |
| S16 | Content Rating (IARC) | **Product** | Play Console → App Content → Content Rating: preencher questionário. Resultado esperado: Everyone / Livre | 0.5h |
| S17 | Textos da loja (pt-BR) | **Product** | Título (máx 30 chars). Short Description (máx 80 chars). Full Description (máx 4000 chars). What's New (máx 500 chars). Sem referência a "iPhone", "iOS", "App Store" | 1h |

### 12.4 Infraestrutura de Deep Links

| # | Ação | Responsável | Detalhes | Esforço |
|---|------|-------------|----------|---------|
| S18 | Servir apple-app-site-association | **DevOps** | Criar arquivo JSON em `https://noowebr.com/.well-known/apple-app-site-association` com appID `TEAMID.com.noowe.client` e paths `["/", "/menu/*", "/order/*", "/restaurant/*"]` | 1h |
| S19 | Servir assetlinks.json | **DevOps** | Criar arquivo JSON em `https://noowebr.com/.well-known/assetlinks.json` com package `com.noowe.client` e SHA-256 fingerprint do signing certificate | 1h |

### 12.5 Signing & Distribution

| # | Ação | Responsável | Detalhes | Esforço |
|---|------|-------------|----------|---------|
| S20 | Apple Distribution Certificate | **DevOps** | Apple Developer → Certificates → Create → iOS Distribution. Válido por 1 ano. Download .p12 e armazenar em local seguro | 1h |
| S21 | App Store Provisioning Profile | **DevOps** | Apple Developer → Profiles → Create → App Store → selecionar App ID `com.noowe.client` e Distribution Certificate | 0.5h |
| S22 | Android Keystore de produção | **DevOps** | `keytool -genkey -v -keystore noowe-release.keystore -alias noowe -keyalg RSA -keysize 2048 -validity 10000`. Backup seguro (2 locais). Habilitar Play App Signing no Play Console | 1h |
| S23 | EAS Build Profile produção | **DevOps** | Verificar `eas.json` → `build.production` aponta para credentials corretas. Testar `eas build --platform all --profile production` | 1h |

### 12.6 Testes Pré-Submissão

| # | Ação | Responsável | Detalhes | Esforço |
|---|------|-------------|----------|---------|
| S24 | Teste em iOS real (iPhone SE + iPhone 15) | **QA** | Cold start, permissions, push, deep links, login/register, pedido completo, pagamento, exclusão de conta | 2h |
| S25 | Teste em Android real (Pixel + Samsung) | **QA** | Mesmos cenários. Verificar: permissões solicitadas em contexto, fallback se negadas, sem crashes | 2h |
| S26 | Teste fluxo account deletion | **QA** | Solicitar exclusão → verificar msg 30 dias → verificar conta inativa → testar cancelDeletion → verificar reativação | 1h |
| S27 | Teste re-consent (HTTP 451) | **QA** | Alterar versão legal no backend → verificar que app mostra ReConsentScreen → aceitar → verificar retorno ao app | 1h |
| S28 | Teste offline mode | **QA** | Desligar WiFi/dados → verificar: telas com cache, mensagem de erro gracioso, ReConsentScreen offline fallback | 1h |
| S29 | Teste acessibilidade | **QA** | VoiceOver (iOS) e TalkBack (Android) nos fluxos: Login → Home → Menu → Cart → Payment | 1h |

### 12.7 Submissão

| # | Ação | Responsável | Detalhes | Esforço |
|---|------|-------------|----------|---------|
| S30 | Build iOS via EAS | **DevOps** | `eas build --platform ios --profile production` → aguardar build → verificar no App Store Connect | 1h |
| S31 | Submit iOS para TestFlight | **DevOps** | `eas submit --platform ios` → TestFlight → testar com grupo beta → promover para review | 0.5h |
| S32 | Build Android via EAS | **DevOps** | `eas build --platform android --profile production` → download .aab | 1h |
| S33 | Submit Android para Internal Testing | **DevOps** | `eas submit --platform android` → Play Console → Internal Testing → verificar Pre-launch Report | 0.5h |
| S34 | Promover para App Store Review | **DevOps** | App Store Connect → Submit for Review → Phased Release (7 dias) | 0.5h |
| S35 | Promover para Google Play Production | **DevOps** | Play Console → Production → Staged Rollout (10%) | 0.5h |

### 12.8 Cronograma Sugerido

| Semana | Foco | Itens | Responsáveis |
|--------|------|-------|-------------|
| **Semana 1** | Assets + Credentials + EAS setup | S1-S5, S20-S23 | Design + DevOps |
| **Semana 2** | Metadata + Screenshots + Declarações | S6-S19 | Design + Product + DevOps |
| **Semana 3 (D+10)** | Testes + Build + TestFlight/Beta | S24-S33 | QA + DevOps |
| **Semana 3 (D+14)** | Review + Production | S34-S35 | DevOps |

### Resumo de Contagem — Stores

| Categoria | Itens | Horas |
|-----------|:-----:|:-----:|
| Assets visuais (Design) | 5 | ~13h |
| Metadata/Declarações (Product) | 8 | ~6h |
| Credentials/Signing (DevOps) | 9 | ~8h |
| Deep Links (DevOps) | 2 | ~2h |
| Testes pré-submissão (QA) | 6 | ~8h |
| Build e submissão (DevOps) | 6 | ~4h |
| **Total Store Submission** | **36** | **~41h** |
