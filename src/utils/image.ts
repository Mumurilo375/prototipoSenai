export async function compressImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Selecione uma imagem JPG, PNG ou WebP.");
  if (file.size > 10 * 1024 * 1024)
    throw new Error(
      "A imagem deve ter no máximo 10 MB. Escolha uma foto menor.",
    );
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (
      !image.naturalWidth ||
      image.naturalWidth * image.naturalHeight > 50000000
    )
      throw new Error(
        "A resolução da imagem é muito grande. Escolha uma foto menor.",
      );
    const ratio = Math.min(
      1,
      1200 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * ratio);
    canvas.height = Math.round(image.naturalHeight * ratio);
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Não foi possível preparar a foto. Tente outra imagem.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL("image/jpeg", 0.72);
    if (result.length > 650000)
      throw new Error(
        "Não foi possível reduzir essa foto. Escolha uma imagem menor.",
      );
    return result;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("A resolução"))
      throw error;
    throw new Error(
      "Não foi possível preparar a foto. Use uma imagem JPG, PNG ou WebP menor.",
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
