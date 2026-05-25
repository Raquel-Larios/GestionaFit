const db = require("../database/db");
const bcrypt = require("bcryptjs");
const { DEFAULT_ERROR } = require("../constants");
const passwordGenerator = require("../middleware/passwordGenerator");
const mailService = require("../middleware/mailService/mailService");

//CREAR USUARIO DESDE CLIENTES (ADMIN ONLY)
exports.createUser = (params) => {

  const { email, nombre, apellidos } = params;
  const  emailMinusculas = String(email).toLowerCase();
  const  nombreMinusculas = String(nombre).toLowerCase();
  const  apellidosMinusculas = String(apellidos).toLowerCase();

  return new Promise ((resolve, reject) =>{
    db.query(`SELECT id, email, nombre, apellidos FROM usuario WHERE email = ?`, [emailMinusculas],
      (err, result) => {
        if (err) return reject({code: DEFAULT_ERROR, message: "Error al comprobar si el cliente ya existe.", statusCode: 500,});
        if (result.length > 0){
          return reject({
            message: "Ya existe un usuario con este correo electrónico.",
            statusCode: 400,
          });
        }
        const generatedPassword = passwordGenerator.generatePassword(10, false);
        const hashedPass = bcrypt.hashSync(generatedPassword, 10);

        db.query(`INSERT INTO usuario (email, nombre, apellidos, contraseña, isPassGenerated) VALUES (?,?,?,?,?)`, [emailMinusculas, nombreMinusculas, apellidosMinusculas, hashedPass, true],
          (err, result) => {
            if(err) return reject({ code: DEFAULT_ERROR, message: "Error al crear el nuevo cliente, inténtelo de nuevo.", statusCode: 400});
            else{
              mailService.enviarCorreoCliente(emailMinusculas, nombreMinusculas, generatedPassword, "Bienvenida");
              resolve({
                data: result,
                message: "Cliente creado correctamente.",
                statusCode: 200,
              });
            }
          }
        )
      }
    )
  });
}

//ACTUALIZAR CLIENTE (ADMIN ONLY)
exports.updateUser = (params) => {

  const { id_usuario, email, nombre, apellidos} = params;
  const  emailMinusculas  = String(email).toLowerCase();
  const  nombreMinusculas  = String(nombre).toLowerCase();
  const  apellidosMinusculas  = String(apellidos).toLowerCase();

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, email, nombre, apellidos FROM usuario WHERE id = ?`,
      [id_usuario],
      (err, result) => {
        if (err) return reject({ code: DEFAULT_ERROR, message: "Error al buscar el cliente.", statusCode: 500 });

        if (result.length === 0) {
          return reject({
            message: "Cliente no encontrado.",
            statusCode: 404,
          });

        } else {
          if (emailMinusculas === result[0].email && nombreMinusculas === result[0].nombre && apellidosMinusculas === result[0].apellidos) {
            return resolve({
              message: "No se ha introducido ningún cambio.",
              statusCode: 200,
            });
          }

          const fields = []
          const values = [];

          if (emailMinusculas !== result[0].email) {
            db.query(`SELECT email FROM usuario WHERE email = ? and id != ?`, [emailMinusculas, id_usuario],
            (err, result) => {
              if (err) return reject({ code: DEFAULT_ERROR, message: "Error al comprobar que el nuevo correo no exista ya.", statusCode: 500 });
              if (result.length > 0){
                return reject({
                  message: "Ya existe un usuario con este correo electrónico.",
                  statusCode: 400,
                });
              }
            });
            
            fields.push('email = ?')
            values.push(emailMinusculas)
          }

          if (nombreMinusculas !== result[0].nombre) {
            fields.push('nombre = ?')
            values.push(nombreMinusculas)
          }          
          if (apellidosMinusculas !== result[0].apellidos){
            fields.push('apellidos = ?')
            values.push(apellidosMinusculas)
          }

          values.push(id_usuario)
          const query = `UPDATE usuario SET ${fields.join(', ')} WHERE id = ?`

          db.query(
            query, values,
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

  const { id_usuario, email, nombre, apellidos, contraseña, peso, foto_perfil} = params;
  const emailMinusculas  = String(email).toLowerCase();
  const nombreMinusculas  = String(nombre).toLowerCase();
  const apellidosMinusculas  = String(apellidos).toLowerCase();
  let foto_perfilMinusculas = foto_perfil;
  const fotoHeader = String(foto_perfil).slice(0,14);
  if (fotoHeader === "Data:image/png"){
    foto_perfilMinusculas = String(foto_perfil).charAt(0).toLowerCase() + String(foto_perfil).slice(1, foto_perfil.length);
  }

  return new Promise((resolve, reject) => {

    db.query(
      `SELECT id, email, nombre, apellidos, contraseña, foto_perfil, peso FROM usuario WHERE id = ?`,
      [id_usuario],
      (err, result) => {
        if (err) return reject({ code: DEFAULT_ERROR, message: "Error al buscar el cliente.", statusCode: 500 });

        if (result.length === 0) {
          return reject({
            message: "Perfil no encontrado.",
            statusCode: 404,
          });
        } else {
          console.log("Result: ", result[0])
          console.log("Contraseña recibida: ", contraseña)
          const hashGuardado = result[0].contraseña;
          const passMatch = bcrypt.compareSync(contraseña, hashGuardado);
          console.log("PassMatch: ", passMatch)
          if (emailMinusculas === result[0].email && nombreMinusculas === result[0].nombre && apellidosMinusculas === result[0].apellidos && passMatch && foto_perfilMinusculas === result[0].foto_perfil && peso === result[0].peso){
            return resolve({
              message: "No se ha introducido ningún cambio.",
              statusCode: 200,
            });
          }

          const fields = []
          const values = [];
 
          if (emailMinusculas !== result[0].email) {
            db.query(`SELECT email FROM usuario WHERE email = ? and id != ?`, [emailMinusculas, id_usuario],
            (err, result) => {
              if (err) return reject({ code: DEFAULT_ERROR, message: "Error al comprobar que el nuevo correo no exista ya.", statusCode: 500 });
              if (result.length > 0){
                return reject({
                  message: "Ya existe un usuario con este correo electrónico.",
                  statusCode: 400,
                });
              }
            });
            
            fields.push('email = ?')
            values.push(emailMinusculas)

          } 
          if (nombreMinusculas !== result[0].nombre) {
            fields.push('nombre = ?')
            values.push(nombreMinusculas)
          }
          if (apellidosMinusculas !== result[0].apellidos){
            fields.push('apellidos = ?')
            values.push(apellidosMinusculas)
          }
          if (!passMatch){
            const newPass = bcrypt.hashSync(contraseña, 10);
            fields.push('contraseña = ?, isPassGenerated = ?')
            values.push(newPass, false)
          }
          if (foto_perfilMinusculas !== result[0].foto_perfil){
          
            fields.push('foto_perfil = ?')
            values.push(foto_perfilMinusculas)
          }
          if (peso !== result[0].peso){
            fields.push('peso = ?')
            values.push(peso)
          }

          values.push(id_usuario)
          const query = `UPDATE usuario SET ${fields.join(', ')} WHERE id = ?`

          db.query(
            query, values,
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

//ACTUALIZAR FOTO PERFIL
exports.updateProfilePhoto = (params) => {

  const { id_usuario, foto_perfil} = params;

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, foto_perfil FROM usuario WHERE id = ?`,
      [id_usuario],
      (err, result) => {
        if (err) return reject({ code: DEFAULT_ERROR, message: "Error al buscar el cliente.", statusCode: 500 });

        if (result.length === 0) {
          return reject({
            message: "Cliente no encontrado.",
            statusCode: 404,
          });
        } else {
          if (foto_perfil === result[0].foto_perfil) {
            return resolve({
              message: "No se ha introducido ningún cambio.",
              statusCode: 200,
            });
          }
        
          db.query(
            `UPDATE usuario SET foto_perfil = ? WHERE id = ?`,
            [foto_perfil, id_usuario],
            (err, result) => {
              if (err) return reject({ code: DEFAULT_ERROR, message: "Error al actualizar la foto de perfil.", statusCode: 500 }) ;
              return resolve({
                message: "Foto de perfil actualizada correctamente.",
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

  const { id_usuario } = params;
  
   return new Promise((resolve, reject) => {
    db.query(`SELECT id FROM usuario WHERE id = ?`, [id_usuario], (err, result) => {
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
        DELETE FROM usuario WHERE id = ?;`, [id_usuario, id_usuario, id_usuario, id_usuario], (err, result) => {
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

  const { id_usuario, id_plantilla } = params;

  return new Promise ((reject, resolve) => {
    db.query(
      `SELECT id FROM usuario WHERE id = ?;
      SELECT id FROM plantilla WHERE id =?`, [id_usuario, id_plantilla], (err, result) => {
        if (err) return reject({code: DEFAULT_ERROR, message: "Error al verificar que el id de usuario y el id de plantilla existan.", statusCode: 500});
        if(result[0].length === 0) return reject({ message: "Cliente no encontrado.", statusCode: 404});
        if(result[1].length === 0) return reject({ message: "Plantilla no encontrada.", statusCode: 404});

      db.query(
      `SELECT id_usuario, id_plantilla FROM historial_plantilla_usuario WHERE id_usuario = ? AND id_plantilla = ?;`, [id_usuario, id_plantilla],
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
        db.query(`INSERT INTO historial_platilla_usuario (id_plantilla, id_usuario, fecha) VALUES (?,?,?)`, [id_plantilla, id_usuario, fechaMySQL]), (err, result) => {
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

  const { id_usuario, id_plantilla } = params;

  return new Promise ((reject, resolve) => {
    db.query(`SELECT id FROM usuario WHERE id = ?;
      SELECT id FROM plantilla WHERE id =?`, [id_usuario, id_plantilla], (err, result) => {
        if (err) return reject({code: DEFAULT_ERROR, message: "Error al verificar que el id de usuario y el id de plantilla existan.", statusCode: 500});
        if(result[0].length === 0) return reject({ message: "Cliente no encontrado.", statusCode: 404});
        if(result[1].length === 0) return reject({ message: "Plantilla no encontrada.", statusCode: 404});
        
        db.query(`SELECT id, id_usuario, id_plantilla FROM historial_plantilla_usuario WHERE id_usuario = ? AND id_plantilla = ?`,[id_usuario, id_plantilla],
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