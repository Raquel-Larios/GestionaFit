const { googleapi } = require('googleapis');
const {MAIL_USER, KEY_FILE_PATH, SCOPES} = process.env

const auth = new GoogleAuth({
  keyFile: KEY_FILE_PATH,
  scopes: SCOPES,
});

const TIPOS_CORREO = {
  Bienvenida: {
    subject: 'Bienvenid@ a GestionaFit',
    generarHtml: (clientNameStyled, generatedPassword) => `
      <h2 style="color: #0768A9; font-weight: bold;">Bienvenid@ a GestionaFit, ${clientNameStyled}</h2>
      <p style="color: #0768A9;">Se te ha dado de alta correctamente en nuestra aplicación.</p>
      <div style="background-color: #0768A9; display:flex; align-items: center; justify-items: center;">
        <p style="color: #FFFAFA; font-size: 16px; text-align: left;">Esta es tu contraseña temporal:</p>
        <div style="background-color: #FFFAFA;">
          <p style="font-size: 18px; font-weight: bold; color: #1E1E1E">${generatedPassword}</p>
        </div>
        <p style="color: #FFFAFA; font-size: 16px; text-align: left;">Por favor, inicia sesión y cambia tu contraseña lo antes posible.</p>
      </div>
    `,
  },
  ConOlvidada: {
    subject: 'Contraseña Olvidada',
    generarHtml: (clientNameStyled, generatedPassword) => `
      <h2 style="color: #0768A9; font-weight: bold;">Hola, ${clientNameStyled}</h2>
      <p style="color: #0768A9;">Estás recibiendo este mensaje porque has olvidado tu contraseña y has solicitado una nueva.</p>
      <div style="background-color: #0768A9; display:flex; align-items: center; justify-items: center;">
        <p style="color: #FFFAFA; font-size: 16px; text-align: left;">Esta es tu contraseña temporal:</p>
        <div style="background-color: #FFFAFA;">
          <p style="font-size: 18px; font-weight: bold; color: #1E1E1E">${generatedPassword}</p>
        </div>
        <p style="color: #FFFAFA; font-size: 16px; text-align: left;">Por favor, inicia sesión y cambia tu contraseña lo antes posible.</p>
      </div>
    `,
  },
};

function capitalizarPrimeraLetra(texto) {
  return texto.toLowerCase().charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

async function enviarCorreoCliente(clientEmail, clientName, generatedPassword, options) {
    try{
        const tipo = TIPOS_CORREO[options];
        if (!tipo) throw new Error('Tipo de correo no soportado.');
        const clientNameStyled = capitalizarPrimeraLetra(clientName);

        const authClient = await auth.getClient();
        const gmail = googleapi.gmail({ version: 'v1', auth: authClient });

        function encodeMessage(message) {
            return Buffer.from(message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
        }

        const message = [
            `To: ${clientEmail}`,
            `From: ${MAIL_USER}`,
            `Subject: ${tipo.subject}`,
            'Content-Type: text/html; charset=utf-8',
            '',
            tipo.generarHtml(clientNameStyled, generatedPassword),
        ].join('\n');

        const encodedMessage = encodeMessage(message);

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });

        console.log('Correo enviado:', res.data.id);
        return res.data;

    }catch(error){
        console.error('Error al enviar el correo:', error);
        throw error;
    }
}



module.exports = {
    enviarCorreoCliente,
};