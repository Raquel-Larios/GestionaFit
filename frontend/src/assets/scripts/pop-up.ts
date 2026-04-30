export function mostrarMensajeTemporal(mensaje : string, duracion = 3000) {
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.backgroundColor = '#0c4488';
  popup.style.color = 'snow';
  popup.style.padding = '10px 20px';
  popup.style.borderRadius = '5px';
  popup.style.zIndex = '1000';
  popup.textContent = mensaje;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.style.transition = 'opacity 0.5s';
    popup.style.opacity = '0';
    setTimeout(() => document.body.removeChild(popup), 500);
  }, duracion);
}