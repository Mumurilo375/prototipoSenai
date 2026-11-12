// Protocolos e eventos são identificadores locais, sem finalidade de autenticação.
// O fallback permite apresentar o protótipo pela rede local, em um endereço HTTP.
export function newId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}
