import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ImageIcon,
  MapPin,
  Maximize2,
  MessageSquare,
  Save,
  UserRound,
  Wrench,
} from "lucide-react";
import {
  Avatar,
  Modal,
  Picture,
  PriorityBadge,
  StatusBadge,
} from "../components/ui";
import { useStore } from "../store";
import {
  priorities,
  statuses,
  technicians,
  type Photo,
  type Priority,
  type Role,
  type Status,
  type Ticket,
} from "../types";
import { fullDate } from "../utils/format";
import { resolvePhoto } from "../config/images";

export function TicketDetail({ role }: { role: Role }) {
  const { id } = useParams();
  const { tickets } = useStore();
  const ticket = tickets.find((t) => t.id === id);
  const [enlarged, setEnlarged] = useState<Photo | null>(null);
  if (!ticket)
    return (
      <div className="not-found">
        <h1>Solicitação não encontrada</h1>
        <p>O registro pode ter sido removido ao restaurar a demonstração.</p>
        <Link className="button primary" to={`/${role}`}>
          Voltar para a central
        </Link>
      </div>
    );
  const t = { ...ticket, photos: ticket.photos.map(resolvePhoto) };
  const stage =
    t.status === "Aberto"
      ? 0
      : t.status === "Em triagem"
        ? 1
        : t.status === "Concluído"
          ? 3
          : 2;
  return (
    <>
      <Link className="back-link" to={`/${role}`}>
        <ArrowLeft size={16} />
        {role === "colaborador"
          ? "Voltar para minhas solicitações"
          : role === "manutencao"
            ? "Voltar para a central de manutenção"
            : "Voltar para a visão gerencial"}
      </Link>
      <div className="detail-heading">
        <div className="detail-heading-meta">
          <span className="protocol">{t.protocol}</span>
          <StatusBadge status={t.status} />
          <PriorityBadge priority={t.priority} />
        </div>
        <h1>{t.title}</h1>
        <div className="detail-subtitle">
          <span>
            <CalendarDays size={15} />
            Aberta em {fullDate(t.createdAt)}
          </span>
          <span>
            <UserRound size={15} />
            {t.requester}
          </span>
        </div>
      </div>
      <section
        className="progress-track"
        aria-label={`Etapa atual: ${t.status}`}
      >
        {["Registrada", "Em avaliação", "Em atendimento", "Concluída"].map(
          (label, index) => (
            <div
              key={label}
              className={`progress-step ${index < stage ? "complete" : ""} ${index === stage ? "current" : ""}`}
            >
              <span>
                {index < stage || stage === 3 ? <Check size={15} /> : <span />}
              </span>
              <strong>{label}</strong>
              {index === stage && (
                <small>
                  {t.status === "Pendente"
                    ? "Aguardando continuidade"
                    : "Etapa atual"}
                </small>
              )}
            </div>
          ),
        )}
      </section>
      <div className="detail-layout">
        <div className="detail-main">
          <section className="surface information-section">
            <div className="section-title">
              <h2>Sobre a solicitação</h2>
              <span>Informações do registro</span>
            </div>
            <div className="detail-description">
              <h3>Descrição do problema</h3>
              <p>{t.description}</p>
            </div>
            <dl className="info-grid">
              <div>
                <dt>Categoria</dt>
                <dd>{t.category}</dd>
              </div>
              <div>
                <dt>Departamento</dt>
                <dd>{t.department}</dd>
              </div>
              <div>
                <dt>Localização</dt>
                <dd>
                  <MapPin size={15} />
                  {t.location}
                </dd>
              </div>
              <div>
                <dt>Solicitante</dt>
                <dd>{t.requester}</dd>
              </div>
            </dl>
            <div className="responsible-line">
              <span className="section-icon">
                <Wrench size={18} />
              </span>
              <div>
                <span>Responsável pelo atendimento</span>
                <strong>{t.assignee || "Aguardando atribuição"}</strong>
              </div>
              {t.completedAt && (
                <span className="completion-info">
                  <CheckCircle2 size={15} />
                  Concluída em {fullDate(t.completedAt)}
                </span>
              )}
            </div>
          </section>
          <section className="surface photos-section">
            <div className="section-title">
              <h2>
                Fotografias
                <span className="count-label">{t.photos.length}</span>
              </h2>
              <span>
                {t.photos.length ? "Clique para ampliar" : "Anexos do chamado"}
              </span>
            </div>
            {t.photos.length ? (
              <>
                <div className="photo-gallery">
                  {t.photos.map((photo, index) => (
                    <button
                      className="gallery-photo"
                      key={photo.url}
                      onClick={() => setEnlarged(photo)}
                      aria-label={`Ampliar foto ${index + 1}: ${photo.alt}`}
                    >
                      <Picture photo={photo} />
                      <span className="photo-overlay">
                        <ImageIcon size={15} />
                        {photo.source
                          ? "Fotografia ilustrativa"
                          : "Foto do solicitante"}
                        <Maximize2 size={16} />
                      </span>
                    </button>
                  ))}
                </div>
                <p className="photo-disclaimer">
                  {t.photos.some((p) => p.source)
                    ? "Imagens ilustrativas de equipamentos e ambientes. Não representam registros reais da empresa."
                    : "Anexo selecionado localmente pelo solicitante. Nenhum arquivo foi enviado a servidores."}
                </p>
              </>
            ) : (
              <div className="no-attachments">
                <ImageIcon size={23} />
                <div>
                  <strong>Nenhuma foto anexada</strong>
                  <span>
                    Esta solicitação foi registrada apenas com a descrição do
                    problema.
                  </span>
                </div>
              </div>
            )}
          </section>
          {role === "manutencao" && (
            <ManagementForm key={t.id + t.history.length} ticket={t} />
          )}
        </div>
        <aside className="surface history-section">
          <div className="section-title">
            <h2>Histórico do atendimento</h2>
            <Clock3 size={17} />
          </div>
          <p className="history-intro">
            Cada atualização, do registro à conclusão.
          </p>
          <ol className="timeline">
            {[...t.history].reverse().map((event, index) => (
              <li key={event.id} className={index === 0 ? "latest" : ""}>
                <span className="timeline-dot">
                  {index === 0 ? <Check size={12} /> : null}
                </span>
                <time dateTime={event.date}>{fullDate(event.date)}</time>
                <h3>{event.title}</h3>
                {event.note && <p>{event.note}</p>}
                <span className="event-author">
                  <Avatar name={event.author} className="tiny-avatar" />
                  {event.author}
                </span>
              </li>
            ))}
          </ol>
          <div className="history-footer">
            <CheckCircle2 size={15} />
            Histórico compartilhado entre os ambientes
          </div>
        </aside>
      </div>
      {enlarged && (
        <Modal
          title="Fotografia da solicitação"
          className="photo-modal"
          onClose={() => setEnlarged(null)}
        >
          <div className="enlarged-image">
            <Picture photo={enlarged} />
            <p>{enlarged.alt}</p>
            {enlarged.source && (
              <a
                href={enlarged.source}
                target="_blank"
                rel="noreferrer"
                className="text-button"
              >
                Ver fotografia original no Pexels
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

function ManagementForm({ ticket }: { ticket: Ticket }) {
  const { update } = useStore();
  const [status, setStatus] = useState<Status>(ticket.status);
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [assignee, setAssignee] = useState(ticket.assignee);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const changed =
    status !== ticket.status ||
    priority !== ticket.priority ||
    assignee !== ticket.assignee ||
    Boolean(note.trim());
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      status === "Concluído" &&
      ticket.status !== "Concluído" &&
      note.trim().length < 5
    ) {
      setError(
        "Descreva brevemente o serviço realizado para concluir o atendimento.",
      );
      document.getElementById("observation")?.focus();
      return;
    }
    update(ticket.id, { status, priority, assignee, note });
  }
  return (
    <section className="surface management-section">
      <div className="section-title">
        <h2>
          <Wrench size={19} />
          Gerenciar atendimento
        </h2>
        <span className="management-label">Manutenção</span>
      </div>
      <form onSubmit={submit}>
        <div className="management-grid">
          <div className="field">
            <label htmlFor="manage-priority">Prioridade</label>
            <select
              id="manage-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              {priorities.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="manage-assignee">Responsável</label>
            <select
              id="manage-assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            >
              <option value="">Não atribuído</option>
              {technicians.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="manage-status">Status do atendimento</label>
            <select
              id="manage-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as Status);
                setError("");
              }}
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="observation">
            <MessageSquare size={15} />
            {status === "Concluído" && ticket.status !== "Concluído"
              ? "Serviço realizado"
              : "Adicionar observação"}
            <span className="optional">
              {status === "Concluído" && ticket.status !== "Concluído"
                ? "Obrigatório para concluir"
                : "Opcional"}
            </span>
          </label>
          <textarea
            id="observation"
            rows={3}
            maxLength={1500}
            placeholder={
              status === "Concluído"
                ? "Descreva o que foi realizado e o resultado do atendimento."
                : "Registre uma atualização para o solicitante..."
            }
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setError("");
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "observation-error" : undefined}
          />
          {error && (
            <span className="field-error" id="observation-error" role="alert">
              {error}
            </span>
          )}
        </div>
        <div className="management-actions">
          <span>As atualizações ficam visíveis para o colaborador.</span>
          <div>
            {ticket.status !== "Concluído" && status !== "Concluído" && (
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setStatus("Concluído");
                  setError("");
                  document.getElementById("observation")?.focus();
                }}
              >
                <CheckCircle2 size={16} />
                Concluir atendimento
              </button>
            )}
            <button
              type="submit"
              className="button primary"
              disabled={!changed}
            >
              <Save size={16} />
              {status === "Concluído" && ticket.status !== "Concluído"
                ? "Salvar e concluir"
                : "Salvar alterações"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
