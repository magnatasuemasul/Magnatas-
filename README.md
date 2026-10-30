# Magnatas-
A página da Atlética Magnatas representa a identidade da UEMASUL com uma experiência moderna, imersiva e impactante. Mais do que um site institucional, ela transmite força, união, disciplina e legado, conectando estudantes a algo maior: uma atlética construída para inspirar, unir e marcar história dentro e fora das quadras.

## Organização do projeto

Site estático (HTML, CSS e JS puros, sem build), publicado na Vercel a partir da branch `main`.

```
/
├── index.html              ← landing page ATIVA (o que aparece em /): Magnatas on Ice
├── magnatas-on-ice/        ← recursos da landing ativa (css/, js/, img/, fonts/)
│   └── index.html          ← só redireciona /magnatas-on-ice/ (links antigos) para /
├── site-institucional/     ← Site Institucional arquivado, completo e independente
│   ├── index.html
│   ├── imagem-02.jpg
│   ├── logo-sm.png, logo-opt.png, logo-adm-opt.png
│   └── video-01-opt.mp4, video-02-opt.mp4, video-05-opt.mp4
├── campanhas/              ← (futuro) landing pages antigas arquivadas, uma pasta por campanha
├── magnatas_hero.html      ← versão antiga do Site Institucional (mantida, usa os arquivos da raiz)
├── script.js               ← arquivo legado, não usado pelas páginas
└── *.png / *.jpg / *.mp4   ← recursos da raiz usados pelo magnatas_hero.html
```

| Endereço | Conteúdo |
|---|---|
| `/` | Landing page ativa: Magnatas on Ice |
| `/magnatas-on-ice/` | Redireciona para `/` |
| `/site-institucional/` | Site Institucional, sempre disponível |

> **Atenção:** todo push na `main` é publicado automaticamente em produção pela Vercel.
> Trabalhe sempre em outra branch e confira o *preview* da Vercel antes de juntar na `main`.

## Regras

- Cada página guarda os próprios recursos na própria pasta e usa **caminhos relativos** a ela.
  Nunca aponte uma página para arquivos de outra pasta.
- O conteúdo de `site-institucional/` não deve ser alterado ao criar ou trocar campanhas.
- Não apague arquivos da raiz sem antes conferir se alguma página ainda os usa
  (`magnatas_hero.html` usa os recursos da raiz).
- Páginas dentro de pastas devem ser acessadas com barra final (`/pasta/`).
  O `site-institucional/index.html` já corrige isso sozinho com um pequeno script no `<head>`;
  copie esse script para qualquer nova página arquivada em pasta.

## Como trocar a landing page ativa

1. Crie uma branch: `git switch -c campanha/<nome>`.
2. Coloque os recursos da nova landing em uma pasta própria na raiz, por exemplo `assets-<nome>/`,
   e aponte o novo `index.html` para eles.
3. Substitua o `index.html` da raiz pela nova landing page.
4. Se quiser manter acesso ao Site Institucional a partir da campanha, use o link `/site-institucional/`.
5. Faça push da branch, confira o preview da Vercel (`/` e `/site-institucional/`) e só então junte na `main`.

## Como arquivar uma campanha antes de substituí-la

1. Crie `campanhas/<nome>/` e copie para ela o `index.html` da campanha e todos os recursos que ele usa.
2. Ajuste os caminhos dentro da cópia para continuarem relativos à pasta e inclua o script da barra final
   (o mesmo do início de `site-institucional/index.html`).
3. Teste em `/campanhas/<nome>/` e só depois substitua o `index.html` da raiz.

## Como restaurar o Site Institucional como página principal

- **Pelo Git (recomendado):** recupere o `index.html` de um commit anterior com
  `git restore --source=<commit> index.html` e confira os recursos que ele usa
  (o último commit com o Site Institucional na raiz é o `2e117b2`).
- **Pela pasta arquivada:** copie o conteúdo de `site-institucional/` para a raiz e remova do `index.html`
  copiado o script da barra final (na raiz ele não é necessário).

## Testar localmente

Abra `index.html` ou `site-institucional/index.html` direto no navegador, ou sirva a pasta com qualquer
servidor estático e acesse `/` e `/site-institucional/`.
