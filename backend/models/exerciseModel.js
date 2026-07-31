const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

/**
 * Modelo: Creación de ejercicios con validación de unicidad y categoría opcional.
 * 
 * Verifica que no exista un ejercicio con el mismo nombre (case-insensitive)
 * antes de insertar. Maneja dinámicamente la inserción: si no hay categoría (0),
 * inserta solo el nombre; si la hay, incluye la clave foránea. Esto permite
 * ejercicios "huérfanos" iniciales sin violar la integridad referencial.
 * 
 * @function createExercise
 * @param {Object} params - Objeto con datos del ejercicio.
 * @param {string} params.nombre_ejercicio - Nombre del ejercicio a crear.
 * @param {number} params.id_categoria - ID de la categoría (0 si es ninguna).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con { data, message, statusCode } (ID de inserción).
 * @rejects {Object} Rechaza con error 400 si el nombre ya existe (duplicidad).
 * @rejects {Object} Rechaza con error 500 si falla la consulta a la base de datos.
 */
exports.createExercise = (params) => {

  const { nombre_ejercicio, id_categoria } = params;
  // Normalización a minúsculas para garantizar unicidad independiente de mayúsculas/minúsculas
  const nombreMinusculas = String(nombre_ejercicio).toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia (Prevención de duplicados)
    db.query(
      `SELECT id FROM ejercicio WHERE nombre_ejercicio = ?`,
      [nombreMinusculas],
      (err, result) => {
        if(err){
            return reject({
                code: DEFAULT_ERROR,
                message: "Error al comprobar si ya existe el ejercicio.",
                statusCode: 500,
            });
        }
        if (result.length > 0) {
          return reject({
            message:
              "Ya hay un ejercicio con este nombre, por favor escoja uno distinto.",
            statusCode: 400,
          });
        } 

        // 2. Construcción dinámica de la consulta SQL según la presencia de categoría
        let query, values;
        if(id_categoria === 0){
          // Caso: Ejercicio sin categoría asignada (0)
          query = 'INSERT INTO ejercicio (nombre_ejercicio) VALUES (?)';
          values = [nombreMinusculas];
        }
        else{
          // Caso: Ejercicio con categoría asignada
          query = 'INSERT INTO ejercicio (nombre_ejercicio, id_categoria) VALUES (?, ?)';
          values = [nombreMinusculas, id_categoria];
        }

        // 3. Ejecución de la inserción parametrizada (segura contra SQL Injection)
        if (result.length === 0){
          db.query(
            query, values,
            (err, result) => {
              if (err) {
                return reject({
                  message: "Error al crear el ejercicio.",
                  statusCode: 500,
                });
              } else {
                     return resolve({
                        data: result,
                        message: "Ejercicio creado correctamente.",
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

/**
 * Modelo: Actualización de ejercicios con optimización de escritura.
 * 
 * Valida la existencia del registro y verifica la unicidad del nuevo nombre
 * (excluyendo el propio ID). Compara los datos entrantes con los actuales
 * para evitar escrituras innecesarias en la BD. Construye dinámicamente
 * la sentencia UPDATE modificando solo los campos que han cambiado realmente.
 * 
 * @function updateExercise
 * @param {Object} params - Objeto con datos actualizados.
 * @param {string} params.nombre_ejercicio - Nuevo nombre del ejercicio.
 * @param {number} params.id_categoria - Nueva ID de categoría.
 * @param {number} params.id_ejercicio - ID del ejercicio a actualizar.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el resultado de la actualización.
 * @rejects {Object} Rechaza con error 404 si el ejercicio no existe.
 * @rejects {Object} Rechaza con error 400 si hay conflicto de nombre (duplicidad).
 * @rejects {Object} Rechaza con error 500 si falla la consulta a la base de datos.
 */
exports.updateExercise = (params) => {

  const { nombre_ejercicio, id_categoria, id_ejercicio } = params;
  const nombreMinusculas = String(nombre_ejercicio).toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia del registro
    db.query(
      `SELECT id FROM ejercicio WHERE id = ?`,
      [id_ejercicio],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar el ejercicio.",
            statusCode: 500,
          });
        }

        if (result.length === 0) {
          return reject({
            message: "Ejercicio no encontrado.",
            statusCode: 404,
          });
        }

        const ejercicioSelect = result[0];

        // 2. Validación de unicidad: Busca colisiones EXCLUYENDO el ID actual
        db.query(
          `SELECT id FROM ejercicio WHERE nombre_ejercicio = ? AND id !=?;`,
          [nombreMinusculas, id_ejercicio],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al validar el ejercicio.",
                statusCode: 500,
              });
            }

            if (result.length > 0) {
              return reject({
                message:
                  "Ya hay un ejercicio con este nombre, por favor escoja uno distinto.",
                statusCode: 400,
              });
            }

            // 3. Optimización: Si los datos son idénticos (nombre y categoría), no se escribe en BD
            if((id_categoria === ejercicioSelect.id_categoria) && nombreMinusculas === ejercicioSelect.nombre_ejercicio){
                return resolve({
                    message: "No se ha introducido ningún cambio.",
                    statusCode: 200,
                });
            }

            // 4. Construcción dinámica de la consulta UPDATE (Solo actualiza lo modificado)
            let query, values;

            if(nombreMinusculas !== ejercicioSelect.nombre_ejercicio && id_categoria !== ejercicioSelect.id_categoria){
              // Cambian ambos campos
              query = 'UPDATE ejercicio SET nombre_ejercicio = ? , id_categoria = ? WHERE id = ?';
              values = [nombreMinusculas, id_categoria, id_ejercicio]
            }
            else if(nombreMinusculas !== ejercicioSelect.nombre_ejercicio && id_categoria === ejercicioSelect.id_categoria){
              // Cambia solo el nombre
              query = 'UPDATE ejercicio SET nombre_ejercicio = ? WHERE id = ?';
              values = [nombreMinusculas, id_ejercicio]
            }
            else{
              // Cambia solo la categoría
              query = 'UPDATE ejercicio SET id_categoria = ? WHERE id = ?';
              values = [id_categoria, id_ejercicio]
            }

            // 5. Ejecución de la actualización parametrizada
            db.query(
              query, values,
              (err, result) => {
                if (err) {
                  return reject({
                    code: DEFAULT_ERROR,
                    message:
                      "Error al actualizar el ejercicio, inténtelo otra vez.",
                    statusCode: 500,
                  });
                }

                resolve({
                  data: result,
                  message: "Ejercicio actualizado correctamente.",
                  statusCode: 200,
                });
              }
            );
              
      
          }
        );
      }
    );
  });
};

/**
 * Modelo: Eliminación de ejercicio con cascada manual selectiva.
 * 
 * Implementa un borrado seguro eliminando el ejercicio y sus dependencias operativas
 * (defectos, variaciones, lecutras, demostraciones).
 * Ejecuta las sentencias en secuencia dentro de la misma promesa.
 * 
 * @function deleteExercise
 * @param {Object} params - Objeto con el ID del ejercicio.
 * @param {number} params.id_ejercicio - ID del ejercicio a eliminar.
 * 
 * @returns {Promise<Object>} Promesa que resuelve tras el borrado exitoso.
 * @rejects {Object} Rechaza con error 404 si el ejercicio no existe.
 * @rejects {Object} Rechaza con error 500 si falla la eliminación o la conexión.
 */
exports.deleteExercise = (params) => {

  const { id_ejercicio } = params;

  return new Promise((resolve, reject) => {
    // 1. Verificación previa de existencia
    db.query(`SELECT id FROM ejercicio WHERE id = ?`, [id_ejercicio], (err, result) => {
      if (err) {
        return reject({
          code: DEFAULT_ERROR,
          message: "Error al buscar el ejercicio.",
          statusCode: 500,
        });
      }
      if (result.length === 0) {
        return reject({
          message: "Ejercicio no encontrado.",
          statusCode: 404,
        });
      }

      // 2. Borrado en Cascada Manual (Selective Cascade)
      db.query(`
        DELETE FROM defecto WHERE id_ejercicio = ?;
        DELETE FROM variacion WHERE id_ejercicio =?;
        DELETE FROM lectura WHERE id_ejercicio =?;
        DELETE FROM demostracion WHERE id_ejercicio = ?;
        DELETE FROM ejercicio WHERE id = ?;`, [id_ejercicio, id_ejercicio, id_ejercicio, id_ejercicio, id_ejercicio], (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al eliminar el ejercicio.",
            statusCode: 500,
          });
        }
        resolve({
          message: "Ejercicio eliminado correctamente.",
          statusCode: 200,
        });
      });
    });
  });
};

/**
 * Modelo: Asignación de video a ejercicio (Relación 1:1 con reemplazo).
 * 
 * Gestiona la tabla 'demostracion'. Verifica si ya existe un video asignado.
 * Si existe y no se fuerza el reemplazo, devuelve un conflicto (409).
 * Si se fuerza, elimina la asignación anterior antes de insertar la nueva.
 * 
 * @function linkExerciseToVideo
 * @param {Object} params - Parámetros de asignación.
 * @param {number} params.id_video - ID del video a asignar.
 * @param {number} params.id_ejercicio - ID del ejercicio objetivo.
 * @param {boolean} params.forceReplace - Flag para forzar la sobrescritura.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con la nueva asignación.
 * @rejects {Object} Rechaza con error 409 si hay asignación previa y no se fuerza el cambio.
 * @rejects {Object} Rechaza con error 500 si falla la consulta.
 */
exports.linkExerciseToVideo = (params) => {

  const { id_video, id_ejercicio, forceReplace } = params;

  return new Promise((resolve, reject) => {
    // 1. Comprobación de asignación existente mediante JOIN para obtener el nombre del video
    db.query(
      `SELECT demostracion.id_video, video.nombre_video FROM demostracion INNER JOIN video ON demostracion.id_video = video.id WHERE id_ejercicio = ?`,
      [id_ejercicio],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar la asignación.",
            statusCode: 500,
          });
        }
        if (result.length > 0) {
          // Caso: Ya existe un video asignado
          if (!forceReplace) {
            const video_asignado = result[0].nombre_video;
            // Estilizado del nombre para el mensaje de error al usuario
            const video_asignado_estilizado =
              String(video_asignado).charAt(0).toUpperCase() +
              String(video_asignado).slice(1).toLowerCase();
            return reject({
              message:
                'Este ejercicio ya está asignado al vídeo "' +
                video_asignado_estilizado +
                '". ¿Desea reemplazarlo?',
              statusCode: 409, // Conflict: Requiere intervención del usuario (forceReplace)
            });
          } else {
            // Caso: Forzar reemplazo -> Borrado previo de la relación antigua
            db.query(
              `DELETE FROM demostracion WHERE id_ejercicio = ?`,
              [id_ejercicio],
              (err, result) => {
                if (err) {
                  return reject({
                    code: DEFAULT_ERROR,
                    message: "Error al borrar la asignación anterior del ejercicio.",
                    statusCode: 500,
                  });
                }
                // Continuación hacia el INSERT (fuera de este bloque)
              },
            );
          }
        }
        // 2. Inserción de la nueva relación (Ejecuta siempre, salvo error en el borrado previo)
        db.query(
          `INSERT INTO demostracion (id_ejercicio, id_video) VALUES (?, ?)`,
          [id_ejercicio, id_video],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al asignar el vídeo al ejercicio.",
                statusCode: 500,
              });
            }

            resolve({
              data: result,
              message: "Vídeo asignado al ejercicio correctamente.",
              statusCode: 200,
            });
          },
        );
      },
    );
  });
};

/**
 * Modelo: Eliminación de la asignación Video-Ejercicio.
 * 
 * Verifica la existencia del vínculo en la tabla intermedia 'demostracion'
 * antes de proceder al borrado. Esto asegura que no se intenten eliminar
 * registros inexistentes, devolviendo un error 404 específico si no hay relación.
 * 
 * @function unlinkExerciseFromVideo
 * @param {Object} params - Objeto con el ID del ejercicio.
 * @param {number} params.id_ejercicio - ID del ejercicio a desvincular.
 * 
 * @returns {Promise<Object>} Promesa que resuelve tras eliminar la relación.
 * @rejects {Object} Rechaza con error 404 si la asignación no existe.
 * @rejects {Object} Rechaza con error 500 si falla la consulta a la base de datos.
 */
exports.unlinkExerciseFromVideo = (params) => {

  const { id_ejercicio } = params;

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia del vínculo
    db.query(
      `SELECT id_ejercicio FROM demostracion WHERE id_ejercicio = ?`,
      [id_ejercicio],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar la asignación.",
            statusCode: 500,
          });
        }
        if (result.length === 0) {
          return reject({
            message: "Asignación Ejercicio-Vídeo no encontrada.",
            statusCode: 404,
          });
        }
        // 2. Borrado del registro intermedio
        db.query(
          `DELETE FROM demostracion WHERE id_ejercicio = ?`,
          [id_ejercicio],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message:
                  "Error al eliminar la asignación Ejercicio-Vídeo.",
                statusCode: 500,
              });
            }

            resolve({
              message: "Asignación Ejercicio-Vídeo eliminada correctamente.",
              statusCode: 200,
            });
          }
        );
      }
    );
  });
};