# Design do Minhas Séries

## Direção

Um catálogo pessoal para acompanhar séries, inspirado no tema Nord. A interface usa a base escura Polar Night e os azuis Frost para criar um ambiente calmo, legível e focado na programação da pessoa. Como os dados do projeto não incluem pôsteres, títulos, plataformas, temporadas e notas formam o conteúdo visual principal.

## Cores

| Cor Nord | Hex | Uso |
| --- | --- | --- |
| Polar Night nord0 | `#2e3440` | Fundo principal |
| Polar Night nord1 | `#3b4252` | Cartões e superfícies elevadas |
| Polar Night nord3 | `#4c566a` | Bordas, divisores e elementos discretos |
| Snow Storm nord6 | `#eceff4` | Texto principal e ícones importantes |
| Frost nord8 | `#88c0d0` | Ação principal, filtro ativo e foco |
| Aurora nord14 | `#a3be8c` | Estado concluído e confirmação positiva |

Usar Aurora nord11 (`#bf616a`) em ações destrutivas e erros. Reservar essa cor para esses estados.

## Tipografia

- Usar a fonte sem serifa do sistema em toda a interface para manter a leitura direta e não adicionar dependências.
- Criar hierarquia com tamanho, peso e espaçamento; evitar fontes decorativas ou estética de terminal.
- Dar destaque ao título da série. Plataforma, temporadas e nota aparecem como metadados secundários.

## Composição

A lista é a tela principal. Em celular, o conteúdo segue uma coluna com cabeçalho compacto, filtros próximos da lista, cartões de leitura rápida e uma ação evidente para cadastrar uma série.

```text
┌──────────────────────────┐
│ MINHAS SÉRIES             │
│ Sua programação           │
│ [Todas] [Assistindo] ...  │
│ ┌──────────────────────┐  │
│ │ Título da série      │  │
│ │ Plataforma · 2 temp. │  │
│ │ ★★★☆☆     Assistindo│  │
│ └──────────────────────┘  │
│                           │
│        + Nova série       │
└──────────────────────────┘
```

## Princípios

- Manter o fundo Polar Night e usar superfícies um pouco mais claras para separar cartões sem sombras pesadas.
- Usar Frost com moderação em ações e seleções; não colorir grandes áreas sem necessidade.
- Diferenciar séries concluídas com texto, ícone ou etiqueta e a cor Aurora, sem depender apenas da cor.
- Reservar Aurora vermelho para erros e exclusão; explicar o problema e a ação de recuperação em mensagens.
- Garantir contraste legível, áreas de toque confortáveis e espaçamento consistente em todas as telas.
- Em listas vazias, sugerir o cadastro de uma série. Em formulários, indicar como corrigir campos inválidos.
- Evitar decoração sem função; usar divisores e etiquetas somente quando ajudarem a entender a informação.
