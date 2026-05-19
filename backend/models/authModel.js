const db = require("../database/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {DEFAULT_ERROR} = require("../constants");
const passwordGenerator = require("../middleware/passwordGenerator");
const mailService = require("../middleware/mailService/mailService");

exports.loginUser = (params) => {

  const { email, contraseña } = params;
  const  emailMinusculas = String(email).toLowerCase();

  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, nombre, apellidos, email, contraseña, isPassGenerated, foto_perfil, rol FROM usuario WHERE email = ?",
      [emailMinusculas], (err, result) => {
        if (err) {
          return reject({
            data: err,
            code: DEFAULT_ERROR,
            message: "Error al comprobar si el usuario existe.",
            statusCode: 400,
          });
        }

        if (result.length === 0) {
          return reject({
            message: "No existe ningún usuario con ese correo electrónico.",
            statusCode: 400,
          });
        }

        else{
          const usuario = result[0];
          const hashGuardado = usuario.contraseña;
          const match = bcrypt.compare(contraseña, hashGuardado);

          if(!match){
            return reject({
              message: "Por favor compruebe que su correo y contraseña estén correctamente introducidos.",
              statusCode: 400,
            });
          }
          
          else{
            const usuario = result[0]
            const payload = {id: usuario.id, username: usuario.nombre+" "+usuario.apellidos, flagPass: usuario.isPassGenerated, foto_perfil: usuario.foto_perfil, rol: usuario.rol}
            const secretKey = process.env.JWT_SECRET;
            const options = {algorithm: 'HS256', expiresIn: '1h'}
            const token = jwt.sign(payload, secretKey, options);

            resolve({
              message: "Loggeado correctamente.",
              data: result[0], 
              token,
            });
          }
        }
      }
    );
  });
};

exports.forgottenPass = (params) => {

  const { email } = params;
  const { emailMinusculas } = String(email).toLowerCase;

  return new Promise ((resolve, reject) => {
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
        const generatedPassword = passwordGenerator.generatePassword(10, false);
        const hashedPass = bcrypt.hash(generatedPassword, 10);

        db.query(`
          UPDATE usuario SET contraseña = ?, isPassGenerated = TRUE WHERE id = ?`, [hashedPass, cliente.id], (err, result) => {
            if(err) 
              return reject({
              code: DEFAULT_ERROR,
              message: "Error al guardar la nueva contraseña.",
              statusCode: 500,
            });

            resolve({
              data: result[0],
              message: "Enviando correo con nueva contraseña.",
              statusCode: 200,
            })

            mailService.enviarCorreoCliente(emailMinusculas, cliente.nombre, hashedPass, "Contraseña Olvidada");

          });

        
      }
    );
  });
}