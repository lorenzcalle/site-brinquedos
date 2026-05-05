# Guia Git — Trabalhando em Dois PCs

## Fluxo Correto

### Ao terminar de trabalhar (em qualquer PC)
```bash
git add .
git commit -m "descrição do que você fez"
git push
```

### Ao começar a trabalhar (em qualquer PC)
```bash
git pull
```

---

## Resumo Rápido

| Situação | Comando |
|---|---|
| Salvar e enviar mudanças | `git add . && git commit -m "msg" && git push` |
| Pegar mudanças do outro PC | `git pull` |
| Ver status atual | `git status` |
| Ver histórico de commits | `git log --oneline -5` |

---

## Regra de Ouro

> **Sempre dê `git pull` antes de começar a editar.**
> **Sempre dê `git push` ao terminar.**

Isso evita conflitos e garante que os dois PCs estejam sempre sincronizados.

---

## Se aparecer algum problema

### Branch atrás do remoto
```bash
git pull
```

### Rebase travado (como aconteceu)
```bash
git rebase --abort
git pull
```

### Conflito de arquivos
```bash
git status          # ver quais arquivos estão em conflito
# edite os arquivos conflitantes manualmente
git add .
git rebase --continue   # ou git commit, dependendo do caso
```

---

## Informações do Projeto

- **Servidor:** `/var/www/bc.san.uri.br`
- **Branch principal:** `main`
- **Acesso:** Remote SSH via VS Code
