const { createUserValidation, updateUserValidation, updateProfileValidation, deleteUserValidation, linkUserToTemplateValidation } = require("../middleware/validation");
const db = require("../database/db");
const bcrypt = require("bcryptjs");
const { DEFAULT_ERROR } = require("../constants");
const passwordGenerator = require("../middleware/passwordGenerator");
const mailService = require("../middleware/mailService/mailService");

//CREAR USUARIO DESDE CLIENTES (ADMIN ONLY)
exports.createUser = (params) => {
  const { error } = createUserValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { email, nombre, apellidos } = params;
  const { emailMinusculas } = String(email).toLowerCase;

  return new Promise ((resolve, reject) =>{
    db.query(`SELECT id, correo, nombre FROM usuario WHERE email = ?`, [emailMinusculas],
      (err, result) => {
        if (err) return reject({code: DEFAULT_ERROR, message: "Error al comprobar si el cliente ya existe.", statusCode: 500,});
        if (result.length > 0){
          return reject({
            message: "Ya existe un usuario con este correo electrónico.",
            statusCode: 400,
          });
        }
        const generatedPassword = passwordGenerator.generatePassword(10, false);
        const hashedPass = bcrypt.hash(generatedPassword, 10);

        db.query(`INSERT INTO usuario (email, nombre, apellidos, contraseña) VALUES (?,?,?,?)`, [emailMinusculas, nombre, apellidos, hashedPass],
          (err, result) => {
            if(err) return reject({ code: DEFAULT_ERROR, message: "Error al crear el nuevo cliente, inténtelo de nuevo.", statusCode: 400});
            else{
              resolve({
                data: result,
                message: "Cliente creado correctamente.",
                statusCode: 200,
              });

              //mailService.enviarCorreoCliente(emailMinusculas, nombre, hashedPass, "Bienvenida");
            }
          }
        )
      }
    )
  });
}

//ACTUALIZAR CLIENTE (ADMIN ONLY)
exports.updateUser = (params) => {
  const { error } = updateUserValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { userId, email, nombre, apellidos} = params;
  const { emailMinusculas } = String(email).toLowerCase;

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, email, nombre, apellidos FROM usuario WHERE id = ?`,
      [userId],
      (err, result) => {
        if (err) return reject({ code: DEFAULT_ERROR, message: "Error al buscar el cliente.", statusCode: 500 });

        if (result.length === 0) {
          return reject({
            message: "Cliente no encontrado.",
            statusCode: 404,
          });
        } else {
          if (email === result[0].email && nombre === result[0].nombre && apellidos === result[0].apellidos) {
            return reject({
              message: "No se ha introducido ningún cambio.",
              statusCode: 400,
            });
          }

          let query = "";

 
          if (email !== result[0].email) {
            db.query(`SELECT email FROM usuario WHERE email = ? and id != ?`, [emailMinusculas, userId],
            (err, result) => {
              if (err) return reject({ code: DEFAULT_ERROR, message: "Error al comprobar que el nuevo email no exista ya.", statusCode: 500 });
              if (result.length > 0){
                return reject({
                  message: "Ya existe un usuario con este correo electrónico.",
                  statusCode: 400,
                });
              }
            });
            
            query += `email = '${email}'`;
          } 
          if (nombre !== result[0].nombre) {
            if(query !== ""){
              query += `, `;
            }
            query += `nombre = '${nombre}'`;
          }          
          if (apellidos !== result[0].apellidos){
            if(query !== ""){
              query += `, `;
            }
            query = `apellidos = '${apellidos}'`;
          }

          db.query(
            `UPDATE usuario SET ${query} WHERE id = ?`,
            [userId],
            (err, result) => {
              if (err) return reject({ code: DEFAULT_ERROR, message: "Error al actualizar el cliente.", statusCode: 500 }) ;
              return resolve({
                message: "Cliente actualizado correctamente.",
                data: result,
                statusCode: 200,
              });
            }
          );
        }
      }
    );
  });
};

//ACTUALIZAR PERFIL 
exports.updateProfile = (params) => {
  const { error } = updateProfileValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { userId, email, nombre, apellidos, contraseña, foto_perfil, peso} = params;
  const { emailMinusculas } = String(email).toLowerCase;

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, email, nombre, apellidos, contraseña, foto_perfil, peso FROM usuario WHERE id = ?`,
      [userId],
      (err, result) => {
        if (err) return reject({ code: DEFAULT_ERROR, message: "Error al buscar el cliente.", statusCode: 500 });

        if (result.length === 0) {
          return reject({
            message: "Perfil no encontrado.",
            statusCode: 404,
          });
        } else {
          const hashGuardado = result[0].contraseña;
          const passMatch = bcrypt.compare(contraseña, hashGuardado);
          if (email === result[0].email && nombre === result[0].nombre && apellidos === result[0].apellidos && passMatch && foto_perfil === result[0].foto_perfil && peso === result[0].peso){
            return reject({
              message: "No se ha introducido ningún cambio.",
              statusCode: 400,
            });
          }

          let query = "";
 
          if (email !== result[0].email) {
            db.query(`SELECT email FROM usuario WHERE email = ? and id != ?`, [emailMinusculas, userId],
            (err, result) => {
              if (err) return reject({ code: DEFAULT_ERROR, message: "Error al comprobar que el nuevo email no exista ya.", statusCode: 500 });
              if (result.length > 0){
                return reject({
                  message: "Ya existe un usuario con este correo electrónico.",
                  statusCode: 400,
                });
              }
            });
            
            query += `email = '${email}'`;
          } 
          if (nombre !== result[0].nombre) {
            if(query !== ""){
              query += `, `;
            }
            query += `nombre = '${nombre}'`;
          }
          if (apellidos !== result[0].apellidos){
            if(query !== ""){
              query += `, `;
            }
            query = `apellidos = '${apellidos}'`;
          }
          if (!passMatch){
            if(query !== ""){
              query += `, `;
            }
            const newPass = bcrypt.hash(contraseña, 10);
            query = `constraseña = '${newPass}'`;
          }
          if (foto_perfil !== result[0].foto_perfil){
            if(query !== ""){
              query += `, `;
            }
            query = `foto_perfil = '${foto_perfil}'`;
          }
          if (peso !== result[0].peso){
            if(query !== ""){
              query += `, `;
            }
            query = `peso = '${peso}'`;
          }

          db.query(
            `UPDATE usuario SET ${query} WHERE id = ?`,
            [userId],
            (err, result) => {
              if (err) return reject({ code: DEFAULT_ERROR, message: "Error al actualizar el perfil.", statusCode: 500 }) ;
              return resolve({
                message: "Perfil actualizado correctamente.",
                data: result,
                statusCode: 200,
              });
            }
          );
        }
      }
    );
  });
}

//ELIMINAR CLIENTE (ADMIN ONLY) 
exports.deleteUser = (params) => {
  const { error } = deleteUserValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { userId } = params;
  
   return new Promise((resolve, reject) => {
    db.query(`SELECT id FROM usuario WHERE id = ?`, [userId], (err, result) => {
      if (err) {
        return reject({
          code: DEFAULT_ERROR,
          message: "Error al buscar el cliente.",
          statusCode: 500,
        });
      }
      if (result.length === 0) {
        return reject({
          message: "Cliente no encontrado.",
          statusCode: 404,
        });
      }

      db.query(`SELECT id FROM historial_plantilla_usuario WHERE id_usuario = ?;
        DELETE FROM historial_plantilla_usuario WHERE id_usuario = ?;
        DELETE FROM lectura WHERE id_usuario = ?;
        DELETE FROM usuario WHERE id = ?;`, [userId, userId, userId, userId], (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al eliminar el cliente.",
            statusCode: 500,
          });
        }
        if(result[0].length > 0){
          const ids_historial = result[0].map(row => row.id_historial);
          db.query(`DELETE FROM variacion WHERE id_historial IN (?)`, [ids_historial], (err, result) => {
            if (err) return reject({code: DEFAULT_ERROR, message: "Error al eliminar las plantillas asignadas al usuario.",
              statusCode: 500,
            });
          })
        }

        resolve({
              message: "Cliente eliminado correctamente.",
              statusCode: 200,
            });
      });
    });
  });
}

//ASIGNAR A PLANTILLA
exports.linkUserToTemplate = (params) => {
  const { error } = linkUserToTemplateValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { userId, plantillaId } = params;

  return new Promise ((reject, resolve) => {
    db.query(
      `SELECT id FROM usuario WHERE id = ?;
      SELECT id FROM plantilla WHERE id =?`, [userId, plantillaId], (err, result) => {
        if (err) return reject({code: DEFAULT_ERROR, message: "Error al verificar que el id de usuario y el id de plantilla existan.", statusCode: 500});
        if(result[0].length === 0) return reject({ message: "Cliente no encontrado.", statusCode: 404});
        if(result[1].length === 0) return reject({ message: "Plantilla no encontrada.", statusCode: 404});

        db.query(
      `SELECT id_usuario, id_plantilla FROM historial_plantilla_usuario WHERE id_usuario = ? AND id_plantilla = ?;`, [userId, plantillaId],
      (err, result) => {
        if(err) return reject({code: DEFAULT_ERROR, message: "Error al comprobar si la asignación ya existe.", statusCode: 500});
      
        if(result.length > 0){
          return reject({
            message: "Esta plantilla ya ha sido asignada al cliente.",
            statusCode: 400,
        });
        }
        const fecha = new Date();
        const fechaMySQL = fecha.toISOString().slice(0, 19).replace('T', ' ');
        db.query(`INSERT INTO historial_platilla_usuario (id_plantilla, id_usuario, fecha) VALUES (?,?,?)`, [plantillaId, userId, fechaMySQL]), (err, result) => {
          if(err) return reject({code: DEFAULT_ERROR, message: "Error al asignar la plantilla al cliente.", statusCode: 500});
          resolve({data: result,
            message: "Plantilla asignada al cliente correctamente.",
            statusCode: 200,
        });
        };
      }
    );
    }
    );
  });
}

//ELIMINAR ASIGNACIÓN DE PLANTILLA
exports.unlinkUserFromTemplate = (params) => {
  const { error } = linkUserToTemplateValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { userId, plantillaId } = params;

  return new Promise ((reject, resolve) => {
    db.query(`SELECT id FROM usuario WHERE id = ?;
      SELECT id FROM plantilla WHERE id =?`, [userId, plantillaId], (err, result) => {
        if (err) return reject({code: DEFAULT_ERROR, message: "Error al verificar que el id de usuario y el id de plantilla existan.", statusCode: 500});
        if(result[0].length === 0) return reject({ message: "Cliente no encontrado.", statusCode: 404});
        if(result[1].length === 0) return reject({ message: "Plantilla no encontrada.", statusCode: 404});
        
        db.query(`SELECT id, id_usuario, id_plantilla FROM historial_plantilla_usuario WHERE id_usuario = ? AND id_plantilla = ?`,[userId, plantillaId],
          (err, result) => {
            if(err) return reject({code: DEFAULT_ERROR, message: "Error buscando la asiganción usuario-plantilla.", statusCode: 500
            });
            if(result.length){
              return reject({message: "Asignación usuario-cliente no encontrada.", statusCode: 404});
            }
            const id_historial = result[0].id;
            db.query(`DELETE FROM variacion WHERE id_historial = ?;
              DELETE FROM historial_plantilla_usuario WHERE id = ?;`,[id_historial, id_historial], 
              (err, result) => {
                if(err) return reject({code: DEFAULT_ERROR, message: "Error al eliminar la asignación usuario-plantilla.", statusCode: 500});
                resolve({
                  message: "Asignación usuario-plantilla eliminada correctamente.",
                });
              });
          }
        )
      })
        
  });
}