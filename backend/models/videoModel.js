const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

/**
 * Modelo: Creación de video demostrativo con validación estricta de unicidad.
 * 
 * Normaliza el nombre a minúsculas y verifica secuencialmente que no exista otro video
 * con el mismo nombre ni con el mismo enlace. Solo procede a la inserción si ambas
 * validaciones son exitosas.
 * 
 * @function createVideo
 * @param {Object} params - Objeto con los datos del video.
 * @param {string} params.nombre_video - Nombre descriptivo del video.
 * @param {string} params.enlace_video - URL del video.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el resultado de la inserción.
 * @rejects {Object} Rechaza con error 400 si el nombre o el enlace ya existen.
 * @rejects {Object} Rechaza con error 400/500 si falla la inserción en la base de datos.
 */
exports.createVideo = (params) => {

  const { nombre_video, enlace_video } = params;
  const nombreMinusculas = String(nombre_video).toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. Validación de unicidad del nombre
    db.query(
      `SELECT nombre_video FROM video WHERE nombre_video = ?`,
      [nombreMinusculas],
      (err, result) => {
        if (result.length > 0) {
          return reject({
            message:
              "Ya hay una demostración con este nombre, por favor escoja uno distinto.",
            statusCode: 400,
          });
        } else if (result.length === 0) {
          // 2. Validación de unicidad del enlace (Solo si el nombre está libre)
          db.query(
            `SELECT enlace_video FROM video WHERE enlace_video = ?`,
            [enlace_video],
            (err, result) => {
              if (result.length > 0) {
                return reject({
                  message: "Ya hay una demostración con este enlace.",
                  statusCode: 400,
                });
              } else {
                // 3. Inserción del nuevo registro
                db.query(
                  `INSERT INTO video (nombre_video, enlace_video) VALUE (?, ?)`,
                  [nombreMinusculas, enlace_video],
                  (err, result) => {
                    if (err) {
                      return reject({
                        data: err,
                        code: DEFAULT_ERROR,
                        message: "Error al crear la demostración.",
                        statusCode: 400,
                      });
                    } else {
                      resolve({
                        data: result,
                        message: "Demostración creada correctamente.",
                        statusCode: 200,
                      });
                    }
                  },
                );
              }
            },
          );
        }
      },
    );
  });
};

/**
 * Modelo: Actualización de video con optimización de escritura y validación de duplicados.
 * 
 * Verifica la existencia del video y compara los datos entrantes con los actuales.
 * Valida que el nuevo nombre y enlace no colisionen con otros registros (excluyendo el ID actual).
 * Si no hay cambios reales, resuelve inmediatamente sin escribir.
 * Construye dinámicamente la sentencia UPDATE modificando solo los campos alterados.
 * 
 * @function updateVideo
 * @param {Object} params - Objeto con los datos actualizados.
 * @param {number} params.id_video - ID del video a actualizar.
 * @param {string} params.nombre_video - Nuevo nombre del video.
 * @param {string} params.enlace_video - Nuevo enlace del video.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el resultado de la actualización.
 * @rejects {Object} Rechaza con error 404 si el video no existe.
 * @rejects {Object} Rechaza con error 400 si el nuevo nombre o enlace ya existen en otros registros.
 * @rejects {Object} Rechaza con error 500 si falla la consulta o la actualización.
 */
exports.updateVideo = (params) => {
  const { nombre_video, enlace_video, id_video } = params;
  const nombreMinusculas = String(nombre_video).toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. Obtención de datos actuales
    db.query(
      `SELECT id, nombre_video, enlace_video FROM video WHERE id = ?`,
      [id_video],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar la demostración.",
            statusCode: 500,
          });
        }

        if (result.length === 0) {
          return reject({
            message: "Demostración no encontrada.",
            statusCode: 404,
          });
        }

        const videoSelect = result[0];

        // 2. Validación de unicidad del nombre (excluyendo el ID actual)
        db.query(
          `SELECT id FROM video WHERE nombre_video = ? AND id !=?;`,
          [nombreMinusculas, id_video],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al validar la demostración.",
                statusCode: 500,
              });
            }

            if (result.length > 0) {
              return reject({
                message:
                  "Ya hay una demostración con este nombre, por favor escoja uno distinto.",
                statusCode: 400,
              });
            }

            // 3. Validación de unicidad del enlace (excluyendo el ID actual)
            db.query(
              `SELECT id FROM video WHERE enlace_video = ? AND id !=?`,
              [enlace_video, id_video],
              (err, result) => {
                if (err) {
                  return reject({
                    code: DEFAULT_ERROR,
                    message: "Error al validar la demostración.",
                    statusCode: 500,
                  });
                }

                if (result.length > 0) {
                  return reject({
                    message: "Ya hay una demostración con este enlace.",
                    statusCode: 400,
                  });
                }

                // 4. Optimización: Si los datos son idénticos, abortar escritura
                if (
                  nombreMinusculas === videoSelect.nombre_video &&
                  enlace_video === videoSelect.enlace_video
                ) {
                  return resolve({
                    message: "No se ha introducido ningún cambio.",
                    statusCode: 200,
                  });
                }

                // 5. Construcción dinámica de la consulta UPDATE
                const fields = [];
                const values = [];

                if (nombreMinusculas !== videoSelect.nombre_video) {
                  fields.push("nombre_video = ?");
                  values.push(nombreMinusculas);
                }
                if (enlace_video !== videoSelect.enlace_video) {
                  fields.push("enlace_video = ?");
                  values.push(enlace_video);
                }

                values.push(id_video);
                const query = `UPDATE video SET ${fields.join(", ")} WHERE id = ?`;

                // 6. Ejecución de la actualización
                db.query(query, values, (err, result) => {
                  if (err) {
                    return reject({
                      code: DEFAULT_ERROR,
                      message:
                        "Error al actualizar la demostración, inténtelo otra vez.",
                      statusCode: 500,
                    });
                  }

                  resolve({
                    data: result,
                    message: "Demostración actualizada correctamente.",
                    statusCode: 200,
                  });
                });
              },
            );
          },
        );
      },
    );
  });
};

/**
 * Modelo: Eliminación de video con limpieza de asignaciones en cascada manual.
 * 
 * Verifica la existencia del video y ejecuta una secuencia de borrado: primero elimina
 * los registros de la tabla intermedia 'demostracion' (asignaciones a ejercicios) y luego
 * el registro principal en 'video'. Requiere `multipleStatements: true` en la conexión MySQL.
 * 
 * @function deleteVideo
 * @param {Object} params - Objeto con el ID del video.
 * @param {number} params.id_video - ID del video a eliminar.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con mensaje de éxito.
 * @rejects {Object} Rechaza con error 404 si el video no existe.
 * @rejects {Object} Rechaza con error 500 si falla la consulta de verificación o eliminación.
 */
exports.deleteVideo = (params) => {
  const { id_video } = params;

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia
    db.query(`SELECT id FROM video WHERE id = ?`, [id_video], (err, result) => {
      if (err) {
        return reject({
          code: DEFAULT_ERROR,
          message: "Error al buscar la demostración.",
          statusCode: 500,
        });
      }
      if (result.length === 0) {
        return reject({
          message: "Demostración no encontrada.",
          statusCode: 404,
        });
      }

      // 2. Eliminación en Cascada Manual (Requiere multipleStatements: true)
      // Primero borra las asignaciones (hijos) y luego el video (padre)
      db.query(
        `DELETE FROM demostracion WHERE id_video = ?;
        DELETE FROM video WHERE id = ?;`,
        [id_video, id_video],
        (err, result) => {
          if (err) {
            return reject({
              code: DEFAULT_ERROR,
              message: "Error al eliminar la demostración.",
              statusCode: 500,
            });
          }
          resolve({
            message: "Demostración eliminada correctamente.",
            statusCode: 200,
          });
        },
      );
    });
  });
};

/**
 * Modelo: Asignación de video a ejercicio (Relación 1:1) con opción de reemplazo.
 * 
 * Verifica si el video ya está asignado a algún ejercicio.
 * - Si está asignado y 'forceReplace' es falso, rechaza con error 409 (Conflict) y sugiere al usuario.
 * - Si está asignado y 'forceReplace' es verdadero, elimina la asignación anterior antes de proceder.
 * - Si no está asignado, inserta la nueva relación directamente.
 * 
 * @function linkVideoToExercise
 * @param {Object} params - Objeto con IDs y flag de fuerza.
 * @param {number} params.id_video - ID del video a asignar.
 * @param {number} params.id_ejercicio - ID del ejercicio destino.
 * @param {boolean} params.forceReplace - Si es true, permite sobrescribir una asignación existente.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con la nueva asignación.
 * @rejects {Object} Rechaza con error 409 si el video ya tiene dueño y no se fuerza el reemplazo.
 * @rejects {Object} Rechaza con error 500 si falla la consulta.
 */
exports.linkVideoToExercise = (params) => {

  const { id_video, id_ejercicio, forceReplace } = params;

  return new Promise((resolve, reject) => {
    // 1. Comprobación de asignación existente
    db.query(
      `SELECT demostracion.id_ejercicio, ejercicio.nombre_ejercicio FROM demostracion INNER JOIN ejercicio ON demostracion.id_ejercicio = ejercicio.id WHERE id_video = ?`,
      [id_video],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar la asignación.",
            statusCode: 500,
          });
        }
        if (result.length > 0) {
          // 2. Manejo de conflicto
          if (!forceReplace) {
            const ejercicio_asignado = result[0].nombre_ejercicio;
            // Estilizado del nombre para el mensaje de error amigable
            const ejercicio_asignado_estilizado =
              String(ejercicio_asignado).charAt(0).toUpperCase() +
              String(ejercicio_asignado).slice(1).toLowerCase();
            return reject({
              message:
                'Este vídeo ya está asignado al ejercicio "' +
                ejercicio_asignado_estilizado +
                '". ¿Desea reemplazarlo?',
              statusCode: 409, // Conflict
            });
          } else {
            // 3. Reemplazo: Eliminar asignación anterior (Clean Slate)
            db.query(
              `DELETE FROM demostracion WHERE id_video = ?`,
              [id_video],
              (err, result) => {
                if (err) {
                  return reject({
                    code: DEFAULT_ERROR,
                    message: "Error al asignar el ejercicio al vídeo.",
                    statusCode: 500,
                  });
                }
              },
            );
          }
        }

        // 4. Inserción de la nueva relación
        db.query(
          `INSERT INTO demostracion (id_ejercicio, id_video) VALUES (?, ?)`,
          [id_ejercicio, id_video],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al asignar el ejercicio al vídeo.",
                statusCode: 500,
              });
            }

            resolve({
              data: result,
              message: "Ejercicio asignado al vídeo correctamente.",
              statusCode: 200,
            });
          },
        );
      },
    );
  });
};

/**
 * Modelo: Eliminación de asignación video-ejercicio.
 * 
 * Verifica que exista la asignación para el video dado y la elimina de la tabla 'demostracion'.
 * No elimina el video, solo el vínculo.
 * 
 * @function unlinkVideoFromExercise
 * @param {Object} params - Objeto con el ID del video.
 * @param {number} params.id_video - ID del video a desvincular.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con mensaje de éxito.
 * @rejects {Object} Rechaza con error 404 si no existe tal asignación.
 * @rejects {Object} Rechaza con error 500 si falla la consulta.
 */
exports.unlinkVideoFromExercise = (params) => {

  const { id_video } = params;

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia de la asignación
    db.query(
      `SELECT id_video FROM demostracion WHERE id_video = ?`,
      [id_video],
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
            message: "Asignación Vídeo-Ejercicio no encontrada.",
            statusCode: 404,
          });
        }

        // 2. Eliminación del vínculo
        db.query(
          `DELETE FROM demostracion WHERE id_video = ?`,
          [id_video],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al eliminar la asignación Vídeo-Ejercicio.",
                statusCode: 500,
              });
            }

            resolve({
              message: "Asignación Vídeo-Ejercicio eliminada correctamente.",
              statusCode: 200,
            });
          },
        );
      },
    );
  });
};

/**
 * Modelo: Obtención de todas las asignaciones video-ejercicio.
 * 
 * Realiza un JOIN entre las tablas 'demostracion', 'ejercicio' y 'video' para obtener
 * un listado completo de qué video está asignado a qué ejercicio.
 * 
 * @function getLinksVideo_Exercise
 * @returns {Promise<Object>} Promesa que resuelve con un array de asignaciones.
 * @rejects {Object} Rechaza con error 500 si falla la consulta de unión (JOIN).
 */
exports.getLinksVideo_Exercise = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT demostracion.id_ejercicio, ejercicio.nombre_ejercicio, demostracion.id_video, video.nombre_video FROM demostracion INNER JOIN ejercicio ON demostracion.id_ejercicio = ejercicio.id INNER JOIN video ON demostracion.id_video = video.id",
      (err, results) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message:
              "No se han podido recuperar las asignaciones Vídeo-Ejercicio/Ejercicio-Vídeo.",
            statusCode: 500,
          });
        }
        resolve({
          data: results,
          statusCode: 200,
        });
      },
    );
  });
};
