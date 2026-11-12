import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  ImagePlus,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Send,
  X,
} from "lucide-react";
import { Avatar, PageHeading, Picture } from "../components/ui";
import { categories, type Category, type Photo } from "../types";
import { useStore } from "../store";
import { config } from "../config";
import { compressImage } from "../utils/image";

export function NewRequest() {
  const { create } = useStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    title: "",
    category: "",
    location: "",
    department: "",
    description: "",
  });
  const change = (field: keyof typeof values, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };
  async function selectPhoto(file?: File) {
    if (!file) return;
    setPhotoError("");
    setProcessing(true);
    try {
      const url = await compressImage(file);
      setPhoto({ url, alt: "Fotografia anexada pelo solicitante" });
    } catch (error) {
      setPhotoError(
        error instanceof Error
          ? error.message
          : "Não foi possível ler a imagem.",
      );
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (processing || submitting) return;
    const next: Record<string, string> = {};
    if (values.title.trim().length < 5)
      next.title = "Informe um título com pelo menos 5 caracteres.";
    if (!categories.includes(values.category as Category))
      next.category = "Selecione a categoria do problema.";
    if (values.location.trim().length < 3)
      next.location = "Informe onde o problema foi encontrado.";
    if (!values.department.trim()) next.department = "Informe o departamento.";
    if (values.description.trim().length < 15)
      next.description = "Descreva o problema com pelo menos 15 caracteres.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    setSubmitting(true);
    const ticket = create({
      title: values.title.trim(),
      category: values.category as Category,
      location: values.location.trim(),
      department: values.department.trim(),
      description: values.description.trim(),
      photos: photo ? [photo] : [],
    });
    navigate(`/colaborador/solicitacoes/${ticket.id}`);
  }
  const fieldError = (name: string) =>
    errors[name] ? (
      <span className="field-error" id={`${name}-error`}>
        {errors[name]}
      </span>
    ) : null;
  return (
    <>
      <Link className="back-link" to="/colaborador">
        <ArrowLeft size={16} />
        Voltar para minhas solicitações
      </Link>
      <PageHeading
        title="Nova solicitação"
        description="Descreva o problema encontrado para que a equipe de manutenção possa avaliar o atendimento."
      />
      <div className="new-layout">
        <form className="request-form surface" onSubmit={submit} noValidate>
          <div className="form-section-heading">
            <span className="section-icon">
              <ClipboardList size={21} />
            </span>
            <div>
              <h2>Informações da solicitação</h2>
              <p>
                Campos com <span className="required">*</span> são obrigatórios.
              </p>
            </div>
          </div>
          <div className="form-content">
            <div className="field">
              <label htmlFor="title">
                Título da solicitação <span className="required">*</span>
              </label>
              <input
                id="title"
                maxLength={120}
                placeholder="Ex.: Ar-condicionado sem refrigeração"
                value={values.title}
                onChange={(e) => change("title", e.target.value)}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "title-error" : undefined}
                required
              />
              {fieldError("title")}
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="category">
                  Categoria <span className="required">*</span>
                </label>
                <select
                  id="category"
                  value={values.category}
                  onChange={(e) => change("category", e.target.value)}
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={
                    errors.category ? "category-error" : undefined
                  }
                  required
                >
                  <option value="">Selecione a categoria</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                {fieldError("category")}
              </div>
              <div className="field">
                <label htmlFor="department">
                  Departamento <span className="required">*</span>
                </label>
                <input
                  id="department"
                  list="departments"
                  maxLength={80}
                  placeholder="Ex.: Administrativo"
                  value={values.department}
                  onChange={(e) => change("department", e.target.value)}
                  aria-invalid={Boolean(errors.department)}
                  aria-describedby={
                    errors.department ? "department-error" : undefined
                  }
                  required
                />
                <datalist id="departments">
                  {[
                    "Administrativo",
                    "Financeiro",
                    "Recursos Humanos",
                    "Compras",
                    "Operações",
                    "Tecnologia da Informação",
                  ].map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
                {fieldError("department")}
              </div>
            </div>
            <div className="field">
              <label htmlFor="location">
                Localização <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <MapPin size={17} />
                <input
                  id="location"
                  maxLength={120}
                  placeholder="Ex.: Sala de Reuniões 02, bloco administrativo"
                  value={values.location}
                  onChange={(e) => change("location", e.target.value)}
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={
                    errors.location ? "location-error" : undefined
                  }
                  required
                />
              </div>
              {fieldError("location")}
            </div>
            <div className="field">
              <label htmlFor="description">
                Descrição do problema <span className="required">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                maxLength={3000}
                placeholder="Conte o que aconteceu, quando o problema foi percebido e como ele afeta o uso do local ou equipamento."
                value={values.description}
                onChange={(e) => change("description", e.target.value)}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? "description-error" : "description-hint"
                }
                required
              />
              <div className="field-bottom">
                <span id="description-hint">
                  Quanto mais detalhes, melhor a avaliação da equipe.
                </span>
                <span>{values.description.length}/3.000</span>
              </div>
              {fieldError("description")}
            </div>
            <div className="field">
              <label htmlFor="photo">
                Adicionar foto <span className="optional">Opcional</span>
              </label>
              <input
                className="sr-only"
                id="photo"
                type="file"
                ref={inputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => void selectPhoto(e.target.files?.[0])}
              />
              {photo ? (
                <div className="photo-preview">
                  <Picture photo={photo} />
                  <div>
                    <strong>Foto anexada</strong>
                    <span>A imagem foi otimizada para a demonstração.</span>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setPhoto(null)}
                    >
                      <X size={14} />
                      Remover foto
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="upload-area"
                  disabled={processing}
                  onClick={() => inputRef.current?.click()}
                >
                  {processing ? (
                    <LoaderCircle className="spin" size={24} />
                  ) : (
                    <ImagePlus size={25} />
                  )}
                  <span>
                    <strong>
                      {processing
                        ? "Preparando sua foto..."
                        : "Clique para selecionar uma foto"}
                    </strong>
                    <small>JPG, PNG ou WebP · até 10 MB</small>
                  </span>
                  <span className="button secondary upload-button">
                    Selecionar arquivo
                  </span>
                </button>
              )}
              {photoError && (
                <span className="field-error" role="alert">
                  {photoError}
                </span>
              )}
            </div>
          </div>
          <div className="form-actions">
            <span>
              <LockKeyhole size={14} />
              Salvo apenas neste navegador
            </span>
            <div>
              <Link className="button secondary" to="/colaborador">
                Cancelar
              </Link>
              <button
                className="button primary"
                type="submit"
                disabled={processing || submitting}
              >
                <Send size={16} />
                {submitting ? "Enviando..." : "Enviar solicitação"}
              </button>
            </div>
          </div>
        </form>
        <aside className="form-aside">
          <div className="requester-note">
            <Avatar name={config.collaborator} />
            <div>
              <span>Registrando como</span>
              <strong>{config.collaborator}</strong>
              <small>Colaboradora · perfil fictício</small>
            </div>
          </div>
          <h3>Um bom registro faz a diferença.</h3>
          <p>
            Uma descrição clara ajuda a manutenção a entender o problema e
            organizar o atendimento.
          </p>
          <ul className="tips-list">
            <li>
              <Check size={16} />
              <span>Informe a sala ou o ambiente exato.</span>
            </li>
            <li>
              <Check size={16} />
              <span>Descreva o que não está funcionando.</span>
            </li>
            <li>
              <Check size={16} />
              <span>Se possível, adicione uma foto do problema.</span>
            </li>
          </ul>
          <div className="next-steps">
            <h3>E depois do envio?</h3>
            <div>
              <span>
                <CheckCircle2 size={16} />
              </span>
              <p>
                <strong>Você recebe um protocolo</strong>Seu pedido fica
                registrado na central.
              </p>
            </div>
            <div>
              <span>
                <ArrowRight size={16} />
              </span>
              <p>
                <strong>A equipe avalia o chamado</strong>A manutenção define a
                prioridade e o responsável.
              </p>
            </div>
            <div>
              <span>
                <ClipboardList size={16} />
              </span>
              <p>
                <strong>Você acompanha por aqui</strong>Consulte o status e
                todas as atualizações.
              </p>
            </div>
          </div>
          <p className="aside-footnote">
            Esta é uma simulação acadêmica. Não envie informações pessoais ou
            sensíveis.
          </p>
        </aside>
      </div>
    </>
  );
}
