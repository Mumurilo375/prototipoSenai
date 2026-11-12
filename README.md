# Solicitações Internas

Protótipo frontend para a apresentação do TCC de Gestão do SENAI, baseado na demanda da SA DR. Interface em React, Vite e TypeScript; todos os usuários, chamados e atendimentos são fictícios.

## Executar

Requer Node.js 20.19+ ou 22.12+ e npm.

```sh
npm install
npm run dev
```

Abra o endereço informado pelo Vite (normalmente `http://localhost:5173`).

```sh
npm run build
npm run preview
```

O build verifica os tipos e gera a pasta `dist`.

## Publicar na Vercel

Importe o repositório na Vercel, selecione **Vite**, use `npm run build` como comando de build e `dist` como diretório de saída. Não há variáveis de ambiente. O arquivo `vercel.json` permite abrir diretamente as rotas internas. Não é necessário configurar banco de dados ou servidor.

## Demonstração

- **Colaborador:** Mariana Pereira registra e acompanha seus pedidos, com busca e filtros.
- **Manutenção:** recebe os mesmos chamados, define prioridade e responsável, altera status, adiciona observações e conclui atendimentos.
- **Gestão:** acompanha totais, tempo médio de resolução, status, categorias e demandas que exigem atenção.

Para o roteiro do TCC, crie uma solicitação sobre o ar-condicionado, alterne para Manutenção, registre o atendimento e volte a Colaborador. Os botões Colaborador, Manutenção e Gestão do menu sempre abrem a página inicial da área escolhida. Para continuar um atendimento, abra o chamado pela respectiva lista. As alterações aparecem imediatamente e persistem ao recarregar.

**Restaurar demonstração**, no rodapé do menu lateral, solicita confirmação e substitui os dados locais pelos 12 registros iniciais. As datas dos registros iniciais são relativas ao dia da restauração. Essa ação remove chamados criados e alterações locais.

## Personalização e organização

O nome do sistema está centralizado em `src/config.ts`. Atualize também o título estático em `index.html`, se desejar alterar o texto exibido antes do carregamento. Os registros iniciais estão em `src/data/seed.ts`, as páginas em `src/pages`, os componentes em `src/components` e o visual em `src/styles/global.css`.

As fontes Google Fonts Manrope e Barlow Condensed são distribuídas localmente via Fontsource; a interface funciona sem acessar o Google durante a apresentação.

### Trocar qualquer foto

Todas as fotos estáticas ficam em **`src/config/images.ts`**. Basta trocar o campo `url` da pessoa ou do equipamento desejado; cabeçalhos, responsáveis, miniaturas e galerias consultam esse mesmo arquivo. Aceita links HTTPS ou caminhos locais, como `/images/minha-foto.jpg` (arquivo em `public/images`).

```ts
// Dentro de images.requests.ac:
url: "https://seu-endereco.com/ar-condicionado.jpg",
```

As alterações também valem para os chamados que já estão salvos: não é necessário restaurar a demonstração. Preserve as chaves dos equipamentos e o campo `legacyId`, usado para reconhecer registros da versão anterior. O campo `source` é o crédito da imagem e pode ser atualizado junto com a foto. Anexos selecionados pelo formulário continuam armazenados no próprio chamado.

## Fotos ilustrativas

Fotografias do Pexels, usadas conforme a [licença Pexels](https://www.pexels.com/license/). A configuração central mantém os links das fontes e usa cópias em `public/images` para evitar dependência da rede. Se uma foto falhar, a interface apresenta um placeholder discreto; retratos usam as iniciais como fallback. Equipamentos, ambientes e retratos são ilustrativos; não representam ocorrências ou pessoas reais da SA DR. Os créditos dos retratos também estão em `src/config/images.ts`.

- [Ar-condicionado interno](https://www.pexels.com/photo/air-conditioner-in-a-house-16592625/).
- [Unidade externa](https://www.pexels.com/photo/air-conditioner-unit-on-a-wall-16848596/).
- [Pia de banheiro](https://www.pexels.com/photo/photo-of-a-bathroom-sink-6920608/).
- [Iluminação](https://www.pexels.com/photo/photo-of-ceiling-lights-1928739/).
- [Cadeira de escritório](https://www.pexels.com/photo/photo-of-a-black-office-chair-in-an-office-6446321/).
- [Tomada em manutenção](https://www.pexels.com/photo/power-socket-during-construction-on-building-5691642/).

Novos chamados aceitam uma foto JPG, PNG ou WebP de até 10 MB, reduzida para até 1.200 px e comprimida como JPEG antes de ser salva localmente. Nenhum arquivo é enviado a um servidor.

## Verificação

```sh
npx playwright install chromium
npm run test:e2e
```

Os testes cobrem o roteiro completo do TCC, persistência, filtros, gerenciamento, indicadores, restauração, galeria, falha de imagens, validação de arquivos, falha de armazenamento e uso no celular. Capturas de desktop (1920 × 1080), notebook e celular são geradas em `artifacts/screenshots`.

## Limitações

Sem backend, login, usuários reais, envio de mensagens ou sincronização entre navegadores. Todos os perfis são simulações. Os dados pertencem ao navegador e à origem acessada; limpar o armazenamento ou mudar de domínio inicia uma nova demonstração. Se o armazenamento estiver cheio ou bloqueado, a aplicação avisa e mantém as alterações apenas na sessão. O tempo médio usa horas corridas dos chamados concluídos. As prioridades e status são demonstrativos, sem regras de SLA.
