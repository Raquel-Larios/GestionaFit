const { updateUserValidation } = require("../middleware/validation");
const db = require("../database/db");
const md5 = require("md5");

// Llama al método de validación para saber si el objeto que le han pasado es del tipo que usa el método y si es correcto consulta a la db.
exports.updateUser = async (params) => {
  const { error } = updateUserValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { userId, email, nombre, apellidos, contraseña } = params;
  const hashedPassword = md5(contraseña.toString());

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM usuario WHERE id = ? AND contraseña = ?`,
      [userId, hashedPassword],
      (err, result) => {
        if (err) reject({ message: err, statusCode: 500 });

        if (result.length === 0) {
          reject({
            message: "Credenciales erróneas, por favor pruebe otra vez.",
            statusCode: 400,
          });
        } else {
          if (email === result[0].email && nombre === result[0].nombre && apellidos === result[0].apellidos) {
            reject({
              message: "No se ha introducido ningún cambio.",
              statusCode: 400,
            });
          }

          let query = "";

          if (email !== result[0].email && nombre !== result[0].nombre && apellidos !== result[0].apellidos) {
            query = `nombre = '${nombre}', apellidos = '${apellidos}', email = '${email}'`;
          } else if (email !== result[0].email) {
            query = `email = '${email}'`;
          } else if (nombre !== result[0].nombre){
            query = `nombre = '${nombre}'`;
          }
          else{
            query = `apellidos = '${apellidos}'`;
          }

          db.query(
            `UPDATE usuario SET ${query} WHERE id = ?`,
            [userId],
            (err, result) => {
              if (err) throw { message: err, statusCode: 500 };
              resolve({
                message: "Se han actualizado los datos del usuario.",
                data: result,
              });
            }
          );
        }
      }
    );
  });
};