const {
  loginValidation,
  forgottenPassValidation,
} = require("../middleware/validation");
const { loginUser, forgottenPass } = require("../models/authModel");

/**
 * Controlador para el inicio de sesión de usuarios.
 * 
 * Valida las credenciales recibidas y ejecuta la lógica de autenticación.
 * Devuelve un token de acceso y los datos del usuario en caso de éxito.
 * 
 * @function loginUserControl
 * @param {express.Request} req - Petición HTTP (body: { email, contraseña }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía respuesta JSON con token y datos (200) o error de autenticación.
 * @throws {Object} Lanza un error personalizado (400) si la validación de entrada falla.
 */
exports.loginUserControl = (req, res, next) => {
  // 1. Extracción de credenciales del cuerpo de la petición
  const { email, contraseña} = req.body;
  const params = {email, contraseña};

  // 2. Validación de esquema de entrada
  const { error } = loginValidation(params);

  // Si los datos no cumplen el esquema, se interrumpe la ejecución con un error 400
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  // 3. Ejecución de la lógica de autenticación
  loginUser(params)
    .then((result) => {
      // Desestructuración de la respuesta exitosa: se extrae token y datos del usuario
      const { statusCode = 200, message, data, token } = result;
      res.status(statusCode).send({ message, data, token });
    })
    .catch((err) => {
      // Manejo de errores asíncronos: credenciales incorrectas o fallos de servidor
      const { statusCode, message, data , code} = err;
      // Se envía la respuesta de error al cliente y se pasa el error al siguiente middleware
      res.status(statusCode).send({ message, data , code}) && next(err);
    });
};

/**
 * Controlador para la recuperación de contraseña olvidada.
 * 
 * Gestiona la solicitud de restablecimiento validando el correo electrónico
 * e iniciando el proceso de generación de una nueva contraseña temporal.
 * 
 * @function forgottenPassControl
 * @param {express.Request} req - Petición HTTP (body: { email }).
 * @param {express.Response} res - Respuesta HTTP.
 * @param {express.NextFunction} next - Middleware de pase de errores.
 * 
 * @returns {void} Envía confirmación de inicio del proceso (200) o error de validación.
 * @throws {Object} Lanza un error personalizado (400) si el email no es válido.
 */
exports.forgottenPassControl = (req, res, next) => {
  // 1. Extracción única del email (no se requiere contraseña actual)
  const {email}  = req.body;
  const params = {email};

  // 2. Validación específica para recuperación de contraseña
  const {error} = forgottenPassValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  // 3. Ejecución del servicio: genera contraseña temporal, la hashea y actualiza la BD
  // El manejo de promesas y errores sigue el mismo patrón que loginUserControl
  forgottenPass(params)
    .then((result) => {
      const { statusCode = 200, message, data} = result;
      res.status(statusCode).send({ message, data});
    })
    .catch((err) => {
      const { statusCode, message, data , code} = err;
      res.status(statusCode).send({ message, data, code}) && next(err);
    });
};