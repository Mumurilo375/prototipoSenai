import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { config, currentPersonName } from "./config";
import {
  downloadedSeedPhotosForTitle,
  makeSeed,
  seededPhotosForTitle,
} from "./data/seed";
import { newId } from "./utils/id";
import {
  categories,
  priorities,
  statuses,
  type HistoryEvent,
  type NewTicket,
  type Ticket,
  type TicketUpdate,
} from "./types";

function validTicket(value: unknown): value is Ticket {
  if (!value || typeof value !== "object") return false;
  const t = value as Ticket;
  return (
    [
      "id",
      "protocol",
      "title",
      "location",
      "department",
      "description",
      "requester",
      "assignee",
    ].every((k) => typeof t[k as keyof Ticket] === "string") &&
    categories.includes(t.category) &&
    statuses.includes(t.status) &&
    priorities.includes(t.priority) &&
    Number.isFinite(Date.parse(t.createdAt)) &&
    (!t.completedAt || Number.isFinite(Date.parse(t.completedAt))) &&
    Array.isArray(t.photos) &&
    t.photos.every(
      (p) =>
        typeof p.alt === "string" &&
        typeof p.url === "string" &&
        /^(https:\/\/|\/(?!\/)|data:image\/jpeg;base64,)/.test(p.url),
    ) &&
    Array.isArray(t.history) &&
    t.history.every(
      (e) =>
        typeof e.id === "string" &&
        typeof e.title === "string" &&
        typeof e.author === "string" &&
        (e.note === undefined || typeof e.note === "string") &&
        Number.isFinite(Date.parse(e.date)),
    )
  );
}
function load(): { tickets: Ticket[]; warning: string } {
  try {
    const stored = localStorage.getItem(config.storageKey);
    if (!stored) return { tickets: makeSeed(), warning: "" };
    const data: unknown = JSON.parse(stored);
    if (
      !Array.isArray(data) ||
      !data.length ||
      !data.every(validTicket) ||
      new Set(data.map((t) => t.id)).size !== data.length
    )
      throw new Error("invalid");
    return {
      tickets: data.map((ticket) => {
        const seededPhotos = seededPhotosForTitle(ticket.title);
        return {
          ...ticket,
          photos:
            downloadedSeedPhotosForTitle(ticket.title) ??
            (ticket.photos.length > 0
              ? ticket.photos
              : (seededPhotos ?? ticket.photos)),
          requester: currentPersonName(ticket.requester),
          assignee: currentPersonName(ticket.assignee),
          title: currentPersonName(ticket.title),
          description: currentPersonName(ticket.description),
          history: ticket.history.map((event) => ({
            ...event,
            author: currentPersonName(event.author),
            title: currentPersonName(event.title),
            note: event.note ? currentPersonName(event.note) : event.note,
          })),
        };
      }),
      warning: "",
    };
  } catch {
    return {
      tickets: makeSeed(),
      warning:
        "Os dados locais não puderam ser recuperados. A demonstração inicial foi carregada.",
    };
  }
}

type Store = {
  tickets: Ticket[];
  storageWarning: string;
  notification: string;
  dismiss: () => void;
  create: (values: NewTicket) => Ticket;
  update: (id: string, values: TicketUpdate) => void;
  reset: () => void;
};
const Context = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(load);
  const [tickets, setTickets] = useState(initial.tickets);
  const [storageWarning, setStorageWarning] = useState(initial.warning);
  const [notification, setNotification] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(initial.tickets));
    } catch {
      setStorageWarning(
        "Armazenamento indisponível ou cheio. As alterações serão mantidas apenas nesta sessão.",
      );
    }
  }, [initial]);
  function save(next: Ticket[]) {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(next));
      setStorageWarning("");
    } catch {
      setStorageWarning(
        "Armazenamento indisponível ou cheio. Suas alterações estão nesta sessão; não recarregue antes de terminar a demonstração.",
      );
    }
    setTickets(next);
  }
  function create(values: NewTicket) {
    const now = new Date();
    const sequence =
      Math.max(
        ...tickets.map((t) => Number(t.protocol.split("-").at(-1)) || 0),
        0,
      ) + 1;
    const ticket: Ticket = {
      ...values,
      id: newId(),
      protocol: `SOL-${now.getFullYear()}-${String(sequence).padStart(4, "0")}`,
      requester: config.collaborator,
      priority: "Média",
      status: "Aberto",
      assignee: "",
      createdAt: now.toISOString(),
      history: [
        {
          id: newId(),
          date: now.toISOString(),
          title: "Solicitação registrada",
          author: config.collaborator,
        },
      ],
    };
    save([ticket, ...tickets]);
    setNotification(`Solicitação ${ticket.protocol} registrada com sucesso.`);
    return ticket;
  }
  function update(id: string, values: TicketUpdate) {
    const current = tickets.find((t) => t.id === id);
    if (!current) return;
    const now = new Date().toISOString();
    const events: HistoryEvent[] = [];
    const event = (title: string, note?: string) =>
      events.push({
        id: newId(),
        date: now,
        title,
        note,
        author: config.maintenance,
      });
    if (current.priority !== values.priority)
      event(
        `Prioridade alterada de ${current.priority.toLowerCase()} para ${values.priority.toLowerCase()}`,
      );
    if (current.assignee !== values.assignee)
      event(
        values.assignee
          ? `Atendimento atribuído a ${values.assignee}`
          : "Responsável removido",
      );
    if (current.status !== values.status)
      event(
        values.status === "Concluído"
          ? "Solicitação concluída"
          : `Status alterado de “${current.status}” para “${values.status}”`,
        values.note.trim() || undefined,
      );
    else if (values.note.trim())
      event("Observação da manutenção", values.note.trim());
    if (!events.length) return;
    const { note: _note, ...changes } = values;
    save(
      tickets.map((t) =>
        t.id === id
          ? {
              ...t,
              ...changes,
              completedAt:
                changes.status === "Concluído"
                  ? current.completedAt || now
                  : undefined,
              history: [...t.history, ...events],
            }
          : t,
      ),
    );
    setNotification(
      values.status === "Concluído"
        ? "Atendimento concluído. O colaborador já pode consultar a atualização."
        : "Atendimento atualizado. As alterações foram registradas no histórico.",
    );
  }
  function reset() {
    save(makeSeed());
    setNotification(
      "Demonstração restaurada. Os 12 chamados originais estão disponíveis.",
    );
  }
  return (
    <Context.Provider
      value={{
        tickets,
        storageWarning,
        notification,
        dismiss: () => setNotification(""),
        create,
        update,
        reset,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("StoreProvider ausente");
  return store;
}
