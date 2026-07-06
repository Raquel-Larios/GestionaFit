/**
 * Función: Generación de contraseñas aleatorias con garantía de complejidad.
 * 
 * Crea una contraseña de longitud especificada asegurando la inclusión de al menos
 * un carácter de cada tipo requerido (minúscula, mayúscula, número y opcionalmente especial).
 * Primero inserta caracteres garantizados de cada tipo y luego rellena hasta la longitud
 * deseada con caracteres aleatorios del pool completo. Finalmente, mezcla los caracteres
 * para evitar patrones predecibles.
 * 
 * @function generatePassword
 * @param {number} longitud - Longitud deseada de la contraseña (mínimo recomendado: 12).
 * @param {boolean} incluirEspeciales - Si true, incluye caracteres especiales y garantiza al menos uno.
 * 
 * @returns {string} Contraseña aleatoria mezclada.
 * 
 * @example
 * generatePassword(10, false); // "aB3xK9mL2p"
 * generatePassword(12, true);  // "kR9$mX2@pL7#"
 */
function generatePassword(longitud, incluirEspeciales){
    // 1. Definición de pools de caracteres
    const minusculas = 'abcdefghijklmnopqrstuvwxyz';
    const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numeros = '0123456789';
    const caracteresEspeciales = `^$*.[]{}()?"!@#%&/\\,><':;|_~`;

    // 2. Construcción del pool base (siempre incluye alfanuméricos)
    let caracteres = minusculas + mayusculas + numeros;
    if(incluirEspeciales){ caracteres += caracteresEspeciales;}

    let password = '';

    // 3. Inserción garantizada de caracteres (evita contraseñas sin números o mayúsculas)
  // Esto asegura complejidad mínima independientemente de la aleatoriedad del relleno
    password += minusculas[Math.floor(Math.random()* minusculas.length)];   //Añade una minuscula random
    password += mayusculas[Math.floor(Math.random()* mayusculas.length)];   //Añade una mayuscula random
    password += numeros[Math.floor(Math.random()* numeros.length)];         //Añande un numero random

    if(incluirEspeciales){
        password += caracteresEspeciales[Math.floor(Math.random()* caracteresEspeciales.length)]    //Añade un caracter especial random
    }

    // 4. Relleno hasta alcanzar la longitud deseada
    // Se selecciona aleatoriamente del pool completo construido en el paso 2
    for (let i = password.length; i < longitud; i++){
        password += caracteres[Math.floor(Math.random() * caracteres.length)];  
    }

    // 5. Mezcla de caracteres (Shuffle)
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

module.exports = {
    generatePassword,
};