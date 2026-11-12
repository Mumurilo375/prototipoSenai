import { useEffect, useLayoutEffect, useState } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowUpRight,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardList,
  Menu,
  Plus,
  RotateCcw,
  Wrench,
  X,
} from "lucide-react";
import { config, roles } from "./config";
import { useStore } from "./store";
import { Avatar, Modal, Toast } from "./components/ui";
import { TicketList } from "./pages/TicketList";
import { NewRequest } from "./pages/NewRequest";
import { TicketDetail } from "./pages/TicketDetail";
import { Dashboard } from "./pages/Dashboard";
import type { Role } from "./types";

export default function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { reset, storageWarning } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.querySelector<HTMLButtonElement>(".mobile-close")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [mobileOpen]);
  const role: Role = pathname.startsWith("/manutencao")
    ? "manutencao"
    : pathname.startsWith("/gestao")
      ? "gestao"
      : "colaborador";
  const user = roles[role];
  const detailId = pathname.match(/\/solicitacoes\/([^/]+)$/)?.[1];
  const isNew = pathname.endsWith("/nova");
  const pageLabel = isNew
    ? "Nova solicitação"
    : detailId
      ? "Detalhes da solicitação"
      : user.section;
  function switchRole(next: Role) {
    navigate(`/${next}`);
    setMobileOpen(false);
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo
      </a>
      {mobileOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Fechar navegação"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`sidebar ${mobileOpen ? "is-open" : ""}`}
        aria-label="Navegação principal"
      >
        <a
          href="/colaborador"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("/colaborador");
            setMobileOpen(false);
          }}
        >
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span>
            {config.name}
            <small>{config.subtitle}</small>
          </span>
        </a>
        <button
          className="mobile-close icon-button"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
        <div className="workspace-name">
          <span className="company-avatar">SA</span>
          <div>{config.company}</div>
        </div>
        <div className="nav-caption">ÁREA DE TRABALHO</div>
        <nav>
          <button
            className={`nav-item ${role === "colaborador" ? "active" : ""}`}
            onClick={() => switchRole("colaborador")}
            aria-current={role === "colaborador" ? "page" : undefined}
          >
            <ClipboardList size={19} />
            <span>
              Colaborador<small>Minhas solicitações</small>
            </span>
            <ChevronRight size={15} />
          </button>
          <button
            className={`nav-item ${role === "manutencao" ? "active" : ""}`}
            onClick={() => switchRole("manutencao")}
            aria-current={role === "manutencao" ? "page" : undefined}
          >
            <Wrench size={19} />
            <span>
              Manutenção<small>Central de atendimento</small>
            </span>
            <ChevronRight size={15} />
          </button>
          <button
            className={`nav-item ${role === "gestao" ? "active" : ""}`}
            onClick={() => switchRole("gestao")}
            aria-current={role === "gestao" ? "page" : undefined}
          >
            <ChartNoAxesCombined size={19} />
            <span>
              Gestão<small>Indicadores e resultados</small>
            </span>
            <ChevronRight size={15} />
          </button>
        </nav>
        <div className="sidebar-divider" />
        <NavLink
          to="/colaborador/nova"
          className="sidebar-new"
          onClick={() => setMobileOpen(false)}
        >
          <Plus size={17} />
          Nova solicitação
          <ArrowUpRight size={15} />
        </NavLink>
        <div className="sidebar-bottom">
          <div className="demo-note">
            <span className="demo-dot" />
            Demonstração interativa
          </div>
          <button
            className="reset-button"
            onClick={() => {
              setResetOpen(true);
              setMobileOpen(false);
            }}
          >
            <RotateCcw size={16} />
            Restaurar demonstração
          </button>
          <div className="sidebar-credit">
            PROJETO ACADÊMICO <span>SENAI</span>
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={mobileOpen}>
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="icon-button menu-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={21} />
            </button>
            <span>{config.subtitle}</span>
            <ChevronRight size={14} />
            <strong>{pageLabel}</strong>
          </div>
          <div className="topbar-right">
            <div className="user-block">
              <Avatar name={user.name} />
              <div>
                {user.name}
                <small>{user.label}</small>
              </div>
            </div>
          </div>
        </header>
        {storageWarning && (
          <div className="storage-warning" role="status">
            <ArrowDownToLine size={17} />
            {storageWarning}
          </div>
        )}
        <main id="main-content" className="main-content" key={pathname}>
          <Routes>
            <Route path="/" element={<Navigate to="/colaborador" replace />} />
            <Route
              path="/colaborador"
              element={<TicketList role="colaborador" />}
            />
            <Route path="/colaborador/nova" element={<NewRequest />} />
            <Route
              path="/manutencao"
              element={<TicketList role="manutencao" />}
            />
            <Route path="/gestao" element={<Dashboard />} />
            <Route
              path="/:role/solicitacoes/:id"
              element={<TicketDetail role={role} />}
            />
            <Route
              path="*"
              element={
                <div className="not-found">
                  <h1>Página não encontrada</h1>
                  <p>
                    Volte à central para continuar acompanhando as solicitações.
                  </p>
                  <NavLink className="button primary" to="/colaborador">
                    Minhas solicitações
                  </NavLink>
                </div>
              }
            />
          </Routes>
        </main>
        <footer className="app-footer">
          <span>
            {config.name} <span className="footer-dot">·</span> {config.company}{" "}
            — demonstração
          </span>
          <span>Dados fictícios para apresentação acadêmica</span>
        </footer>
      </div>
      <Toast />
      {resetOpen && (
        <Modal
          title="Restaurar demonstração?"
          onClose={() => setResetOpen(false)}
        >
          <div className="modal-body">
            <div className="reset-symbol">
              <RotateCcw size={25} />
            </div>
            <p>
              Os chamados criados e as alterações feitas neste navegador serão
              removidos. Os 12 registros fictícios originais serão restaurados.
            </p>
            <p className="muted">Essa ação não pode ser desfeita.</p>
          </div>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setResetOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="button danger"
              onClick={() => {
                reset();
                setResetOpen(false);
                navigate("/colaborador");
              }}
            >
              Restaurar demonstração
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
