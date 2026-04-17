# Auditoria Completa — Apps Mobile `client` e `restaurant`

Data: 2026-04-17  
Escopo: `platform/mobile/apps/client` e `platform/mobile/apps/restaurant`  
Objetivo: listar o que falta para finalizar os apps com prontidão de produção.

---

## Como a análise foi feita

- Leitura estrutural de navegação, i18n, build/config, scripts e assets.
- Varredura de sinais de incompletude (`TODO`, `FIXME`, `mock`, `placeholder`, `coming soon`).
- Checagem de coerência entre rotas declaradas e tipos/navigation calls.
- Verificação de riscos de release Android/iOS e preparação de qualidade (lint/test/typecheck).

> Observação: esta auditoria é estática (código/config). A validação final de produção também exige testes de execução em device real + pipeline CI.

---

## Resumo Executivo

Os dois apps ainda não estão prontos para release. Os maiores bloqueios hoje:

1. **Segurança/autenticação e build de release** (client e restaurant).
2. **Navegação incompleta/inconsistente** (tabs, rotas inexistentes e UX parcial).
3. **i18n com falhas estruturais** (chaves duplicadas/sobrescritas e hardcoded).
4. **Fluxos críticos com mocks/placeholders** (financeiro/pagamento/configuração).
5. **Base de qualidade fraca no nível de app** (sem scripts de lint/typecheck/test por app).

---

## Achados por Severidade (Consolidado)

## Crítico

- **Bypass de autenticação habilitado no app client**  
  Evidência: `platform/mobile/apps/client/src/navigation/index.tsx` (`AUTH_BYPASS_ENABLED = true`).  
  Impacto: usuário entra sem auth real; bloqueador absoluto de produção.

- **Release Android assinado com keystore de debug (client e restaurant)**  
  Evidência:  
  - `platform/mobile/apps/client/android/app/build.gradle`  
  - `platform/mobile/apps/restaurant/android/app/build.gradle`  
  Ambos com `release { signingConfig signingConfigs.debug }`.  
  Impacto: release inseguro/inválido para distribuição.

- **i18n com chave duplicada `financial` nos dicionários**  
  Evidência:  
  - `platform/mobile/shared/i18n/pt-BR.ts`  
  - `platform/mobile/shared/i18n/en-US.ts`  
  - `platform/mobile/shared/i18n/es-ES.ts`  
  A chave `financial` aparece duplicada no mesmo objeto.  
  Impacto: parte das traduções é sobrescrita silenciosamente e deixa de funcionar.

- **Asset referenciado e ausente no restaurant**  
  Evidência: `platform/mobile/apps/restaurant/app.json` referencia `./assets/sounds/order-notification.wav`, mas não existe arquivo `.wav` em `platform/mobile/apps/restaurant/assets`.  
  Impacto: risco de falha em build/prebuild.

## Alto

- **Bottom tab do client sem ícones definidos**  
  Evidência: `platform/mobile/apps/client/src/navigation/index.tsx` com `tabBarLabel` em `Home/Explore/Orders/Profile`, sem `tabBarIcon`.  
  Impacto: UX incompleta e regressão visual funcional.

- **Rotas chamadas, mas não registradas (restaurant)**  
  Evidência: chamadas de navegação para `Payment` e `ChargeFlow` em telas waiter; ausência dessas rotas no navigator principal em `platform/mobile/apps/restaurant/src/navigation/index.tsx`.  
  Impacto: risco real de erro de navegação em runtime.

- **Config de idioma/moeda no restaurant não finalizada**  
  Evidência: `platform/mobile/apps/restaurant/src/screens/config/ConfigLanguageScreen.tsx` com persistência marcada e payload incompleto.  
  Impacto: preferências do usuário não persistem corretamente.

- **Fluxos críticos ainda com mock/placeholder**  
  Evidência (exemplos):  
  - `platform/mobile/apps/restaurant/src/screens/financial/FinancialReportScreen.tsx`  
  - `platform/mobile/apps/restaurant/src/screens/fiscal/FiscalSetupScreen.tsx`  
  - `platform/mobile/apps/client/src/screens/payment/DigitalReceiptScreen.tsx`  
  - `platform/mobile/apps/client/src/screens/loyalty/LoyaltyHomeScreen.tsx`  
  Impacto: funcionalidade “parece pronta”, mas não está conectada ao fluxo real.

- **Push/analytics/sentry parcialmente conectados (restaurant)**  
  Evidência: infraestrutura existe, mas integração end-to-end de token push, tracking de telas e bootstrap de observabilidade não está consistente em uso efetivo de app.

## Médio

- **Inconsistências de nomenclatura de rotas e tipagem (client)**  
  Evidência: `platform/mobile/apps/client/src/types/index.ts` possui chaves próximas/conflitantes (`Reservation`/`Reservations`, `Payment`/`UnifiedPayment`, etc.) que elevam risco de drift com navegação real.  
  Impacto: manutenção difícil e chance de erro em fluxo.

- **Strings hardcoded fora do i18n (client e restaurant)**  
  Evidência: títulos e labels diretos em navegação/telas (ex.: fallback auth no client).  
  Impacto: cobertura multilíngue parcial.

- **Permissões Android potencialmente excessivas/depreciadas (restaurant)**  
  Impacto: risco de policy issue em publicação (necessita revisão de necessidade real).

- **Documentação operacional ausente nos apps**  
  Evidência: ausência de README próprio de cada app (existe apenas `.expo/README.md`).  
  Impacto: onboarding e release checklist frágeis.

## Baixo

- **Dívida de tema e compatibilidade legacy** em áreas compartilhadas.
- **Logs de debug espalhados** sem padronização por ambiente.
- **Código legado em paralelo** em algumas áreas (especialmente waiter/operação).

---

## O que falta desenvolver para finalizar — por app

## 1) App `client`

### Bloqueadores imediatos

- [ ] Desativar bypass de auth (`AUTH_BYPASS_ENABLED` deve ser `false` em produção).
- [ ] Corrigir assinatura release Android para keystore de produção.
- [ ] Implementar `tabBarIcon` em todas as tabs principais do bottom navigator.
- [ ] Corrigir hardcoded de títulos principais para i18n.
- [ ] Revisar e alinhar mapa de rotas/types para evitar divergência entre `navigation` e `types`.

### Funcionalidade crítica ainda incompleta

- [ ] Remover/mock-to-real em pagamento/recibo e loyalty.
- [ ] Finalizar ações pendentes em perfil/upload e fluxos “coming soon”.
- [ ] Garantir deep link/navegação ao tocar push notification.

### Produção/qualidade

- [ ] Ajustar variáveis/flags de ambiente para produção (sem flags dev ativas).
- [ ] Criar scripts mínimos no app para `lint`, `typecheck`, `test`.
- [ ] Criar README do app com setup, env, build e release.

---

## 2) App `restaurant`

### Bloqueadores imediatos

- [ ] Corrigir assinatura release Android (retirar debug keystore).
- [ ] Resolver chave duplicada `financial` no i18n compartilhado.
- [ ] Corrigir navegações para rotas inexistentes (`Payment`, `ChargeFlow`) ou registrar rotas corretamente.
- [ ] Corrigir asset faltante de notificação (`order-notification.wav`) ou remover referência.

### Funcionalidade crítica ainda incompleta

- [ ] Completar persistência de idioma/moeda/formato no fluxo de configuração.
- [ ] Trocar mock/placeholders de financeiro/fiscal/reservas por integração real.
- [ ] Padronizar experiência waiter tabs (ícones + consistência de navegação interna).
- [ ] Fechar integração push (permission, token, registro backend).
- [ ] Garantir tracking de telas e bootstrap de observabilidade em startup.

### Produção/qualidade

- [ ] Revisar permissões Android para conformidade Play Store.
- [ ] Adicionar scripts formais de qualidade (`lint`, `typecheck`, `test`, `test:ci`) no app.
- [ ] Criar README do app com guia completo de execução e release.
- [ ] Consolidar config branding/env para evitar divergência entre arquivos de configuração.

---

## Checklist de Conclusão (Definition of Done)

## Navegação e UX
- [ ] Sem rotas inválidas em runtime.
- [ ] Bottom tabs com ícones e labels consistentes.
- [ ] Smoke test dos fluxos críticos (auth, pedido, pagamento, perfil/config).

## i18n
- [ ] Sem chaves duplicadas/sobrescritas.
- [ ] Sem hardcoded visível em telas principais.
- [ ] Cobertura PT/EN/ES validada para fluxos core.

## Build/Release
- [ ] Keystore de produção configurada para Android.
- [ ] Assets referenciados 100% existentes.
- [ ] Profiles de build e variáveis por ambiente definidos e testados.

## Integrações
- [ ] Auth real governando entrada no app.
- [ ] Push notification end-to-end funcional (incluindo tap action).
- [ ] Analytics + erro (Sentry) ativos em produção.

## Qualidade e Operação
- [ ] Scripts e pipeline de `lint`, `typecheck`, `test` estáveis.
- [ ] README e runbook de release publicados.
- [ ] Logs/sensíveis revisados para produção.

---

## Plano sugerido (7 dias)

### Dias 1-2 (bloqueadores de release)
- Corrigir auth bypass (client), signing release (ambos), asset faltante (restaurant), chave i18n duplicada.

### Dia 3 (navegação)
- Corrigir rotas inválidas no restaurant e adicionar ícones no bottom tab do client.

### Dias 4-5 (fluxos core)
- Remover mocks críticos (pagamento/financeiro/loyalty/config) e concluir persistências de configuração.

### Dia 6 (i18n e consistência)
- Eliminar hardcoded e validar cobertura PT/EN/ES nas telas prioritárias.

### Dia 7 (qualidade + go/no-go)
- Rodar lint/type/test + checklist de release final Android/iOS.

---

## Conclusão

O projeto está em fase avançada de estrutura, mas ainda em **hardening** (não em “finish-ready”).  
Se os itens críticos e altos forem executados primeiro, é viável levar os dois apps para um estado de release candidate em curto prazo.

