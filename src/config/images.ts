import type { Photo } from "../types";
import { config } from "../config";
import bebedouroImage from "../imagens/bebedouro.jpeg";
import fechaduraImage from "../imagens/fechaduradanificada.jpeg";
import infiltracaoImage from "../imagens/infiltracaoparede.jpeg";
import mesaImage from "../imagens/mesainstavel.jpeg";
import portaImage from "../imagens/portasaladearquivos.jpeg";
import persianaImage from "../imagens/persiana.jpeg";
import ventiladorImage from "../imagens/ventiladorcomruido.jpeg";

/**
 * TODAS AS FOTOS DA DEMONSTRAÇÃO
 * Troque somente `url` para substituir uma foto em todas as telas.
 * Aceita uma URL HTTPS ou um caminho dentro de public, como /images/minha-foto.jpg.
 * As fotos dos chamados já salvos também são atualizadas, sem restaurar os dados.
 * Fotos enviadas pelo formulário continuam pertencendo ao respectivo chamado.
 */
export const images = {
  people: {
    [config.collaborator]: {
      url: "/images/people/mariana-pereira.jpg",
      source:
        "https://media.licdn.com/dms/image/v2/D4D03AQEG89cw57K4ug/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1677373737329?e=1796256000&v=beta&t=RmMbX1GOxVXnUOscbXAgI7e4TOvh_iMSSVVTbwRPtuY",
    },
    [config.maintenance]: {
      url: "https://avatars.githubusercontent.com/u/223373181?v=4",
      source: "https://avatars.githubusercontent.com/u/223373181?v=4",
    },
    [config.management]: {
      url: "/images/people/andre-gustavo.jpg",
      source:
        "https://media.licdn.com/dms/image/v2/D5603AQFj2-Xi-1jMIQ/profile-displayphoto-crop_800_800/B56ZoxF882I0AI-/0/1761760235870?e=1796256000&v=beta&t=d5u9sj-2iP54-r578kV1vcey4n4mD5NnzHVOGApisFY",
    },
    "Ana Carol Santos": {
      url: "/images/people/ana.jpg",
      source:
        "https://www.pexels.com/photo/portrait-of-beautiful-woman-smiling-12626141/",
    },
    "Pedro Henrique Lima": {
      url: "/images/people/pedro.jpg",
      source: "https://www.pexels.com/photo/headshot-of-a-man-smiling-7625292/",
    },
  },
  requests: {
    ac: {
      url: "/images/16592625.jpg",
      alt: "Aparelho de ar-condicionado instalado em parede",
      source:
        "https://www.pexels.com/photo/air-conditioner-in-a-house-16592625/",
      legacyId: "16592625",
    },
    acOutdoor: {
      url: "/images/16848596.jpg",
      alt: "Unidade externa de ar-condicionado fixada na parede",
      source:
        "https://www.pexels.com/photo/air-conditioner-unit-on-a-wall-16848596/",
      legacyId: "16848596",
    },
    sink: {
      url: "/images/6920608.jpg",
      alt: "Pia e torneira de banheiro",
      source: "https://www.pexels.com/photo/photo-of-a-bathroom-sink-6920608/",
      legacyId: "6920608",
    },
    light: {
      url: "/images/1928739.jpg",
      alt: "Instalação de iluminação no teto de um edifício",
      source: "https://www.pexels.com/photo/photo-of-ceiling-lights-1928739/",
      legacyId: "1928739",
    },
    chair: {
      url: "/images/6446321.jpg",
      alt: "Cadeira de escritório em ambiente administrativo",
      source:
        "https://www.pexels.com/photo/photo-of-a-black-office-chair-in-an-office-6446321/",
      legacyId: "6446321",
    },
    socket: {
      url: "/images/5691642.jpg",
      alt: "Tomada aberta com fiação aparente durante manutenção",
      source:
        "https://www.pexels.com/photo/power-socket-during-construction-on-building-5691642/",
      legacyId: "5691642",
    },
    waterFountain: {
      url: bebedouroImage,
      alt: "Bebedouro da recepção",
    },
    wallLeak: {
      url: infiltracaoImage,
      alt: "Infiltração na parede próxima à janela",
    },
    blinds: {
      url: persianaImage,
      alt: "Persiana da sala de treinamento",
    },
    unstableDesk: {
      url: mesaImage,
      alt: "Mesa de trabalho com estrutura instável",
    },
    damagedLock: {
      url: fechaduraImage,
      alt: "Fechadura da sala de suprimentos danificada",
    },
    archiveDoor: {
      url: portaImage,
      alt: "Porta da sala de arquivos",
    },
    noisyFan: {
      url: ventiladorImage,
      alt: "Ventilador com ruído excessivo",
    },
  },
};

export type RequestImageKey = keyof typeof images.requests;

export function requestPhoto(key: RequestImageKey): Photo {
  const entry = images.requests[key];
  const { url, alt } = entry;
  const source = "source" in entry ? entry.source : undefined;
  return { url, alt, source, imageKey: key };
}

export function resolvePhoto(photo: Photo): Photo {
  const key = Object.keys(images.requests).find((candidate) => {
    const entry = images.requests[candidate as RequestImageKey];
    const legacyId = "legacyId" in entry ? entry.legacyId : undefined;
    return (
      photo.imageKey === candidate ||
      (!photo.imageKey &&
        Boolean(
          legacyId &&
            (photo.localUrl?.includes(legacyId) ||
              photo.url.includes(`/photos/${legacyId}/`)),
        ))
    );
  });
  return key ? requestPhoto(key as RequestImageKey) : photo;
}
