import type { Category, Photo, Priority, Status, Ticket } from "../types";

import { requestPhoto } from "../config/images";
import { config } from "../config";

type SeedRow = [
  string,
  Category,
  string,
  string,
  string,
  Priority,
  Status,
  number,
  string,
  Photo[],
  string?,
];
const rows: SeedRow[] = [
  [
    "Ar-condicionado da sala de reuniões não está refrigerando",
    "Climatização",
    "Sala de Reuniões 02",
    "Administrativo",
    "O aparelho liga normalmente, mas não está refrigerando o ambiente. O problema foi percebido durante a manhã e está prejudicando a utilização da sala.",
    "Média",
    "Aberto",
    0,
    config.collaborator,
    [requestPhoto("ac"), requestPhoto("acOutdoor")],
  ],
  [
    "Vazamento próximo à pia do banheiro",
    "Hidráulica",
    "Banheiro do bloco administrativo",
    "Administrativo",
    "Foi identificado um vazamento próximo à pia, com acúmulo de água no piso. A área foi sinalizada para evitar escorregões.",
    "Alta",
    "Em andamento",
    1,
    "Rafael Martins",
    [requestPhoto("sink")],
    config.maintenance,
  ],
  [
    "Luminária do corredor com defeito",
    "Elétrica",
    "Corredor do segundo andar",
    "Administrativo",
    "Uma das luminárias não está funcionando, reduzindo a iluminação do corredor. O problema é mais perceptível no fim do expediente.",
    "Média",
    "Pendente",
    3,
    config.collaborator,
    [requestPhoto("light")],
    "Ana Carol Santos",
  ],
  [
    "Cadeira de escritório com encosto danificado",
    "Mobiliário",
    "Departamento Financeiro",
    "Financeiro",
    "A cadeira apresenta defeito no encosto e precisa de avaliação para reparo ou substituição.",
    "Baixa",
    "Concluído",
    8,
    config.collaborator,
    [requestPhoto("chair")],
    "Pedro Henrique Lima",
  ],
  [
    "Porta da sala de arquivos não fecha corretamente",
    "Estrutura predial",
    "Sala de Arquivos",
    "Administrativo",
    "A porta está desalinhada e apresenta dificuldade para fechar. É necessário verificar as dobradiças e o alinhamento da folha.",
    "Baixa",
    "Aberto",
    2,
    "Juliana Ferreira",
    [requestPhoto("archiveDoor")],
  ],
  [
    "Tomada com sinais de superaquecimento",
    "Elétrica",
    "Sala de Equipamentos",
    "Tecnologia da Informação",
    "Uma tomada apresentou aquecimento excessivo e foi retirada de uso preventivamente. Solicitamos avaliação prioritária da instalação.",
    "Crítica",
    "Em triagem",
    0,
    "Lucas Almeida",
    [requestPhoto("socket")],
    "Ana Carol Santos",
  ],
  [
    "Bebedouro da recepção sem refrigeração",
    "Equipamentos",
    "Recepção principal",
    "Administrativo",
    "A água do bebedouro permanece em temperatura ambiente mesmo após várias horas ligado. O abastecimento de água está normal.",
    "Média",
    "Em andamento",
    4,
    config.collaborator,
    [requestPhoto("waterFountain")],
    config.maintenance,
  ],
  [
    "Mesa de trabalho com estrutura instável",
    "Mobiliário",
    "Sala de Compras",
    "Compras",
    "A mesa apresenta movimentação lateral durante o uso. Os pés parecem estar desnivelados e os parafusos precisam de avaliação.",
    "Baixa",
    "Concluído",
    12,
    "Rafael Martins",
    [requestPhoto("unstableDesk")],
    "Pedro Henrique Lima",
  ],
  [
    "Fechadura da sala de suprimentos danificada",
    "Estrutura predial",
    "Sala de Suprimentos",
    "Compras",
    "A chave gira, mas a fechadura não trava a porta. A equipe está mantendo o ambiente fechado até a avaliação.",
    "Alta",
    "Em andamento",
    2,
    config.management,
    [requestPhoto("damagedLock")],
    "Pedro Henrique Lima",
  ],
  [
    "Infiltração na parede próxima à janela",
    "Estrutura predial",
    "Sala de Treinamento",
    "Recursos Humanos",
    "Após a última chuva, surgiu uma mancha de umidade na parede próxima à janela. Há descascamento da pintura na parte inferior.",
    "Alta",
    "Pendente",
    6,
    config.collaborator,
    [requestPhoto("wallLeak")],
    config.maintenance,
  ],
  [
    "Ventilador com ruído excessivo",
    "Climatização",
    "Sala de Apoio",
    "Operações",
    "O ventilador apresenta ruído forte ao ser ligado na segunda velocidade. Foi desligado até que a equipe faça a avaliação.",
    "Média",
    "Concluído",
    10,
    "Lucas Almeida",
    [requestPhoto("noisyFan")],
    config.maintenance,
  ],
  [
    "Persiana da sala de treinamento travada",
    "Mobiliário",
    "Sala de Treinamento",
    "Recursos Humanos",
    "A persiana não recolhe completamente e uma das lâminas está solta. A entrada de luz está prejudicando as apresentações.",
    "Baixa",
    "Em triagem",
    1,
    config.collaborator,
    [requestPhoto("blinds")],
    "Pedro Henrique Lima",
  ],
];

export function seededPhotosForTitle(title: string): Photo[] | undefined {
  const row = rows.find(([seedTitle]) => seedTitle === title);
  return row?.[9];
}

export function makeSeed(): Ticket[] {
  const today = new Date();
  today.setHours(9, 15, 0, 0);
  if (today.getTime() > Date.now()) today.setDate(today.getDate() - 1);
  return rows.map(
    (
      [
        title,
        category,
        location,
        department,
        description,
        priority,
        status,
        days,
        requester,
        photos,
        assignee,
      ],
      index,
    ) => {
      const created = new Date(
        today.getTime() - days * 86400000 - index * 3 * 60000,
      );
      const stamp = (fraction: number) =>
        new Date(
          Math.min(Date.now(), created.getTime() + fraction * 3600000),
        ).toISOString();
      const history: Ticket["history"] = [
        {
          id: `${index}-open`,
          date: created.toISOString(),
          title: "Solicitação registrada",
          author: requester,
        },
      ];
      if (status !== "Aberto") {
        history.push({
          id: `${index}-triage`,
          date: stamp(0.15),
          title: "Chamado recebido pela manutenção",
          author: config.maintenance,
        });
        history.push({
          id: `${index}-priority`,
          date: stamp(0.2),
          title: `Prioridade definida como ${priority.toLowerCase()}`,
          author: config.maintenance,
        });
        if (assignee)
          history.push({
            id: `${index}-assignee`,
            date: stamp(0.25),
            title: `Atendimento atribuído a ${assignee}`,
            author: config.maintenance,
          });
      }
      if (["Em andamento", "Pendente", "Concluído"].includes(status))
        history.push({
          id: `${index}-started`,
          date: stamp(1),
          title: "Atendimento iniciado",
          author: assignee || config.maintenance,
        });
      if (status === "Pendente")
        history.push({
          id: `${index}-pending`,
          date: stamp(3),
          title: "Atendimento pendente",
          author: assignee || config.maintenance,
          note:
            category === "Elétrica"
              ? "Aguardando recebimento da luminária de reposição."
              : "Aguardando avaliação da vedação externa em período sem chuva.",
        });
      if (status === "Concluído")
        history.push({
          id: `${index}-completed`,
          date: stamp(30),
          title: "Solicitação concluída",
          author: assignee || config.maintenance,
          note:
            category === "Mobiliário"
              ? "Estrutura ajustada e fixações revisadas. Mobiliário liberado para uso."
              : "Equipamento verificado e funcionamento restabelecido.",
        });
      return {
        id: String(index + 1),
        protocol: `SOL-${created.getFullYear()}-${String(index + 1).padStart(4, "0")}`,
        title,
        category,
        location,
        department,
        description,
        priority,
        status,
        requester,
        photos,
        assignee: assignee || "",
        createdAt: created.toISOString(),
        completedAt: status === "Concluído" ? stamp(30) : undefined,
        history,
      };
    },
  );
}
