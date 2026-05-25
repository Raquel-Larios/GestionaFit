require('dotenv').config();
const nodemailer = require('nodemailer');
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const path = require('path');

const transporter = nodemailer.createTransport({
  host: 'smtp.upm.es', 
  port: 587,
  secure: false,
  tls: {
    rejectUnauthorized: true
  },
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  }
});

const TIPOS_CORREO = {
  Bienvenida: {
    subject: 'Bienvenid@ a GestionaFit',
    generarCorreo: (clientNameStyled, generatedPassword) => {
      return {
        html: `
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 20px; background-color: #0768A9; border: 1px solid #005994; font-family: Arial, sans-serif;">
                      <img src="cid:logoGestionaFit" alt="Logo" style="width: 100px; height: 100px; margin-bottom: 15px; border-radius: 25%; border: solid 2px #D9D9D9;" />
                      <h2 style="color: #FFFAFA; font-weight: bold; font-size: 26px;">Bienvenid@ a GestionaFit, ${clientNameStyled}</h2>
                      <p style="color: #FFFAFA; font-size: 22px;">Se te ha dado de alta correctamente en nuestra aplicación.</p>
                      <p style="color: #FFFAFA; font-size: 18px; margin: 5px 0;">Esta es tu contraseña temporal:</p>
                      <table align="center" width="50%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="background-color: #FFCC00; padding: 15px; border-radius: 8px;">
                            <div style="background-color: #FFFAFA; color: #1E1E1E; padding: 10px; border-radius: 4px; font-size: 18px; font-weight: bold; display: inline-block;">
                              ${generatedPassword}
                            </div>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #FFFAFA; font-size: 18px; margin: 5px 0;">Por favor, inicia sesión y cambia tu contraseña lo antes posible.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        `,
        attachments: [
          {
            filename: 'logo-gestionaFit.png',
            path: path.join(__dirname, '..' ,'../../frontend/src/assets/img/logo-gestionaFit.png'),
            cid: 'logoGestionaFit'
          }
        ]
      };
    }
  },
  ConOlvidada: {
    subject: 'Aquí está tu nueva contraseña.',
    generarCorreo: (clientNameStyled, generatedPassword) => {
      return {
        html:`
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
              <tr>
                <td style="padding: 20px; background-color: #0768A9; border: 1px solid #005994; font-family: Arial, sans-serif;">
                  <img src="cid:logoGestionaFit" alt="Logo" style="width: 100px; height: 100px; margin-bottom: 15px; border-radius: 25%; border: solid 2px #D9D9D9;" />
                  <h2 style="color: #FFFAFA; font-weight: bold; font-size: 26px;">Hola, ${clientNameStyled}</h2>
                  <p style="color: #FFFAFA; font-size: 22px;">Estás recibiendo este mensaje porque has olvidado tu contraseña y has solicitado una nueva.</p>
                  <p style="color: #FFFAFA; font-size: 18px; margin: 5px 0;">Esta es tu contraseña temporal:</p>
                  <table align="center" width="50%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="background-color: #FFCC00; padding: 15px; border-radius: 8px;">
                        <div style="background-color: #FFFAFA; color: #1E1E1E; padding: 10px; border-radius: 4px; font-size: 18px; font-weight: bold; display: inline-block;">
                          ${generatedPassword}
                        </div>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #FFFAFA; font-size: 18px; margin: 5px 0;">Por favor, inicia sesión y cambia tu contraseña lo antes posible.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
      attachments: [
          {
            filename: 'logo-gestionaFit.png',
            path: path.join(__dirname, '..' ,'../../frontend/src/assets/img/logo-gestionaFit.png'),
            cid: 'logoGestionaFit'
          }
        ]
      };
    }
  }
}

function capitalizarPrimeraLetra(texto) {
  return texto.toLowerCase().charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

async function enviarCorreoCliente(clientEmail, clientName, generatedPassword, options) {
    try{
        const tipo = TIPOS_CORREO[options];
        if (!tipo) throw new Error(`Tipo de correo no soportado: ${options}`);
        const clientNameStyled = capitalizarPrimeraLetra(clientName);
        const correo = tipo.generarCorreo(clientNameStyled, generatedPassword);

        const message = {
            to: clientEmail,
            from: MAIL_USER,
            subject: tipo.subject,
            ...correo
        }

        const result = await transporter.sendMail(message);
        return result;

    }catch(error){
        console.error('Error al enviar el correo:', error);
        if (error.response) {
            console.error('Respuesta del error:', error.response.body);
        }   
        throw error;
    }
}



module.exports = {
    enviarCorreoCliente,
};