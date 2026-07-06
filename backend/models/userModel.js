const db = require("../database/db");
const bcrypt = require("bcryptjs");
const { DEFAULT_ERROR } = require("../constants");
const passwordGenerator = require("../middleware/passwordGenerator");
const mailService = require("../middleware/mailService/mailService");

/**
 * Modelo: Creación de cliente con generación automática de credenciales.
 * 
 * Normaliza los datos de entrada a minúsculas y verifica la unicidad del correo electrónico.
 * Genera una contraseña aleatoria segura, la hashea con bcrypt y la almacena.
 * Envía un correo de bienvenida con las credenciales de acceso tras la creación exitosa.
 * 
 * @function createUser
 * @param {Object} params - Objeto con los datos del nuevo cliente.
 * @param {string} params.email - Correo electrónico (se normaliza a minúsculas).
 * @param {string} params.nombre - Nombre del cliente (se normaliza a minúsculas).
 * @param {string} params.apellidos - Apellidos del cliente (se normaliza a minúsculas).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el resultado de la inserción y mensaje de éxito.
 * @rejects {Object} Rechaza con error 400 si el correo electrónico ya está registrado.
 * @rejects {Object} Rechaza con error 500 si falla la consulta de verificación, la inserción o el envío del correo.
 */
exports.createUser = (params) => {
  // 1. Normalización de datos de entrada
  const { email, nombre, apellidos } = params;
  const  emailMinusculas = String(email).toLowerCase();
  const  nombreMinusculas = String(nombre).toLowerCase();
  const  apellidosMinusculas = String(apellidos).toLowerCase();

  return new Promise ((resolve, reject) =>{
    // 2. Verificación de unicidad del correo
    db.query(`SELECT id, email, nombre, apellidos FROM usuario WHERE email = ?`, [emailMinusculas],
      (err, result) => {
        if (err) return reject({code: DEFAULT_ERROR, message: "Error al comprobar si el cliente ya existe.", statusCode: 500,});
        if (result.length > 0){
          return reject({
            message: "Ya existe un usuario con este correo electrónico.",
            statusCode: 400,
          });
        }

        // 3. Generación y hasheo de contraseña aleatoria
        const generatedPassword = passwordGenerator.generatePassword(10, false);
        const hashedPass = bcrypt.hashSync(generatedPassword, 10);

        // 4. Inserción del nuevo usuario
        db.query(`INSERT INTO usuario (email, nombre, apellidos, contraseña, isPassGenerated) VALUES (?,?,?,?,?)`, [emailMinusculas, nombreMinusculas, apellidosMinusculas, hashedPass, true],
          (err, result) => {
            if(err) return reject({ code: DEFAULT_ERROR, message: "Error al crear el nuevo cliente, inténtelo de nuevo.", statusCode: 400});
            else{
              // 5. Envío asíncrono de correo de bienvenida (No bloquea la respuesta)
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

/**
 * Modelo: Actualización optimizada de datos de cliente (Admin).
 * 
 * Verifica la existencia del usuario y compara los datos entrantes con los actuales.
 * Si no hay cambios reales, resuelve inmediatamente sin escribir en la BD.
 * Si hay cambios, valida la unicidad del nuevo correo (excluyendo el ID actual) y construye
 * dinámicamente la sentencia UPDATE modificando solo los campos alterados.
 * 
 * @function updateUser
 * @param {Object} params - Objeto con los datos actualizados.
 * @param {number} params.id_usuario - ID del cliente a actualizar.
 * @param {string} params.email - Nuevo correo electrónico.
 * @param {string} params.nombre - Nuevo nombre.
 * @param {string} params.apellidos - Nuevos apellidos.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el resultado de la actualización.
 * @rejects {Object} Rechaza con error 404 si el cliente no existe.
 * @rejects {Object} Rechaza con error 400 si el nuevo correo ya pertenece a otro usuario.
 * @rejects {Object} Rechaza con error 500 si falla la consulta o la actualización.
 */
exports.updateUser = (params) => {

  const { id_usuario, email, nombre, apellidos} = params;
  const  emailMinusculas  = String(email).toLowerCase();
  const  nombreMinusculas  = String(nombre).toLowerCase();
  const  apellidosMinusculas  = String(apellidos).toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. Obtención de datos actuales para comparación
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
          // 2. Optimización: Si los datos son idénticos, abortar escritura
          if (emailMinusculas === result[0].email && nombreMinusculas === result[0].nombre && apellidosMinusculas === result[0].apellidos) {
            return resolve({
              message: "No se ha introducido ningún cambio.",
              statusCode: 200,
            });
          }

          const fields = []
          const values = [];

          // 3. Validación de unicidad de correo (Solo si el correo cambia)
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

          // 4. Construcción dinámica de campos a actualizar
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

          // 5. Ejecución de la actualización dinámica
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

/**
 * Modelo: Actualización completa del perfil con validación de identidad y optimización de escritura.
 * 
 * Recupera los datos actuales del usuario y los compara con los entrantes para evitar escrituras innecesarias.
 * Verifica la identidad comparando la contraseña proporcionada con el hash almacenado.
 * Si la contraseña ha cambiado, la hashea y actualiza el flag 'isPassGenerated' a false.
 * Construye dinámicamente la sentencia UPDATE modificando solo los campos alterados (email, contraseña, nombre, apellidos, foto, peso).
 * Valida la unicidad del nuevo correo excluyendo el ID actual.
 * 
 * @function updateProfile
 * @param {Object} params - Objeto con los datos actualizados del perfil.
 * @param {number} params.id_usuario - ID del usuario propietario.
 * @param {string} params.email - Nuevo correo electrónico.
 * @param {string} params.nombre - Nuevo nombre.
 * @param {string} params.apellidos - Nuevos apellidos.
 * @param {string} params.contraseña - Contraseña actual (para verificación) o nueva (si cambia).
 * @param {number} params.peso - Nuevo peso corporal.
 * @param {string} params.foto_perfil - String Base64 o ruta de la nueva foto.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con los datos actualizados del usuario.
 * @rejects {Object} Rechaza con error 404 si el perfil no existe.
 * @rejects {Object} Rechaza con error 400 si el correo ya está en uso por otro usuario.
 * @rejects {Object} Rechaza con error 500 si falla la consulta, el hash o la actualización.
 */
exports.updateProfile = (params) => {
  // 1. Normalización y limpieza de datos
  const { id_usuario, email, nombre, apellidos, contraseña, peso, foto_perfil} = params;
  const emailMinusculas  = String(email).toLowerCase();
  const nombreMinusculas  = String(nombre).toLowerCase();
  const apellidosMinusculas  = String(apellidos).toLowerCase();

  // Limpieza de prefijo Base64 si existe
  let fotoPerfilLimpia = foto_perfil;
  if (foto_perfil && typeof foto_perfil === 'string') {
    if (foto_perfil.includes('base64,')) {
      fotoPerfilLimpia = foto_perfil.split(',')[1];
    }
  }

  return new Promise((resolve, reject) => {
    // 2. Obtención de datos actuales y verificación de identidad
    db.query(
      `SELECT id, email, nombre, apellidos, contraseña, foto_perfil, peso, rol FROM usuario WHERE id = ?`,
      [id_usuario],
      (err, result) => {
        if (err) return reject({ code: DEFAULT_ERROR, message: "Error al buscar el cliente.", statusCode: 500 });

        if (result.length === 0) {
          return reject({
            message: "Perfil no encontrado.",
            statusCode: 404,
          });
        } else {
          const hashGuardado = result[0].contraseña;
          const passMatch = bcrypt.compareSync(contraseña, hashGuardado);
          const fotoEnBD = result[0].foto_perfil || '';

          // 3. Optimización: Si todo es idéntico (incluyendo contraseña), abortar
          if (emailMinusculas === result[0].email && nombreMinusculas === result[0].nombre && apellidosMinusculas === result[0].apellidos && passMatch && fotoPerfilLimpia === fotoEnBD && peso === result[0].peso){
            return resolve({
              message: "No se ha introducido ningún cambio.",
              data:result[0],
              statusCode: 200,
            });
          }

          const fields = []
          const values = [];
 
          // 4. Validación de correo
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

          // 5. Construcción dinámica de campos
          if (nombreMinusculas !== result[0].nombre) {
            fields.push('nombre = ?')
            values.push(nombreMinusculas)
          }
          if (apellidosMinusculas !== result[0].apellidos){
            fields.push('apellidos = ?')
            values.push(apellidosMinusculas)
          }

          // Si la contraseña no coincide, asume que es una nueva y la hashea
          if (!passMatch){
            const newPass = bcrypt.hashSync(contraseña, 10);
            fields.push('contraseña = ?, isPassGenerated = ?')
            values.push(newPass, false) // Marca como contraseña manual
          }
          if (fotoPerfilLimpia !== fotoEnBD) {
            fields.push('foto_perfil = ?');
            values.push(fotoPerfilLimpia); 
          }
          if (peso !== result[0].peso){
            fields.push('peso = ?')
            values.push(peso)
          }

          values.push(id_usuario)
          const query = `UPDATE usuario SET ${fields.join(', ')} WHERE id = ?`

          // 6. Ejecución de actualización y recuperación de datos frescos
          db.query(
            query, values,
            (err, result) => {
              if (err) return reject({ code: DEFAULT_ERROR, message: "Error al actualizar el perfil.", statusCode: 500 }) ;
              
              db.query(
                `SELECT id, email, nombre, apellidos, foto_perfil, peso, rol FROM usuario WHERE id = ?`,
                [id_usuario],
                (err, resultFinal) => {
                  if (err) return reject({ code: DEFAULT_ERROR, message: "Error al obtener datos actualizados.", statusCode: 500 });
                  
                  return resolve({
                    message: "Perfil actualizado correctamente.",
                    data: resultFinal[0],
                    statusCode: 200,
                  });
                }
              );
            }
          );
        }
      }
    );
  });
}

/**
 * Modelo: Actualización exclusiva de la foto de perfil con limpieza de Base64.
 * 
 * Extrae la parte codificada de un string Base64 (si existe) para almacenar solo los datos puros.
 * Compara con la foto actual para evitar escrituras redundantes.
 * Tras actualizar, recupera el perfil completo para devolverlo.
 * 
 * @function updateProfilePhoto
 * @param {Object} params - Objeto con ID y datos de la foto.
 * @param {number} params.id_usuario - ID del usuario propietario.
 * @param {string} params.foto_perfil - String Base64 o ruta de la imagen.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el perfil actualizado.
 * @rejects {Object} Rechaza con error 404 si el usuario no existe.
 * @rejects {Object} Rechaza con error 500 si falla la consulta o actualización.
 */
exports.updateProfilePhoto = (params) => {

  const { id_usuario, foto_perfil} = params;

  // 1. Limpieza de prefijo Base64
  let fotoPerfilLimpia = foto_perfil;
  if (foto_perfil && typeof foto_perfil === 'string' && foto_perfil.includes('base64,')) {
    fotoPerfilLimpia = foto_perfil.split(',')[1];
  }

  return new Promise((resolve, reject) => {
    // 2. Verificación de estado actual
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
          // 3. Optimización: Si la foto es idéntica, abortar
          if (foto_perfil === result[0].foto_perfil) {
            return resolve({
              message: "No se ha introducido ningún cambio.",
              statusCode: 200,
            });
          }
        
          // 4. Actualización y recuperación de datos
          db.query(
            `UPDATE usuario SET foto_perfil = ? WHERE id = ?`,
            [fotoPerfilLimpia, id_usuario],
            (err, result) => {
              if (err) return reject({ code: DEFAULT_ERROR, message: "Error al actualizar la foto de perfil.", statusCode: 500 }) ;

              db.query(`SELECT id, email, nombre, apellidos, foto_perfil, peso, rol FROM usuario WHERE id = ?`, [id_usuario], (err, result) => {
                if (err) return reject({ code: DEFAULT_ERROR, message: "Error al obtener usuario.", statusCode: 500 });
                resolve({
                  message: "Foto actualizada",
                  data: result[0],
                  statusCode: 200
                });
              });
            }
          );
        }
      }
    );
  });
}

/**
 * Modelo: Eliminación completa de cliente con limpieza de datos relacionados.
 * 
 * Verifica la existencia del usuario y ejecuta una secuencia de borrado en cascada manual.
 * Primero recupera los IDs de historial para limpiar tablas hijas (variacion), luego elimina
 * registros de asignaciones, lecturas y finalmente el usuario.
 * Nota: Requiere `multipleStatements: true`. 
 * 
 * @function deleteUser
 * @param {Object} params - Objeto con el ID del usuario.
 * @param {number} params.id_usuario - ID del cliente a eliminar.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con mensaje de éxito.
 * @rejects {Object} Rechaza con error 404 si el cliente no existe.
 * @rejects {Object} Rechaza con error 500 si falla alguna consulta de eliminación.
 */
exports.deleteUser = (params) => {

  const { id_usuario } = params;
  
   return new Promise((resolve, reject) => {
    // 1. Verificación de existencia
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

      // 2. Limpieza en cascada manual (Requiere multipleStatements: true)
      // Nota: Se seleccionan los IDs de historial primero para usarlos luego.
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

        // 3. Limpieza de tablas hijas del historial (Variaciones)
        if(result[0].length > 0){
          const ids_historial = result[0].map(row => row.id);
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

/**
 * Modelo: Asignación de plantilla a usuario con validación de existencia.
 * 
 * Verifica que tanto el usuario como la plantilla existan mediante múltiples statements.
 * Comprueba que la asignación no esté duplicada antes de insertar el registro en el historial.
 * 
 * @function linkUserToTemplate
 * @param {Object} params - Objeto con IDs de usuario y plantilla.
 * @param {number} params.id_usuario - ID del cliente.
 * @param {number} params.id_plantilla - ID de la plantilla.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el resultado de la inserción.
 * @rejects {Object} Rechaza con error 404 si el usuario o la plantilla no existen.
 * @rejects {Object} Rechaza con error 400 si la asignación ya existe.
 * @rejects {Object} Rechaza con error 500 si falla la consulta.
 */
exports.linkUserToTemplate = (params) => {

  const { id_usuario, id_plantilla } = params;

  return new Promise ((resolve, reject) => {
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
        db.query(`INSERT INTO historial_plantilla_usuario (id_plantilla, id_usuario, fecha) VALUES (?,?,?)`, [id_plantilla, id_usuario, fechaMySQL], (err, result) => {
          if(err) return reject({code: DEFAULT_ERROR, message: "Error al asignar la plantilla al cliente.", statusCode: 500});
          resolve({data: result,
            message: "Plantilla asignada al cliente correctamente.",
            statusCode: 200,
          });
        });
      }
    );
    }
    );
  });
}

/**
 * Modelo: Eliminación de asignación plantilla-usuario.
 * 
 * Valida existencia de usuario y plantilla. Busca el ID de historial de la asignación específica
 * y elimina en cascada las variaciones asociadas y el registro de historial.
 * 
 * @function unlinkUserFromTemplate
 * @param {Object} params - Objeto con IDs de usuario y plantilla.
 * @param {number} params.id_usuario - ID del cliente.
 * @param {number} params.id_plantilla - ID de la plantilla.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con mensaje de éxito.
 * @rejects {Object} Rechaza con error 404 si la asignación no existe.
 * @rejects {Object} Rechaza con error 500 si falla la eliminación.
 */
exports.unlinkUserFromTemplate = (params) => {

  const { id_usuario, id_plantilla } = params;

  return new Promise ((resolve, reject) => {
    db.query(`SELECT id FROM usuario WHERE id = ?;
      SELECT id FROM plantilla WHERE id =?`, [id_usuario, id_plantilla], (err, result) => {
        if (err) return reject({code: DEFAULT_ERROR, message: "Error al verificar que el id de usuario y el id de plantilla existan.", statusCode: 500});
        if(result[0].length === 0) return reject({ message: "Cliente no encontrado.", statusCode: 404});
        if(result[1].length === 0) return reject({ message: "Plantilla no encontrada.", statusCode: 404});
        
        db.query(`SELECT id, id_usuario, id_plantilla FROM historial_plantilla_usuario WHERE id_usuario = ? AND id_plantilla = ?`,[id_usuario, id_plantilla],
          (err, result) => {
            if(err) return reject({code: DEFAULT_ERROR, message: "Error buscando la asiganción usuario-plantilla.", statusCode: 500
            });
            if(result.length === 0){
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