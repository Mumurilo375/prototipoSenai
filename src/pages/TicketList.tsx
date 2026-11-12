import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  FilterX,
  ImageIcon,
  Plus,
  Search,
} from "lucide-react";
import { config } from "../config";
import { useStore } from "../store";
import { priorities, statuses, type Role, type Ticket } from "../types";
import { normalized, shortDate } from "../utils/format";
import {
  PageHeading,
  Avatar,
  Picture,
  PriorityBadge,
  StatusBadge,
} from "../components/ui";

export function TicketList({ role }: { role: Exclude<Role, "gestao"> }) {
  const { tickets } = useStore();
  const maintenance = role === "manutencao";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("recent");
  const mine = useMemo(
    () =>
      maintenance
        ? tickets
        : tickets.filter((t) => t.requester === config.collaborator),
    [tickets, maintenance],
  );
  const filtered = useMemo(
    () =>
      mine
        .filter(
          (t) =>
            (!status || t.status === status) &&
            (!priority || t.priority === priority) &&
            normalized(
              [t.title, t.protocol, t.location, t.category, t.assignee].join(
                " ",
              ),
            ).includes(normalized(search)),
        )
        .sort((a, b) =>
          sort === "priority"
            ? priorities.indexOf(b.priority) - priorities.indexOf(a.priority) ||
              b.createdAt.localeCompare(a.createdAt)
            : sort === "oldest"
              ? a.createdAt.localeCompare(b.createdAt)
              : b.createdAt.localeCompare(a.createdAt),
        ),
    [mine, status, priority, search, sort],
  );
  const counts = [
    {
      label: "Total de solicitações",
      number: mine.length,
      hint: maintenance ? "Todos os departamentos" : "Registradas por você",
    },
    {
      label: "Aguardando atendimento",
      number: mine.filter((t) => ["Aberto", "Em triagem"].includes(t.status))
        .length,
      hint: "Abertas e em triagem",
    },
    {
      label: "Em atendimento",
      number: mine.filter((t) =>
        ["Em andamento", "Pendente"].includes(t.status),
      ).length,
      hint: "Em andamento e pendentes",
    },
    {
      label: "Concluídas",
      number: mine.filter((t) => t.status === "Concluído").length,
      hint: "Atendimentos finalizados",
    },
  ];
  const hasFilters = Boolean(search || status || priority);
  function clearFilters() {
    setSearch("");
    setStatus("");
    setPriority("");
  }
  return (
    <>
      <PageHeading
        title={maintenance ? "Central de manutenção" : "Minhas solicitações"}
        description={
          maintenance
            ? "Gerencie as solicitações recebidas e acompanhe o andamento dos atendimentos."
            : "Acompanhe seus pedidos de manutenção e registre novas solicitações."
        }
        action={
          <Link to="/colaborador/nova" className="button primary">
            <Plus size={18} />
            Nova solicitação
          </Link>
        }
      />
      <section className="summary-strip" aria-label="Resumo das solicitações">
        {counts.map(({ label, number, hint }) => (
          <div className="summary-item" key={label}>
            <div className="summary-label">{label}</div>
            <div className="summary-value">
              {String(number).padStart(2, "0")}
              <span>{hint}</span>
            </div>
          </div>
        ))}
      </section>
      <section className="list-panel" aria-labelledby="list-title">
        <div className="list-heading">
          <div>
            <h2 id="list-title">
              {maintenance
                ? "Fila de solicitações"
                : "Seus pedidos de manutenção"}
              <span className="count-label">{mine.length}</span>
            </h2>
            <p>
              {maintenance
                ? "Uma visão centralizada para organizar cada atendimento."
                : "Consulte o status e as atualizações de cada atendimento."}
            </p>
          </div>
          <span className="local-status">
            <span />
            Atualizado neste navegador
          </span>
        </div>
        <div
          className="status-tabs"
          role="group"
          aria-label="Filtrar por status"
        >
          <button
            className={!status ? "selected" : ""}
            onClick={() => setStatus("")}
          >
            Todas<span>{mine.length}</span>
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              className={status === s ? "selected" : ""}
              onClick={() => setStatus(s)}
            >
              {s}
              <span>{mine.filter((t) => t.status === s).length}</span>
            </button>
          ))}
        </div>
        <div className="table-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              aria-label="Pesquisar solicitações"
              placeholder="Buscar por título, protocolo ou localização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                aria-label="Limpar pesquisa"
                onClick={() => setSearch("")}
              >
                <FilterX size={16} />
              </button>
            )}
          </div>
          <div className="filter-controls">
            <select
              aria-label="Filtrar por prioridade"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">Todas as prioridades</option>
              {priorities.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <label className="sort-control">
              <ArrowDownWideNarrow size={16} />
              <select
                aria-label="Ordenar solicitações"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="recent">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="priority">Maior prioridade</option>
              </select>
            </label>
          </div>
        </div>
        {filtered.length ? (
          <div className="table-scroll">
            <table
              className={`ticket-table ${maintenance ? "maintenance-table" : ""}`}
            >
              <thead>
                <tr>
                  <th scope="col">Solicitação</th>
                  <th scope="col">Localização</th>
                  {maintenance && <th scope="col">Categoria</th>}
                  <th scope="col">Prioridade</th>
                  <th scope="col">Status</th>
                  {maintenance && <th scope="col">Responsável</th>}
                  <th scope="col">Abertura</th>
                  <th scope="col">
                    <span className="sr-only">Abrir</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} role={role} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Search size={29} />
            <h3>Nenhuma solicitação encontrada</h3>
            <p>
              {hasFilters
                ? "Tente outro termo ou remova os filtros para ver seus pedidos."
                : "Registre uma solicitação para começar a acompanhar o atendimento."}
            </p>
            {hasFilters ? (
              <button className="button secondary" onClick={clearFilters}>
                <FilterX size={16} />
                Limpar filtros
              </button>
            ) : (
              <Link className="button primary" to="/colaborador/nova">
                Nova solicitação
              </Link>
            )}
          </div>
        )}
        <div className="table-footer">
          <span>
            Exibindo <strong>{filtered.length}</strong> de{" "}
            <strong>{mine.length}</strong> solicitações
          </span>
          {hasFilters ? (
            <button className="text-button" onClick={clearFilters}>
              Limpar filtros
            </button>
          ) : (
            <span>Todos os registros carregados</span>
          )}
        </div>
      </section>
    </>
  );
}

function TicketRow({ ticket: t, role }: { ticket: Ticket; role: Role }) {
  const maintenance = role === "manutencao";
  return (
    <tr>
      <td>
        <div className="ticket-title-cell">
          {t.photos.length ? (
            <Picture photo={t.photos[0]} className="ticket-thumb" />
          ) : (
            <span className="ticket-thumb no-photo">
              <ImageIcon size={17} />
            </span>
          )}
          <div>
            <span className="protocol">{t.protocol}</span>
            <Link className="ticket-title" to={`/${role}/solicitacoes/${t.id}`}>
              {t.title}
            </Link>
            {!maintenance && (
              <span className="ticket-category">{t.category}</span>
            )}
          </div>
        </div>
      </td>
      <td>
        <span className="location-cell">{t.location}</span>
        <span className="cell-subtitle">{t.department}</span>
      </td>
      {maintenance && <td>{t.category}</td>}
      <td>
        <PriorityBadge priority={t.priority} />
      </td>
      <td>
        <StatusBadge status={t.status} />
      </td>
      {maintenance && (
        <td>
          {t.assignee ? (
            <span className="assignee">
              <Avatar name={t.assignee} className="mini-avatar" />
              <span>{t.assignee.split(" ").slice(0, 2).join(" ")}</span>
            </span>
          ) : (
            <span className="unassigned">Não atribuído</span>
          )}
        </td>
      )}
      <td>
        <time dateTime={t.createdAt} className="date-cell">
          {shortDate(t.createdAt)}
          <span>{new Date(t.createdAt).getFullYear()}</span>
        </time>
      </td>
      <td>
        <Link
          className="row-link"
          to={`/${role}/solicitacoes/${t.id}`}
          aria-label={`Abrir ${t.protocol}`}
        >
          <ArrowRight size={17} />
        </Link>
      </td>
    </tr>
  );
}
