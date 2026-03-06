export function generateInitialUserPhoto(nombre: string): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.height = 47;

  if (!ctx) {
    throw new Error('No se pudo obtener el contexto 2D del canvas.');
  }

  ctx.fillStyle = '#3F95CF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = 'snow';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const yOffset = 2;
  ctx.fillText(nombre.charAt(0).toUpperCase(), canvas.width/2, canvas.height/2 + yOffset);

  return canvas.toDataURL('image/png');
}
