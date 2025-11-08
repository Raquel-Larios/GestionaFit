function crearBoton( texto, ruta){
    const button = document.createElement("button");
    button.textContent = texto;
    button.onClick = () => {
        window.location.href = ruta;
    };
    return button;
}