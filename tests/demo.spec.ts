import { expect, test } from "@playwright/test";
import path from "node:path";

test("roteiro completo: criar, gerenciar, consultar, concluir, recarregar e restaurar", async ({
  page,
}) => {
  // Também cobre uma apresentação via HTTP na rede local, sem randomUUID.
  await page.addInitScript(() => {
    Object.defineProperty(window.crypto, "randomUUID", { value: undefined });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/colaborador");
  await expect(
    page.getByRole("heading", { name: "Minhas solicitações" }),
  ).toBeVisible();
  await expect(page.locator(".ticket-table tbody tr")).toHaveCount(6);
  await page
    .getByRole("link", { name: "Nova solicitação", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Enviar solicitação" }).click();
  await expect(
    page.getByText("Informe um título com pelo menos 5 caracteres."),
  ).toBeVisible();
  await page
    .getByLabel("Título da solicitação")
    .fill("Ar-condicionado sem refrigeração");
  await page
    .getByLabel("Categoria", { exact: false })
    .selectOption("Climatização");
  await page.getByLabel("Localização").fill("Sala de Reuniões 02");
  await page.getByLabel("Departamento").fill("Administrativo");
  await page
    .getByLabel("Descrição do problema")
    .fill(
      "O ar-condicionado da sala de reuniões está ligado, mas não está refrigerando adequadamente.",
    );
  await page
    .locator("#photo")
    .setInputFiles(path.resolve("public/images/16592625.jpg"));
  await expect(page.getByText("Foto anexada")).toBeVisible();
  await page.getByRole("button", { name: "Enviar solicitação" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Ar-condicionado sem refrigeração",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".detail-heading .protocol")).toContainText(
    "-0013",
  );
  await expect(page.locator(".detail-heading .status")).toHaveText("Aberto");
  await expect(page.locator(".gallery-photo img")).toHaveAttribute(
    "src",
    /^data:image\/jpeg;base64,/,
  );
  const ticketUrl = page.url();
  await page
    .getByRole("button", { name: "Manutenção Central de atendimento" })
    .click();
  await expect(page).toHaveURL(/\/manutencao$/);
  await page
    .getByRole("link", {
      name: "Ar-condicionado sem refrigeração",
      exact: true,
    })
    .click();
  await page.getByLabel("Prioridade", { exact: true }).selectOption("Média");
  await page
    .getByLabel("Responsável", { exact: true })
    .selectOption("Murilo Pereira");
  await page.getByLabel("Status do atendimento").selectOption("Em andamento");
  await page
    .getByLabel("Adicionar observação")
    .fill(
      "Solicitação recebida. A equipe realizará uma avaliação do equipamento.",
    );
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.locator(".detail-heading .status")).toHaveText(
    "Em andamento",
  );
  await expect(page.locator(".timeline")).toContainText(
    "Atendimento atribuído a Murilo Pereira",
  );
  await page
    .getByRole("button", { name: "Colaborador Minhas solicitações" })
    .click();
  await expect(page).toHaveURL(/\/colaborador$/);
  await page
    .getByRole("link", {
      name: "Ar-condicionado sem refrigeração",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(ticketUrl);
  await expect(page.locator(".timeline")).toContainText(
    "A equipe realizará uma avaliação",
  );
  await expect(
    page.getByRole("heading", { name: "Gerenciar atendimento" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Manutenção Central de atendimento" })
    .click();
  await expect(page).toHaveURL(/\/manutencao$/);
  await page
    .getByRole("link", {
      name: "Ar-condicionado sem refrigeração",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Concluir atendimento", exact: true })
    .click();
  await page.getByRole("button", { name: "Salvar e concluir" }).click();
  await expect(
    page.getByText(
      "Descreva brevemente o serviço realizado para concluir o atendimento.",
    ),
  ).toBeVisible();
  await page
    .getByLabel("Serviço realizado")
    .fill("Equipamento verificado e funcionamento restabelecido.");
  await page.getByRole("button", { name: "Salvar e concluir" }).click();
  await page
    .getByRole("button", { name: "Colaborador Minhas solicitações" })
    .click();
  await expect(page).toHaveURL(/\/colaborador$/);
  await page
    .getByRole("link", {
      name: "Ar-condicionado sem refrigeração",
      exact: true,
    })
    .click();
  await expect(page.locator(".detail-heading .status")).toHaveText("Concluído");
  await page.reload();
  await expect(page.locator(".detail-heading .status")).toHaveText("Concluído");
  await expect(page.locator(".timeline")).toContainText(
    "Equipamento verificado e funcionamento restabelecido.",
  );
  await page
    .getByRole("button", { name: "Gestão Indicadores e resultados" })
    .click();
  await expect(page).toHaveURL(/\/gestao$/);
  await expect(
    page
      .locator(".dashboard-metric")
      .filter({ hasText: "Total de solicitações" })
      .locator("strong"),
  ).toHaveText("13");
  await expect(
    page
      .locator(".dashboard-metric")
      .filter({ hasText: /^Concluídos/ })
      .locator("strong"),
  ).toHaveText("04");
  await page.getByRole("button", { name: "Restaurar demonstração" }).click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(
    page.locator(".dashboard-metric").first().locator("strong"),
  ).toHaveText("13");
  await page.getByRole("button", { name: "Restaurar demonstração" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Restaurar demonstração", exact: true })
    .click();
  await expect(page).toHaveURL(/\/colaborador$/);
  await page
    .getByRole("button", { name: "Gestão Indicadores e resultados" })
    .click();
  await expect(
    page.locator(".dashboard-metric").first().locator("strong"),
  ).toHaveText("12");
  await page.reload();
  await expect(
    page.locator(".dashboard-metric").first().locator("strong"),
  ).toHaveText("12");
  expect(errors).toEqual([]);
});

test("filtros, prioridade, responsável e observação persistem entre ambientes", async ({
  page,
}) => {
  await page.goto("/manutencao");
  await expect(page.locator(".ticket-table tbody tr")).toHaveCount(12);
  await page.getByLabel("Pesquisar solicitações").fill("tomada");
  await expect(page.locator(".ticket-table tbody tr")).toHaveCount(1);
  await page
    .getByRole("link", {
      name: "Tomada com sinais de superaquecimento",
      exact: true,
    })
    .click();
  await page.getByLabel("Prioridade", { exact: true }).selectOption("Alta");
  await page
    .getByLabel("Responsável", { exact: true })
    .selectOption("Pedro Henrique Lima");
  await page
    .getByLabel("Adicionar observação")
    .fill("Instalação isolada. Equipe responsável avisada.");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await page.reload();
  await expect(page.locator(".detail-heading .priority")).toHaveText("Alta");
  await expect(page.locator(".responsible-line")).toContainText(
    "Pedro Henrique Lima",
  );
  await expect(page.locator(".timeline")).toContainText(
    "Instalação isolada. Equipe responsável avisada.",
  );
  await page
    .getByRole("link", { name: "Voltar para a central de manutenção" })
    .click();
  await page.getByLabel("Filtrar por prioridade").selectOption("Crítica");
  await expect(
    page.getByRole("heading", { name: "Nenhuma solicitação encontrada" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Limpar filtros", exact: true })
    .first()
    .click();
  await expect(page.locator(".ticket-table tbody tr")).toHaveCount(12);
  await page.getByRole("button", { name: /^Pendente/ }).click();
  await expect(page.locator(".ticket-table tbody tr")).toHaveCount(2);
  await page.getByRole("button", { name: /^Todas/ }).click();
  await page.getByLabel("Ordenar solicitações").selectOption("oldest");
  await expect(page.locator(".ticket-table tbody tr").first()).toContainText(
    "Mesa de trabalho com estrutura instável",
  );
});

test("fotografias, galeria acessível e fallback sem imagens quebradas", async ({
  page,
}) => {
  await page.goto("/colaborador/solicitacoes/1");
  await expect(page.locator(".gallery-photo")).toHaveCount(2);
  await expect(page.locator(".gallery-photo img").first()).toBeVisible();
  await page.getByRole("button", { name: /^Ampliar foto 1/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("link", { name: "Ver fotografia original no Pexels" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.route("**/images/*.jpg", (route) => route.abort());
  await page.route("https://images.pexels.com/**", (route) => route.abort());
  await page.reload();
  await expect(page.locator(".gallery-photo .image-fallback")).toHaveCount(2);
  await expect(page.locator(".gallery-photo img")).toHaveCount(0);
});

test("troca de ambiente sempre inicia no topo", async ({ page }) => {
  await page.goto("/colaborador");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  await page
    .getByRole("button", { name: "Manutenção Central de atendimento" })
    .click();
  await expect(page).toHaveURL(/\/manutencao$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page
    .getByRole("button", { name: "Colaborador Minhas solicitações" })
    .click();
  await expect(page).toHaveURL(/\/colaborador$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test("capturas e responsividade: desktop, notebook e celular", async ({
  page,
}) => {
  await page.goto("/colaborador");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "artifacts/screenshots/colaborador-desktop.png",
    fullPage: true,
  });
  await page.goto("/manutencao");
  await page.screenshot({
    path: "artifacts/screenshots/manutencao-desktop.png",
    fullPage: true,
  });
  await page.goto("/colaborador/nova");
  await page.screenshot({
    path: "artifacts/screenshots/nova-solicitacao-desktop.png",
    fullPage: true,
  });
  await page.goto("/manutencao/solicitacoes/1");
  await page.screenshot({
    path: "artifacts/screenshots/detalhes-desktop.png",
    fullPage: true,
  });
  await page.goto("/gestao");
  await page.screenshot({
    path: "artifacts/screenshots/gestao-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/manutencao");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "artifacts/screenshots/manutencao-notebook.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/colaborador",
    "/colaborador/nova",
    "/manutencao/solicitacoes/1",
    "/gestao",
  ]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `artifacts/screenshots/${route.split("/").filter(Boolean).join("-")}-mobile.png`,
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page
    .getByRole("button", { name: "Manutenção Central de atendimento" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Central de manutenção", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Nova solicitação", exact: true })
    .last()
    .click();
  await page
    .getByLabel("Título da solicitação")
    .fill("Persiana da recepção travada");
  await page
    .getByLabel("Categoria", { exact: false })
    .selectOption("Mobiliário");
  await page.getByLabel("Localização").fill("Recepção");
  await page.getByLabel("Departamento").fill("Administrativo");
  await page
    .getByLabel("Descrição do problema")
    .fill(
      "A persiana não recolhe e está prejudicando a iluminação da recepção.",
    );
  await page.getByRole("button", { name: "Enviar solicitação" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Persiana da recepção travada",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page
    .getByRole("button", { name: "Manutenção Central de atendimento" })
    .click();
  await expect(page).toHaveURL(/\/manutencao$/);
  await page
    .getByRole("link", { name: "Persiana da recepção travada", exact: true })
    .click();
  await page.getByLabel("Status do atendimento").selectOption("Em andamento");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.locator(".detail-heading .status")).toHaveText(
    "Em andamento",
  );
});

test("arquivos inadequados e armazenamento indisponível têm feedback", async ({
  page,
}) => {
  await page.goto("/colaborador/nova");
  await page.locator("#photo").setInputFiles({
    name: "documento.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("não é uma imagem"),
  });
  await expect(page.getByRole("alert")).toContainText(
    "Selecione uma imagem JPG, PNG ou WebP",
  );
  await page.locator("#photo").setInputFiles({
    name: "grande.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.alloc(11 * 1024 * 1024),
  });
  await expect(page.getByRole("alert")).toContainText("no máximo 10 MB");
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("QuotaExceededError");
    };
  });
  await page.goto("/manutencao/solicitacoes/1");
  await page.getByLabel("Prioridade", { exact: true }).selectOption("Alta");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.locator(".storage-warning")).toContainText(
    "Armazenamento indisponível ou cheio",
  );
  await expect(page.locator(".detail-heading .priority")).toHaveText("Alta");
});

test("fotos centralizadas atualizam registros antigos sem apagar alterações", async ({
  page,
}) => {
  await page.goto("/colaborador");
  await page.evaluate(() => {
    const key = "solicitacoes-internas-v1";
    const tickets = JSON.parse(localStorage.getItem(key)!);
    const ticket = tickets.find((item: { id: string }) => item.id === "1");
    ticket.priority = "Alta";
    ticket.requester = "Mariana Costa";
    const previousManagement = tickets.find(
      (item: { id: string }) => item.id === "9",
    );
    previousManagement.requester = "Fernanda Ribeiro";
    previousManagement.history[0].author = "Fernanda Ribeiro";
    const previousMaintenance = tickets.find(
      (item: { id: string }) => item.id === "2",
    );
    previousMaintenance.assignee = "Carlos Oliveira";
    previousMaintenance.history.push({
      id: "legacy-maintenance-name",
      date: new Date().toISOString(),
      author: "Carlos Oliveira",
      title: "Atendimento atribuído a Carlos Oliveira",
      note: "Carlos Oliveira realizará a avaliação.",
    });
    ticket.photos[0] = {
      url: "https://images.pexels.com/photos/16592625/obsolete.jpg",
      localUrl: "/old-assets/16592625.jpg",
      alt: "Foto da versão anterior",
    };
    localStorage.setItem(key, JSON.stringify(tickets));
  });
  await page.goto("/colaborador/solicitacoes/1");
  await expect(page.locator(".gallery-photo img").first()).toHaveAttribute(
    "src",
    "/images/16592625.jpg",
  );
  await expect(page.locator(".detail-heading .priority")).toHaveText("Alta");
  for (const route of ["/colaborador", "/manutencao", "/gestao"]) {
    await page.goto(route);
    const avatar = page.locator(".user-block img");
    await expect(avatar).toBeVisible();
    await expect
      .poll(() =>
        avatar.evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await page.goto("/manutencao");
  await expect(page.locator(".assignee img")).toHaveCount(10);
  await expect
    .poll(() =>
      page
        .locator(".assignee img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await page.goto("/colaborador");
  await expect(page.locator(".ticket-table tbody tr")).toHaveCount(6);
  await page.goto("/manutencao/solicitacoes/2");
  await expect(page.locator(".responsible-line")).toContainText(
    "Murilo Pereira",
  );
  await expect(page.locator(".timeline")).toContainText(
    "Atendimento atribuído a Murilo Pereira",
  );
  await expect(page.locator(".timeline")).toContainText(
    "Murilo Pereira realizará a avaliação.",
  );
  await expect(page.getByText("Carlos Oliveira", { exact: false })).toHaveCount(
    0,
  );
  await page.goto("/gestao/solicitacoes/9");
  await expect(page.locator(".user-block")).toContainText("Andre Gustavo");
  await expect(page.locator(".info-grid")).toContainText("Andre Gustavo");
  await expect(
    page.getByText("Fernanda Ribeiro", { exact: false }),
  ).toHaveCount(0);
});
