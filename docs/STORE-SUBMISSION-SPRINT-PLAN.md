# Plano de Submissão às Stores — NOOWE Mobile Apps

> Gerado em 2026-03-26 | Baseado na auditoria de Store Submission + PRR
> **Meta:** Submissão TestFlight/Beta em D+10 | Submissão Produção em D+14

---

## Resumo de Itens

| Severidade | Qtd | Horas | Quem resolve |
|---|---|---|---|
| 🔴 Bloqueadores | 4 | ~7h | Claude + DevOps |
| 🟠 Críticos | 5 | ~11h | Claude + DevOps |
| 🟡 Importantes | 12 | ~34h | Claude + Design + Product |
| 🟢 Sugestões | 2 | — | Já implementado |
| **Total** | **23** | **~52h** | — |

---

## Sprint S (Stores) 1 — "Blockers & Critical Fixes" (Semana 1)

**Objetivo:** Zerar todos os bloqueadores e críticos. App pronto para TestFlight/Beta interno.

### Track Mobile Dev (~18h) — Claude executa

| # | Sev | Item | Arquivo(s) | Esforço |
|---|---|---|---|---|
| 1 | 🔴 | Remover `NSLocationAlwaysUsageDescription` deprecated; adicionar `NSLocationAlwaysAndWhenInUseUsageDescription` se necessário | `apps/client/app.json` L24 | 0.5h |
| 2 | 🟠 | Adicionar permissions Camera/Location ao restaurant app (iOS infoPlist + Android permissions) | `apps/restaurant/app.json` | 1h |
| 3 | 🟡 | Adicionar `NSPhotoLibraryUsageDescription` + `NSPhotoLibraryAddOnlyUsageDescription` ao client | `apps/client/app.json` | 0.5h |
| 4 | 🟡 | Remover background mode `audio` do restaurant (sem justificativa) | `apps/restaurant/app.json` L21 | 0.5h |
| 5 | 🟠 | Fix analytics race condition — bloquear eventos antes de consent status carregado | `shared/config/analytics.ts` | 2h |
| 6 | 🟠 | Melhorar Sentry `beforeSend` — filtrar X-API-Key, X-Auth-Token, email no body, request body em POST | `shared/config/sentry.ts` L52-71 | 2h |
| 7 | 🟠 | Adicionar botão "Exportar Meus Dados" no ManageConsentsScreen (chama `GET /users/me/export`) | `ManageConsentsScreen.tsx` | 2h |
| 8 | 🟡 | Push notification: throw error se projectId = placeholder em vez de silent fail | `shared/services/push-notifications.ts` L89 | 0.5h |
| 9 | 🟡 | Terms/Privacy URLs: ler de ENV config em vez de hardcoded | `shared/components/LegalConsentSection.tsx` L29-30 | 1h |
| 10 | 🟡 | ReConsentScreen: adicionar fallback offline com docs bundled + error state | `shared/screens/legal/ReConsentScreen.tsx` | 2h |
| 11 | 🟡 | Adicionar deep links (intentFilters) ao restaurant app Android | `apps/restaurant/app.json` | 1h |
| 12 | 🟡 | Alterar bundle IDs de `com.okinawa.*` para `com.noowe.*` (client + restaurant, iOS + Android) | Ambos `app.json` | 1h |

### Track Backend (~4h) — Claude executa

| # | Sev | Item | Arquivo(s) | Esforço |
|---|---|---|---|---|
| 13 | 🟠 | Account deletion: adicionar confirmação por email + grace period 30 dias antes de hard-delete | `users.service.ts`, `email.service.ts` | 4h |

### Track DevOps (~3h) — REQUER AÇÃO HUMANA

| # | Sev | Item | Responsável | Esforço |
|---|---|---|---|---|
| 14 | 🔴 | Criar EAS projects e substituir `your-project-id` nos 2 app.json | DevOps | 0.5h |
| 15 | 🔴 | Popular credenciais Apple (appleId, ascAppId, appleTeamId) no eas.json | DevOps | 1h |
| 16 | 🔴 | Gerar `google-services.json` do Firebase Console e adicionar ao projeto | DevOps | 1h |
| 17 | 🔴 | Gerar Google Play Service Account Key JSON para EAS Submit | DevOps | 0.5h |

### Track Design (~4h) — REQUER AÇÃO HUMANA

| # | Sev | Item | Responsável | Esforço |
|---|---|---|---|---|
| 18 | 🔴 | Criar assets restaurant app: icon.png (1024x1024), splash.png (2048x2048), adaptive-icon.png, notification-icon.png, favicon.png | Design | 4h |

**Entrega Sprint S1:** Todos os 🔴 e 🟠 resolvidos. App pronto para TestFlight/Internal Testing.

---

## Sprint S (Stores) 2 — "Store Metadata & Compliance" (Semana 2)

**Objetivo:** Preencher metadados das stores, criar screenshots, preparar declarações de privacidade.

### Track Design (~8h) — REQUER AÇÃO HUMANA

| # | Sev | Item | Detalhes | Esforço |
|---|---|---|---|---|
| 19 | 🟡 | Screenshots Client App — iOS | iPhone 6.9" (1320x2868), 6.5" (1242x2688), 5.5" (1242x2208) — mín 5 screenshots por tamanho | 4h |
| 20 | 🟡 | Screenshots Client App — Android | Phone (1080x1920+), Tablet 7" e 10" — mín 2 por tipo | 2h |
| 21 | 🟡 | Feature Graphic — Google Play | 1024x500px JPG/PNG para ambos apps | 1h |
| 22 | 🟡 | Screenshots Restaurant App | Mesmo formato iOS + Android | 1h (reutilizar template) |

### Track Product/Legal (~4h) — REQUER AÇÃO HUMANA

| # | Sev | Item | Detalhes | Esforço |
|---|---|---|---|---|
| 23 | 🟡 | App Store: Privacy Nutrition Labels | Preencher no App Store Connect: dados coletados (localização, email, nome, pagamento), finalidade, linked to user | 1h |
| 24 | 🟡 | Google Play: Data Safety Section | Preencher no Play Console: mesmos dados, declarar criptografia em trânsito, exclusão disponível | 1h |
| 25 | 🟡 | App Store: Age Rating | Preencher questionário IARC no App Store Connect | 0.5h |
| 26 | 🟡 | Google Play: Content Rating (IARC) | Preencher questionário no Play Console | 0.5h |
| 27 | 🟡 | Verificar URLs privacy/terms estão live | Testar `https://noowebr.com/privacy` e `https://noowebr.com/terms` | 0.5h |
| 28 | 🟡 | Preparar conta de teste para revisores | Criar user demo com dados (pedidos, reservas, favoritos) para Apple/Google review | 0.5h |

### Track DevOps (~3h) — REQUER AÇÃO HUMANA

| # | Sev | Item | Detalhes | Esforço |
|---|---|---|---|---|
| 29 | 🟡 | Servir `apple-app-site-association` em `noowebr.com/.well-known/` | Necessário para Universal Links iOS | 1h |
| 30 | 🟡 | Servir `assetlinks.json` em `noowebr.com/.well-known/` | Necessário para Android App Links | 1h |
| 31 | 🟡 | Keystore produção Android | `keytool -genkey`, backup seguro, habilitar Play App Signing | 1h |

### Track Mobile Dev (~8h) — Claude executa (se contexto disponível)

| # | Sev | Item | Detalhes | Esforço |
|---|---|---|---|---|
| 32 | 🟡 | Aumentar cobertura accessibilityLabel — restaurant app (telas críticas: KDS, Orders, Tables, Calls) | 8 telas prioritárias | 8h |

**Entrega Sprint S2:** Metadados prontos, screenshots criadas, declarações preenchidas.

---

## Sprint S (Stores) 3 — "Testing & Submission" (Semana 3, D+10 a D+14)

**Objetivo:** Testar, submeter para beta, iterar, submeter para produção.

### Track QA (~8h) — Time completo

| # | Item | Detalhes | Esforço |
|---|---|---|---|
| 33 | Teste em dispositivo iOS real (iPhone SE + iPhone 15) | Cold start, permissions, push, deep links, login/register, order, payment | 2h |
| 34 | Teste em dispositivo Android real (Pixel + Samsung) | Mesmos cenários | 2h |
| 35 | Testar fluxo account deletion completo | Solicitar → receber email → confirmar → verificar anonimização | 1h |
| 36 | Testar re-consent flow (HTTP 451) | Alterar versão legal → verificar que app mostra ReConsentScreen | 1h |
| 37 | Testar offline mode | Desligar WiFi/dados → verificar degradação graciosa em todas telas | 1h |
| 38 | Testar acessibilidade (VoiceOver iOS + TalkBack Android) | Navegar fluxos críticos com screen reader | 1h |

### Track Submission (~4h)

| # | Item | Detalhes | Esforço |
|---|---|---|---|
| 39 | Submeter para TestFlight (iOS) | `eas build --platform ios --profile production && eas submit --platform ios` | 1h |
| 40 | Submeter para Google Play Internal Testing | `eas build --platform android --profile production && eas submit --platform android` | 1h |
| 41 | Revisar Pre-launch Report (Google) | Verificar crashes e warnings do Firebase Test Lab automático | 0.5h |
| 42 | Submeter para App Store Review | Após TestFlight OK, promover para review | 0.5h |
| 43 | Submeter para Google Play Production (staged 10%) | Após Internal OK, promover para produção com rollout gradual | 0.5h |
| 44 | Configurar Phased Release (Apple, 7 dias) | App Store Connect → Phased Release | 0.5h |

**Entrega Sprint S3:** Apps submetidos para review. Tempo médio de review: Apple ~24-48h, Google ~2-7 dias.

---

## Resumo por Sprint

| Sprint | Semana | Foco | Itens | Horas | Marco |
|---|---|---|---|---|---|
| **SS1** | 1 | Blockers + Critical Fixes | 18 | ~29h | TestFlight/Beta pronto |
| **SS2** | 2 | Store Metadata & Compliance | 14 | ~23h | Metadados completos |
| **SS3** | 3 | Testing & Submission | 12 | ~12h | Apps submetidos |
| **Total** | 3 sem | — | **44** | **~64h** | **Apps nas stores** |

---

## Divisão por Responsável

| Responsável | Itens | Horas | O que faz |
|---|---|---|---|
| **Claude (Mobile Dev)** | 12 | ~14h | Fixes de código, permissions, analytics, consent, a11y |
| **Claude (Backend)** | 1 | ~4h | Account deletion com email + grace period |
| **DevOps** | 7 | ~5h | EAS, Firebase, keystore, well-known files |
| **Design** | 5 | ~13h | Assets restaurant, screenshots, feature graphic |
| **Product/Legal** | 6 | ~4h | Privacy labels, data safety, IARC, conta teste |
| **QA** | 6 | ~8h | Testes em dispositivos reais |
| **Submission** | 6 | ~4h | Build, submit, phased release |

---

## Itens Pendentes de Conversas Anteriores (PRR)

Estes itens do PRR continuam pendentes e são paralelos ao plano de stores:

| # | Item | Responsável | Status |
|---|---|---|---|
| C01 | DPAs assinados com terceiros (Stripe, OpenAI, Firebase, Sentry, SendGrid) | Legal | PENDENTE |
| C03 | Definir escala de on-call | Gestão | PENDENTE |
| I02 | Configurar CDN (CloudFront/Cloudflare) | DevOps | PENDENTE |
| I07 | Alertas de custo cloud | DevOps | PENDENTE |

---

## Checklist Final Pré-Submissão

### Apple App Store
- [ ] Apple Developer Account ativa ($99/ano)
- [ ] Distribution Certificate válido
- [ ] App Store Provisioning Profile gerado
- [ ] App ID com capabilities corretas (push, associated domains)
- [ ] Build enviado via EAS e processado no App Store Connect
- [ ] Privacy Nutrition Labels preenchidas
- [ ] Age Rating preenchido (IARC)
- [ ] Conta de teste nas Review Notes
- [ ] Phased Release configurado (7 dias)
- [ ] Privacy Policy URL acessível

### Google Play Store
- [ ] Google Play Developer Account ativa ($25)
- [ ] App Bundle (.aab) gerado com release signing
- [ ] Play App Signing habilitado
- [ ] Data Safety Section preenchida
- [ ] Content Rating (IARC) preenchido
- [ ] Pre-launch report revisado
- [ ] Staged rollout configurado (10-20%)
- [ ] Conta de teste nas notas de revisão
- [ ] Privacy Policy URL acessível
