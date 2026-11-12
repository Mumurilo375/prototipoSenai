import { config } from "./config";

export const statuses = [
  "Aberto",
  "Em triagem",
  "Em andamento",
  "Pendente",
  "Concluído",
] as const;
export const priorities = ["Baixa", "Média", "Alta", "Crítica"] as const;
export const categories = [
  "Climatização",
  "Elétrica",
  "Hidráulica",
  "Mobiliário",
  "Estrutura predial",
  "Equipamentos",
] as const;
export const technicians = [
  config.maintenance,
  "Ana Beatriz Santos",
  "Pedro Henrique Lima",
] as const;
export type Status = (typeof statuses)[number];
export type Priority = (typeof priorities)[number];
export type Category = (typeof categories)[number];
export type Role = "colaborador" | "manutencao" | "gestao";
export type Photo = {
  imageKey?: string;
  url: string;
  alt: string;
  source?: string;
  localUrl?: string;
};
export type HistoryEvent = {
  id: string;
  date: string;
  title: string;
  author: string;
  note?: string;
};
export interface Ticket {
  id: string;
  protocol: string;
  title: string;
  category: Category;
  location: string;
  department: string;
  description: string;
  requester: string;
  priority: Priority;
  status: Status;
  assignee: string;
  createdAt: string;
  completedAt?: string;
  photos: Photo[];
  history: HistoryEvent[];
}
export type NewTicket = Pick<
  Ticket,
  "title" | "category" | "location" | "department" | "description" | "photos"
>;
export type TicketUpdate = Pick<Ticket, "priority" | "status" | "assignee"> & {
  note: string;
};
