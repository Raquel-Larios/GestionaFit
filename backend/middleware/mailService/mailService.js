require('dotenv').config();
const nodemailer = require('nodemailer');
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const path = require('path');

/**
 * Configuración del transporte de correo electrónico (Nodemailer).
 * 
 * Se utiliza el servidor SMTP institucional (UPM) con puerto 587 (TLS explícito).
 * La opción 'secure: false' es correcta para el puerto 587, ya que el cifrado
 * se inicia mediante STARTTLS (tls.rejectUnauthorized: true).
 * Las credenciales se cargan desde variables de entorno para evitar hardcoding.
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.upm.es', 
  port: 587,
  secure: false, // False para puerto 587 (STARTTLS), True solo para 465 (SSL implícito)
  tls: {
    rejectUnauthorized: true // Validación estricta del certificado del servidor SMTP
  },
  auth: {
    user: MAIL_USER, // Variable de entorno: usuario SMTP
    pass: MAIL_PASS, // Variable de entorno: contraseña o app-password
  }
});

/**
 * Diccionario de plantillas de correo (Patrón Factory).
 * 
 * Centraliza la definición de asuntos y cuerpos HTML para cada evento del sistema.
 * Cada tipo define una función 'generarCorreo' que retorna el payload HTML y los adjuntos.
 * Se utiliza HTML tabular para asegurar compatibilidad con clientes de correo antiguos (Outlook, Gmail).
 */
const TIPOS_CORREO = {
  Bienvenida: {
    subject: 'Bienvenid@ a GestionaFit',
    /**
     * Genera el cuerpo del correo de bienvenida.
     * @param {string} clientNameStyled - Nombre del cliente formateado.
     * @param {string} generatedPassword - Contraseña temporal generada.
     * @returns {Object} Objeto con HTML y adjuntos (logo incrustado via CID).
     */
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
            // Ruta relativa robusta para encontrar el asset en la estructura de carpetas
            path: path.join(__dirname, '..' ,'../../frontend/src/assets/img/logo-gestionaFit.png'),
            // Content-ID: clave para incrustar la imagen en el HTML
            cid: 'logoGestionaFit'
          }
        ]
      };
    }
  },
  ConOlvidada: {
    subject: 'Aquí está tu nueva contraseña.',
    /**
     * Genera el cuerpo del correo de recuperación de contraseña.
     * Estructura idéntica a 'Bienvenida' pero con mensaje contextual diferente.
     */
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

/**
 * Utilidad para normalizar nombres propios (Primera letra mayúscula, resto minúscula).
 * Mejora la presentación del correo frente a datos crudos de la BD.
 */
function capitalizarPrimeraLetra(texto) {
  return texto.toLowerCase().charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Servicio principal de envío de correos.
 * 
 * Orquesta la selección de la plantilla, la generación del contenido dinámico
 * y el envío asíncrono mediante el transporter configurado.
 * 
 * @async
 * @param {string} clientEmail - Destinatario.
 * @param {string} clientName - Nombre crudo para formatear.
 * @param {string} generatedPassword - Contraseña temporal a incluir.
 * @param {string} options - Clave del diccionario TIPOS_CORREO.
 * @returns {Promise<Object>} Información de envío de Nodemailer.
 * @throws {Error} Si el tipo de correo no existe o falla el envío SMTP.
 */
async function enviarCorreoCliente(clientEmail, clientName, generatedPassword, options) {
    try{
        // 1. Selección de plantilla mediante patrón de diccionario
        const tipo = TIPOS_CORREO[options];
        if (!tipo) throw new Error(`Tipo de correo no soportado: ${options}`);
        const clientNameStyled = capitalizarPrimeraLetra(clientName);
        const correo = tipo.generarCorreo(clientNameStyled, generatedPassword);

        // 2. Construcción del mensaje final (mezcla de metadatos y contenido generado)
        const message = {
            to: clientEmail,
            from: MAIL_USER, // Debe coincidir con el usuario autenticado en SMTP
            subject: tipo.subject,
            ...correo // Desestructuración de html y attachments
        }

        // 3. Envío asíncrono
        const result = await transporter.sendMail(message);
        return result;

    }catch(error){
      // 4. Manejo robusto de errores: logging detallado para depuración en servidor
      console.error('Error al enviar el correo:', error);
        if (error.response) {
          // Información específica del rechazo del servidor SMTP
          console.error('Respuesta del error:', error.response.body);
        }   
        // Se re-lanza el error para que el controlador superior pueda manejar la respuesta HTTP al cliente
        throw error;
    }
}

module.exports = {
    enviarCorreoCliente,
};