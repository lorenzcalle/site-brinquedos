# PLAN — Mostra Missioneira de Brinquedos Científicos no site

Registro do que foi feito e do que falta para divulgar a **Mostra Missioneira de
Brinquedos Científicos** no site `bc.san.uri.br` (página **/eventos**).

- **Data do evento:** 08/10/2026 (a mensagem inicial dizia "08/10/2025", mas era erro de
  digitação — a URL/nome do evento e o fato de ser data futura confirmam 2026).
- **Inscrição:** só para equipes que vão apresentar. Visitantes não se inscrevem. Entrada gratuita.
- **Formulário de inscrição (externo, site da URI):**
  `https://san.uri.br/eventos/mostra_missioneira_brinquedos_cientificos2026/inscricao.php`

## Status

**Fase 1 — CONCLUÍDA e no ar** (commit `ac57b91` em `main`, buildado e pushado).

O que entrou:
- **Dados no Supabase** (tabela `events`): `date = 2026-10-08` + descrição com as regras de
  inscrição. Aplicado pelo script `aplicar-mostra.mjs` (raiz da worktree `funny-matsumoto`).
- **`src/pages/events.tsx`:**
  - **Banner de destaque** da Mostra (`FeaturedEventBanner`): fundo laranja em gradiente,
    selos "Inscrições abertas" + "Entrada gratuita", bloco de data (08/OUT/2026),
    **contagem regressiva** ("Faltam X dias") e botão "Inscrever-se".
  - Botão de inscrição abre o **formulário externo** em nova aba (mapa `REGISTRATION_LINKS`).
  - A **descrição** passou a aparecer nos próximos eventos.
  - `formatDate`/`dateParts` fixados em **UTC** — corrige a data que aparecia um dia antes
    no fuso do Brasil (mostrava "07" em vez de "08").
- Só a Mostra (evento com link em `REGISTRATION_LINKS`) ganha o banner; eventos comuns
  seguem no card normal.

## Fase 2 — PENDENTE (aguardando material da Cris)

- [ ] **Regulamento** (PDF) — botão de download quando a Cris enviar.
- [ ] **Cronograma** — programação do dia, exibida no site (a Cris quer solto, pois "nem
      todos acessam o regulamento"). Provável formato: tabela horário → atividade.
- [ ] Avaliar uma **página dedicada da Mostra** (`/eventos/:id`, no estilo de `toy-detail.tsx`)
      para acomodar regulamento + cronograma sem lotar o card.
- [ ] **Horário e local** do evento — hoje "A definir" (campos `time`/`location` nulos).

## Como atualizar o evento (operacional)

Eventos **não** são editáveis pelo `/admin` — só por script `.mjs` na worktree
`funny-matsumoto` (usa a chave `service_role` do `.env.seed`):

```bash
cd /var/www/bc.san.uri.br/.claude/worktrees/funny-matsumoto-97f4c9
# editar os campos em aplicar-mostra.mjs (date, description, e futuramente time/location)
node aplicar-mostra.mjs
```

- Mudança de **dados/banco** é **imediata no ar** (o site lê o Supabase direto) — **sem deploy**.
- Mudança de **código** (`events.tsx`) precisa de deploy: merge na `main` → `pnpm build` no
  checkout principal → `git push` (ver `artifacts/brinquedos-cientificos/CLAUDE.md`).

## Notas / armadilhas

- **Banco Supabase é único** (dev e produção compartilham; não há staging). Então qualquer
  ajuste de dado aparece no site no ar na hora.
- O **link de inscrição está no código** (`REGISTRATION_LINKS` em `events.tsx`), não no banco,
  porque não há acesso a DDL (`ALTER TABLE`) a partir daqui — o `.env.seed` só tem as chaves
  REST. Na Fase 2, se quiser, dá para virar uma coluna `registration_url`.
