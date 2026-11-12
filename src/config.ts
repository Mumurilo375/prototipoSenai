export const config = {
  name: "Solicitações Internas",
  subtitle: "Central de Manutenção",
  company: "SA DR",
  collaborator: "Mariana Pereira",
  maintenance: "Murilo Pereira",
  management: "Andre Gustavo",
  storageKey: "solicitacoes-internas-v1",
};

// Mantém a associação dos registros salvos antes da personalização do perfil.
export const legacyCollaboratorName = "Mariana Costa";
export const legacyMaintenanceName = "Carlos Oliveira";
export const legacyManagementName = "Fernanda Ribeiro";

export function currentPersonName(value: string): string {
  return value
    .replaceAll(legacyCollaboratorName, config.collaborator)
    .replaceAll(legacyMaintenanceName, config.maintenance)
    .replaceAll(legacyManagementName, config.management);
}

export const roles = {
  colaborador: {
    label: "Colaborador",
    name: config.collaborator,
    initials: "MP",
    section: "Minhas solicitações",
  },
  manutencao: {
    label: "Manutenção",
    name: config.maintenance,
    initials: "MP",
    section: "Central de manutenção",
  },
  gestao: {
    label: "Gestão",
    name: config.management,
    initials: "AG",
    section: "Visão gerencial",
  },
};
