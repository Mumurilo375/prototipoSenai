import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ImageOff, X } from "lucide-react";
import { initials, slug } from "../utils/format";
import { images, resolvePhoto } from "../config/images";
import { currentPersonName } from "../config";
import type { Photo, Priority, Status } from "../types";
import { useStore } from "../store";

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status status-${slug(status)}`}>
      <span />
      {status}
    </span>
  );
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`priority priority-${slug(priority)}`}>
      <i>
        <b />
        <b />
        <b />
      </i>
      {priority}
    </span>
  );
}
export function Picture({
  photo,
  className = "",
}: {
  photo: Photo;
  className?: string;
}) {
  const resolved = resolvePhoto(photo);
  return (
    <PhotoImage key={resolved.url} photo={resolved} className={className} />
  );
}

function PhotoImage({ photo, className }: { photo: Photo; className: string }) {
  const [failed, setFailed] = useState(false);
  const [useRemote, setUseRemote] = useState(false);
  return failed ? (
    <div
      className={`image-fallback ${className}`}
      role="img"
      aria-label={`${photo.alt} — foto indisponível`}
    >
      <ImageOff size={20} />
      <span>Foto indisponível</span>
    </div>
  ) : (
    <img
      className={className}
      src={!useRemote && photo.localUrl ? photo.localUrl : photo.url}
      alt={photo.alt}
      loading="lazy"
      onError={() => {
        if (photo.localUrl && !useRemote) setUseRemote(true);
        else setFailed(true);
      }}
    />
  );
}

export function Avatar({
  name,
  className = "avatar",
}: {
  name: string;
  className?: string;
}) {
  const person =
    images.people[currentPersonName(name) as keyof typeof images.people];
  return (
    <PersonAvatar
      key={`${name}-${person?.url}`}
      name={name}
      url={person?.url}
      className={className}
    />
  );
}

function PersonAvatar({
  name,
  url,
  className,
}: {
  name: string;
  url?: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  return url && !failed ? (
    <img
      className={`${className} person-photo`}
      src={url}
      alt={`Foto ilustrativa de ${name}`}
      onError={() => setFailed(true)}
    />
  ) : (
    <span className={className} role="img" aria-label={name}>
      {initials(name)}
    </span>
  );
}
export function Modal({
  title,
  children,
  onClose,
  className = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-head">
        <h2 id="modal-title">{title}</h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Toast() {
  const { notification, dismiss } = useStore();
  useEffect(() => {
    if (notification) {
      const timeout = window.setTimeout(dismiss, 6500);
      return () => clearTimeout(timeout);
    }
  }, [notification, dismiss]);
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {notification && (
        <div className="toast">
          <span className="toast-check">
            <Check size={17} />
          </span>
          <span>{notification}</span>
          <button
            className="icon-button"
            onClick={dismiss}
            aria-label="Fechar notificação"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
