import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, CircleAlert, Clock3 } from "lucide-react";
import { useStore } from "../store";
import { categories, statuses } from "../types";
import { PageHeading, PriorityBadge, StatusBadge } from "../components/ui";
import { shortDate, slug } from "../utils/format";

export function Dashboard() {
  const { tickets } = useStore();
  const done = tickets.filter((t) => t.status === "Concluído");
  const resolved = done.filter((t) => t.completedAt);
  const hours = resolved.length
    ? resolved.reduce(
        (sum, t) =>
          sum +
          (Date.parse(t.completedAt!) - Date.parse(t.createdAt)) / 3600000,
        0,
      ) / resolved.length
    : null;
  const awaiting = tickets.filter((t) =>
    ["Aberto", "Em triagem", "Pendente"].includes(t.status),
  ).length;
  const inProgress = tickets.filter((t) => t.status === "Em andamento").length;
  const attention = tickets
    .filter((t) => t.status !== "Concluído")
    .sort(
      (a, b) =>
        Number(b.priority === "Crítica") - Number(a.priority === "Crítica") ||
        Number(b.status === "Pendente") - Number(a.status === "Pendente") ||
        a.createdAt.localeCompare(b.createdAt),
    )
    .slice(0, 4);
  const metric = [
    {
      label: "Total de solicitações",
      value: String(tickets.length).padStart(2, "0"),
      note: "Todos os registros",
      className: "",
    },
    {
      label: "Chamados em aberto",
      value: String(awaiting).padStart(2, "0"),
      note: "Abertos, em triagem e pendentes",
      className: "metric-amber",
    },
    {
      label: "Em andamento",
      value: String(inProgress).padStart(2, "0"),
      note: "Atendimentos iniciados",
      className: "metric-blue",
    },
    {
      label: "Concluídos",
      value: String(done.length).padStart(2, "0"),
      note: "Atendimentos finalizados",
      className: "metric-green",
    },
    {
      label: "Tempo médio de resolução",
      value:
        hours === null
          ? "—"
          : hours < 1
            ? `${Math.round(hours * 60)} min`
            : `${hours.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h`,
      note: `${resolved.length} atendimento${resolved.length === 1 ? "" : "s"} com conclusão`,
      className: "",
    },
  ];
  return (
    <>
      <PageHeading
        title="Visão gerencial"
        description="Acompanhe os atendimentos e os principais indicadores da manutenção interna."
        action={
          <span className="period-label">
            <CalendarDays size={17} />
            Todos os registros
          </span>
        }
      />
      <div className="dashboard-metrics">
        {metric.map((m) => (
          <div className={`dashboard-metric ${m.className}`} key={m.label}>
            <span>{m.label}</span>
            <strong>{m.value}</strong>
            <small>{m.note}</small>
          </div>
        ))}
      </div>
      <div className="charts-grid">
        <section className="surface chart-panel">
          <div className="section-title">
            <h2>Distribuição por status</h2>
            <span>{tickets.length} solicitações</span>
          </div>
          <p className="chart-caption">
            Como os atendimentos estão distribuídos agora.
          </p>
          <div
            className="bar-chart"
            role="img"
            aria-label={statuses
              .map(
                (s) => `${s}: ${tickets.filter((t) => t.status === s).length}`,
              )
              .join("; ")}
          >
            {statuses.map((s) => {
              const count = tickets.filter((t) => t.status === s).length;
              return (
                <div className={`chart-row chart-status-${slug(s)}`} key={s}>
                  <span className="chart-row-label">
                    <i />
                    {s}
                  </span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(count / Math.max(tickets.length, 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <strong>{count}</strong>
                  <span className="chart-percentage">
                    {Math.round((count / Math.max(tickets.length, 1)) * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="chart-note">
            <span className="local-status">
              <span />
              Calculado com os dados atuais
            </span>
            <span>Base: {tickets.length} chamados</span>
          </div>
        </section>
        <section className="surface chart-panel">
          <div className="section-title">
            <h2>Solicitações por categoria</h2>
            <span>6 categorias</span>
          </div>
          <p className="chart-caption">
            Os tipos de ocorrência mais frequentes na central.
          </p>
          <div
            className="bar-chart category-chart"
            role="img"
            aria-label={categories
              .map(
                (c) =>
                  `${c}: ${tickets.filter((t) => t.category === c).length}`,
              )
              .join("; ")}
          >
            {[...categories]
              .sort(
                (a, b) =>
                  tickets.filter((t) => t.category === b).length -
                  tickets.filter((t) => t.category === a).length,
              )
              .map((category) => {
                const count = tickets.filter(
                  (t) => t.category === category,
                ).length;
                return (
                  <div className="chart-row" key={category}>
                    <span className="chart-row-label">{category}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(count / Math.max(...categories.map((c) => tickets.filter((t) => t.category === c).length), 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <strong>{count}</strong>
                  </div>
                );
              })}
          </div>
          <div className="chart-note">
            <span>Quantidade de solicitações por tipo de ocorrência</span>
          </div>
        </section>
      </div>
      <section className="surface attention-panel">
        <div className="section-title">
          <h2>
            <CircleAlert size={19} />
            Demandas que merecem atenção
          </h2>
          <Link to="/manutencao" className="text-button">
            Ver central de manutenção
            <ArrowRight size={15} />
          </Link>
        </div>
        <p className="attention-caption">
          Prioridades críticas, pendências e registros mais antigos ainda em
          atendimento.
        </p>
        {attention.length ? (
          <div className="table-scroll">
            <table className="attention-table">
              <thead>
                <tr>
                  <th>Solicitação</th>
                  <th>Motivo de atenção</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Abertura</th>
                  <th>
                    <span className="sr-only">Abrir</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {attention.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className="protocol">{t.protocol}</span>
                      <Link
                        className="ticket-title"
                        to={`/gestao/solicitacoes/${t.id}`}
                      >
                        {t.title}
                      </Link>
                    </td>
                    <td>
                      <span
                        className={
                          t.priority === "Crítica" ? "critical-reason" : "muted"
                        }
                      >
                        {t.priority === "Crítica"
                          ? "Avaliação prioritária"
                          : t.status === "Pendente"
                            ? "Aguardando continuidade"
                            : "Acompanhar tempo de atendimento"}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>{shortDate(t.createdAt)}</td>
                    <td>
                      <Link
                        className="row-link"
                        to={`/gestao/solicitacoes/${t.id}`}
                        aria-label={`Abrir ${t.protocol}`}
                      >
                        <ArrowRight size={17} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <CheckDone />
            <h3>Todos os atendimentos foram concluídos</h3>
            <p>Não há solicitações aguardando acompanhamento.</p>
          </div>
        )}
      </section>
      <div className="list-footnote">
        <Clock3 size={16} />
        <span>
          Os indicadores refletem os chamados deste navegador. O tempo médio
          considera apenas registros concluídos e inclui horas corridas.
        </span>
      </div>
    </>
  );
}
function CheckDone() {
  return (
    <span className="local-status">
      <span />
      Tudo em dia
    </span>
  );
}
