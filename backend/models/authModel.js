const {
  loginValidation,
  registerValidation,
} = require("../middleware/validation");
const db = require("../database/db");
const jwt = require("jsonwebtoken");

exports.loginUser = async (params) => {
  const { error } = loginValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { email, contraseña } = params;

  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM usuario WHERE email = ? AND contraseña = ?",
      [email, contraseña],
      (err, result) => {
        if (err) {
          reject({
            data: err,
            message: "Algo ha salido mal, por favor pruebe otra vez.",
            statusCode: 400,
          });
        }

        if (result.length === 0) {
          reject({
            message: "Credenciales erróneas, por favor pruebe otra vez.",
            statusCode: 400,
          });
        }

        if (result.length > 0) {
          const token = jwt.sign({ data: result }, "secret");
          resolve({
            message: "Loggeado correctamente.",
            data: result,
            token,
          });
        }
      }
    );
  });
};

exports.registerUser = async (params) => {
  const { error } = registerValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { email, nombre, apellidos, contraseña} = params;


  return new Promise((resolve, reject) => {
    db.query(
      `SELECT email FROM usuarios WHERE email = ?`,
      [email],
      (err, result) => {
        if (result.length > 0) {
          reject({
            message: "Cuenta de correo en uso, por favor pruebe uno diferente.",
            statusCode: 400,
          });
        } else if (result.length === 0) {
          db.query(
            `INSERT INTO usuario (email, nombre, apellidos, contraseña) VALUES (?,?,?,?)`,
            [email, nombre, apellidos, contraseña],
            (err, result) => {
              if (err) {
                reject({
                  message: "Algo ha salido mal, por favor pruebe otra vez.",
                  statusCode: 400,
                  data: err,
                });
              } else {
                const token = jwt.sign({ data: result }, "secret");
                resolve({
                  data: result,
                  message: "Se ha registrado correctamente.",
                  token: token,
                  statusCode: 200,
                });
              }
            }
          );
        }
      }
    );
  });
};

