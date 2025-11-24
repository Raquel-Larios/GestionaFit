const {
  loginValidation,
} = require("../middleware/validation");
const db = require("../database/db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const {DEFAULT_ERROR_MESSAGE, DEFAULT_ERROR} = require("../constants");

exports.loginUser = async (params) => {
  const { error } = loginValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { email, contraseña } = params;

  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM usuario WHERE email = ?",
      [email], async (err, result) => {
        if (err) {
          reject({
            data: err,
            code: DEFAULT_ERROR,
            message: DEFAULT_ERROR_MESSAGE,
            statusCode: 400,
          });
        }

        if (result.length === 0) {
          reject({
            message: "No existe ningún usuario con ese correo electrónico.",
            statusCode: 400,
          });
        }

        else{
          const usuario = result[0];
          const hashGuardado = usuario.contraseña;
          const match = await bcrypt.compare(contraseña, hashGuardado);

          if(!match){
            return reject({
              message: "Por favor compruebe que su correo y contraseña estén correctamente introducidos.",
              statusCode: 400,
            });
          }
          else{
            const payload = {id: result[0], username: result[2], rol: result[7]}
            const secretKey = crypto.randomBytes(32).toString('hex');
            const options = {algorithm: 'HS256', expiresIn: '1h'}
            const token = jwt.sign(payload, secretKey, options);

            resolve({
              message: "Loggeado correctamente.",
              data: result, 
              token,
            });
          }
        }
      }
    );
  });
};

