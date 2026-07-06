const db = require("../database/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {DEFAULT_ERROR} = require("../constants");
const passwordGenerator = require("../middleware/passwordGenerator");
const mailService = require("../middleware/mailService/mailService");

/**
 * Servicio de lógica de negocio para la autenticación de usuarios.
 * 
 * Verifica las credenciales comparando la contraseña con el hash almacenado
 * mediante bcrypt (seguro contra ataques de tiempo). Si son válidas,
 * genera un token JWT firmado con HS256 para la sesión del usuario.
 * Normaliza el email a minúsculas para garantizar consistencia en la consulta.
 * 
 * @function loginUser
 * @param {Object} params - Objeto con credenciales (email, contraseña).
 * @param {string} params.email - Correo electrónico del usuario.
 * @param {string} params.contraseña - Contraseña en texto plano.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con { message, data, token }.
 * @rejects {Object} Rechaza con error 400 si las credenciales son inválidas o el usuario no existe.
 * @rejects {Object} Rechaza con error 500 si falla la conexión a la base de datos.
 */
exports.loginUser = (params) => {
  const { email, contraseña } = params;
  // Normalización del email para asegurar consistencia en la consulta
  const  emailMinusculas = String(email).toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. Obtención de datos completos (incluyendo hash y rol)
    db.query(
      "SELECT id, nombre, apellidos, email, contraseña, isPassGenerated, foto_perfil, rol FROM usuario WHERE email = ?",
      [emailMinusculas], (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al comprobar si el usuario existe.",
            statusCode: 500,
          });
        }

        // Validación: El usuario debe existir
        if (result.length === 0) {
          return reject({
            message: "No existe ningún usuario con ese correo electrónico.",
            statusCode: 400,
          });
        }

        
        else{
          const usuario = result[0];
          // 2. Verificación criptográfica de contraseña (bcrypt)
          const hashGuardado = usuario.contraseña;
          // Compara el texto plano con el hash almacenado de forma segura contra ataques de tiempo
          const match = bcrypt.compare(contraseña, hashGuardado);

          if(!match){
            // Mensaje genérico por seguridad: no revela si el error es el email o la contraseña
            return reject({
              message: "Por favor compruebe que su correo y contraseña estén correctamente introducidos.",
              statusCode: 400,
            });
          }
          
          else{
            // 3. Generación de JWT (Algoritmo HS256, expiración 1h)
            // Se incluye información mínima necesaria para la sesión (id, nombre, rol, flag de contraseña, foto de perfil)
            const payload = {id: usuario.id, username: usuario.nombre+" "+usuario.apellidos, flagPass: usuario.isPassGenerated, foto_perfil: usuario.foto_perfil, rol: usuario.rol}
            // Clave secreta desde variables de entorno
            const secretKey = process.env.JWT_SECRET; 
            // Algoritmo y caducidad corta (1h)
            const options = {algorithm: 'HS256', expiresIn: '1h'}
            // Firma del token JWT
            const token = jwt.sign(payload, secretKey, options);

            // Resolución exitosa: se devuelve el token y los datos públicos del usuario
            resolve({
              message: "Loggeado correctamente.",
                data: {
                  id: usuario.id,
                  nombre: usuario.nombre,
                  apellidos: usuario.apellidos,
                  email: usuario.email,
                  rol: usuario.rol,
                  foto_perfil: usuario.foto_perfil
                },
                token: token
            });
          }
        }
      }
    );
  });
};

/**
 * Servicio de lógica de negocio para la recuperación de contraseña olvidada.
 * 
 * A diferencia del login, este método genera una nueva contraseña aleatoria,
 * la hashea con bcrypt y actualiza la base de datos. Finalmente, dispara
 * el envío del correo de notificación con la credencial temporal.
 * Normaliza el email a minúsculas para consistencia.
 * 
 * @function forgottenPass
 * @param {Object} params - Objeto con el email del usuario.
 * @param {string} params.email - Correo electrónico registrado.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con { message, data, statusCode } si la actualización es exitosa.
 * @rejects {Object} Rechaza con error 400 si el email no está registrado.
 * @rejects {Object} Rechaza con error 500 si falla la consulta a la BD o el hasheo.
 */
exports.forgottenPass = (params) => {
  const {email}  = params;
  // Mismo patrón de normalización que en loginUser
  const emailMinusculas = String(email).toLowerCase();

  return new Promise ((resolve, reject) => {
    // 1. Verificación de existencia (similar a loginUser, pero sin recuperar contraseña)
    db.query(
      `SELECT id, nombre FROM usuario WHERE email = ?`, [emailMinusculas],
      (err, result)=> {
        if(err) return reject({
          code: DEFAULT_ERROR,
          message: "Error al comprobar si el usuario existe.",
          statusCode: 500,
        });

        if(result.length === 0){
          return reject({
            message: "No existe ningún usuario registrado con ese correo.",
            statusCode: 400,
          });
        }

        const cliente = result[0];

        // 2. GENERACIÓN Y HASHEO (Diferencia clave: se crea la contraseña, no se compara)
        // Genera una cadena aleatoria de 10 caracteres (sin símbolos complejos si false)
        const generatedPassword = passwordGenerator.generatePassword(10, false);
        // Hasheo síncrono seguro (salt rounds = 10)
        const hashedPass = bcrypt.hashSync(generatedPassword, 10);

        // 3. Actualización en BD
        db.query(`
          UPDATE usuario SET contraseña = ?, isPassGenerated = TRUE WHERE id = ?`, [hashedPass, cliente.id], (err, result) => {
            if(err) 
              return reject({
              code: DEFAULT_ERROR,
              message: "Error al guardar la nueva contraseña.",
              statusCode: 500,
            });

            // Disparo del email de notificación (acción secundaria post-éxito)
            // Se ejecuta antes de resolver para asegurar que se intenta enviar
            mailService.enviarCorreoCliente(emailMinusculas, cliente.nombre, generatedPassword, "ConOlvidada");

            // Resolución exitosa: La BD está actualizada y el correo ha sido disparado
            resolve({
              data: result[0],
              message: "Contraseña restablecida. Se ha enviado un correo con las nuevas credenciales.",
              statusCode: 200,
            })

          });

        
      }
    );
  });
}