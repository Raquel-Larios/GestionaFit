const nodemailer = require('nodemailer');
const {MAIL_USER, MAIL_PASS} = require('./mailConstants'); 

async function enviarCorreoCliente(clientEmail, clientName, generatedPassword, options) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASS,
        }
    });

    const mailOptionsBienvenida = {
        from: MAIL_USER,
        to: clientEmail,
        subject: 'Bienvenid@ a GestionaFit',
        html: `
        <h2 style="color: #0768A9; font-weight: bold;">Bienvenid@ a GestionaFit, ${clientName}</h2>
        <p style="color: #0768A9;">Se te ha dado de alta correctamente en nuestra aplicación.</p>
        <div style="background-color: #0768A9; display:flex; align-items: center; justify-items: center;">
            <p style="color: #FFFAFA; font-size: 16px; text-align: left;">Esta es tu contraseña temporal:</p>
            <div style="background-color: #FFFAFA;">
                <p style="font-size: 18px; font-weight: bold; color: #1E1E1E">${generatedPassword}</p>
            </div>
            <p style="color: #FFFAFA; font-size: 16px; text-align: left;>Por favor, inicia sesión y cambia tu contraseña lo antes posible.</p>
        </div>
        `
    }

    const mailOptionsConOlvidada = {
        from: MAIL_USER,
        to: clientEmail,
        subject: 'Contraseña Olvidada',
        html: `
        <h2 style="color: #0768A9; font-weight: bold;">Hola, ${clientName}</h2>
        <p style="color: #0768A9;">Estas recibiendo este mensaje porque has olvidado tu contraseña y has solicitado una nueva.</p>
        <div style="background-color: #0768A9; display:flex; align-items: center; justify-items: center;">
            <p style="color: #FFFAFA; font-size: 16px; text-align: left;">Esta es tu contraseña temporal:</p>
            <div style="background-color: #FFFAFA;">
                <p style="font-size: 18px; font-weight: bold; color: #1E1E1E">${generatedPassword}</p>
            </div>
            <p style="color: #FFFAFA; font-size: 16px; text-align: left;>Por favor, inicia sesión y cambia tu contraseña lo antes posible.</p>
        </div>
        `
    }

    if(options === "Bienvenida"){
        await transporter.sendMail(mailOptionsBienvenida);
    }
    else{
        await transporter.sendMail(mailOptionsConOlvidada);
    }
}

module.exports = {
    enviarCorreoCliente,
};