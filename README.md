# Minhas Séries

Aplicativo mobile para registrar séries, acompanhar o que está em andamento e guardar os dados no SQLite. O projeto usa Expo Router, TypeScript e NativeWind, com visual baseado no tema Nord escuro.

O desenvolvimento segue as etapas de `projeto-minhas-series.md`. Até a etapa 7, estão implementados a configuração, os tipos, o SQLite, o repositório, a lista, o formulário de cadastro e edição e a tela de detalhe com ações para concluir, editar e excluir séries. A lista também oferece busca por título, resumo do catálogo e ordenação por data ou nota.

## Como rodar

Requer Node.js compatível com Expo SDK 57 e um dispositivo ou emulador com Expo Go.

```bash
npm install --legacy-peer-deps
npx expo start
```

Use o QR code exibido pelo Expo para abrir o app. Se uma alteração de configuração visual não aparecer, reinicie com `npx expo start --clear`.

## Organização

- `src/app/`: rotas e telas do Expo Router.
- `src/types/serie.ts`: tipos de série e dos formulários.
- `src/database/database.ts`: conexão SQLite e criação da tabela.
- `src/database/serieRepository.ts`: consultas e alterações das séries.
- `DESIGN.md`: regras visuais baseadas no Nord Polar Night.

## Teste de persistência

Pendente para a etapa 8. O vídeo ou os prints do cadastro, edição, conclusão e reabertura do app serão adicionados aqui depois do teste em dispositivo ou emulador.

## Diário do copiloto

### Registro 1 — Etapa 1

**O que eu pedi:** definir a direção visual do aplicativo.
**O que a IA sugeriu (resumo):** um visual editorial com fundo marfim, coral, verde sálvia e títulos serifados.
**O que eu fiz:** rejeitei a proposta e escolhi o tema Nord escuro, Polar Night, para orientar o `DESIGN.md`.

### Registro 2 — Etapa 1

**O que eu pedi:** decidir onde ficariam as rotas do Expo Router.
**O que a IA sugeriu (resumo):** usar `app/` para acompanhar a estrutura citada no roteiro.
**O que eu fiz:** adaptei para `src/app/`, seguindo o `AGENTS.md` do projeto.

### Registro 3 — Etapa 2

**O que eu pedi:** decidir como representar uma série cadastrada sem nota.
**O que a IA sugeriu (resumo):** enviar `nota: null` explicitamente.
**O que eu fiz:** aceitei, pois o tipo de entrada deixa claro que não há nota.

### Registro 4 — Etapa 2

**O que eu pedi:** decidir quais campos o formulário deveria enviar ao editar uma série.
**O que a IA sugeriu (resumo):** enviar sempre todos os campos editáveis.
**O que eu fiz:** rejeitei essa proposta e escolhi enviar só os campos alterados; por isso, `UpdateSerieInput` tem campos opcionais.

### Registro 5 — Etapa 3

**O que eu pedi:** definir as restrições da tabela SQLite.
**O que a IA sugeriu (resumo):** usar `CHECK` para impedir temporadas negativas, nota fora de 1 a 5 e estado de conclusão fora de 0 ou 1, com valor padrão 0.
**O que eu fiz:** aceitei as restrições e reforcei que `concluida` deve ser um número inteiro, sem `boolean`.

### Registro 6 — Etapa 4

**O que eu pedi:** decidir o que acontece quando alguém tenta editar, concluir ou excluir uma série que não existe mais.
**O que a IA sugeriu (resumo):** lançar um erro explícito para a tela poder informar o problema.
**O que eu fiz:** aceitei essa opção; as três operações verificam se alguma linha foi alterada.

### Registro 7 — Etapa 4

**O que eu pedi:** avisar quando o formulário tentar salvar sem nenhuma mudança e confirmar a intenção.
**O que a IA sugeriu (resumo):** deixar a confirmação no formulário, pois o repositório não controla avisos visuais; uma atualização vazia não grava no banco.
**O que eu fiz:** perguntei qual camada seria mais simples. A confirmação no formulário ficou planejada para a etapa 6.

### Registro 8 — Etapa 5

**O que eu pedi:** continuar para a etapa 5.
**O que a IA sugeriu (resumo):** ligar os atalhos para o formulário e o detalhe desde já, com telas provisórias até as próximas etapas.
**O que eu fiz:** escolhi criar as telas provisórias, que serão substituídas nas etapas 6 e 7.

### Registro 9 — Etapa 5

**O que eu pedi:** implementar a lista seguindo o roteiro, inclusive a atualização ao voltar de outra tela.
**O que a IA sugeriu (resumo):** usar `useFocusEffect` para carregar de novo quando a lista volta ao foco. A rota continua montada na pilha, então um `useEffect` com `[]` não executaria outra vez. O `useCallback` mantém a mesma função entre renderizações e evita que o efeito de foco dispare em cada render.
**O que eu fiz:** aceitei o padrão e usei `useFocusEffect` com `useCallback` na lista.

### Registro 10 — Etapa 6

**O que eu pedi:** definir o valor inicial de temporadas no cadastro.
**O que a IA sugeriu (resumo):** começar em 0, pois zero é um valor válido.
**O que eu fiz:** escolhi deixar o campo vazio e exigir que eu informe um número.

### Registro 11 — Etapa 6

**O que eu pedi:** definir o comportamento ao salvar uma edição sem alterações.
**O que a IA sugeriu (resumo):** mostrar um aviso com as opções “Continuar editando” e “Voltar à lista”.
**O que eu fiz:** aceitei esse aviso para confirmar que nenhum campo mudou.

### Registro 12 — Etapa 6

**O que eu pedi:** definir o que acontece ao editar com um ID inválido ou inexistente.
**O que a IA sugeriu (resumo):** mostrar uma mensagem de erro e um botão para voltar à lista.
**O que eu fiz:** aceitei essa opção.

### Registro 13 — Etapa 7

**O que eu pedi:** definir para onde a tela deve ir depois de marcar ou desmarcar uma série como concluída.
**O que a IA sugeriu (resumo):** permanecer no detalhe e atualizar o estado e a ação disponível.
**O que eu fiz:** aceitei; assim dá para conferir o novo status sem sair da série.

### Registro 14 — Melhoria da lista

**O que eu pedi:** deixar a tela inicial menos genérica, manter os filtros e implementar busca por título, contador e ordenação do roteiro.
**O que a IA sugeriu (resumo):** preservar a paleta Nord e organizar a lista como um catálogo, com resumo em destaque e cartões que dão mais ênfase às temporadas e à nota.
**O que eu fiz:** aceitei a direção, mantendo a paleta atual e pedindo a inclusão de todas as opções do roteiro.

### Registro 15 — Revisão da lista

**O que eu pedi:** o primeiro redesenho ainda parecia genérico e perguntei que outras direções seriam possíveis.
**O que a IA sugeriu (resumo):** trocar cartões e cápsulas por um arquivo tipográfico com linhas numeradas, divisores e filtros sublinhados.
**O que eu fiz:** pedi para experimentar a proposta, mas depois preferi voltar ao layout anterior e manter a paleta Nord.
