function generatePassword(longitud, incluirEspeciales){
    const minusculas = 'abcdefghijklmnopqrstuvwxyz';
    const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numeros = '0123456789';
    const caracteresEspeciales = `^$*.[]{}()?"!@#%&/\\,><':;|_~`;

    let caracteres = minusculas + mayusculas + numeros;
    if(incluirEspeciales){ caracteres += caracteresEspeciales;}

    let password = '';

    password += minusculas[Math.floor(Math.random()* minusculas.length)];   //Añade una minuscula random
    password += mayusculas[Math.floor(Math.random()* mayusculas.length)];   //Añade una mayuscula random
    password += numeros[Math.floor(Math.random()* numeros.length)];         //Añande un numero random

    if(incluirEspeciales){
        password += caracteresEspeciales[Math.floor(Math.random()* caracteresEspeciales.length)]    //Añade un caracter especial random
    }

    for (let i = password.length; i < longitud; i++){
        password += caracteres[Math.floor(Math.random() * caracteres.length)];  //Añade caracteres hasta llegar a la longitud especificada
    }

    return password.split('').sort(() => Math.random() - 0.5).join(''); //Mezcla los caracteres de la contraseña
}

module.exports = {
    generatePassword,
};