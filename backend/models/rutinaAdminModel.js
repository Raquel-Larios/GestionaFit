const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");


/**
 * Modelo: Asignación de plantilla a usuario con replicación de datos (Admin).
 * 
 * Crea una nueva rutina para un usuario clonando los datos de una plantilla base.
 * Verifica que la asignación no exista previamente para evitar duplicados.
 * Ejecuta una secuencia transaccional manual: inserta el registro en el historial,
 * copia los ejercicios por defecto a la tabla de variaciones e inicializa la tabla
 * de lecturas con valores cero.
 * 
 * @function createRutinaAdmin
 * @param {Object} params - Objeto con los identificadores de usuario y plantilla.
 * @param {number} params.id_usuario - ID del usuario destinatario.
 * @param {number} params.id_plantilla - ID de la plantilla base a clonar.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el ID del historial creado y mensaje de éxito.
 * @rejects {Object} Rechaza con error 500 si falla la consulta de verificación o inserción.
 * @rejects {Object} Rechaza con error 400 si la plantilla ya está asignada al usuario.
 * @rejects {Object} Rechaza con error 500 si falla la copia de ejercicios o la inicialización de lecturas.
 */
exports.createRutinaAdmin = (params) => {
  // 1. Extracción de parámetros y generación de timestamp actual
  const { id_usuario, id_plantilla} = params;
  const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

  return new Promise((resolve, reject) => {
    // 2. Verificación de duplicados: Evita asignar la misma plantilla dos veces
    db.query(
      `SELECT id FROM historial_plantilla_usuario WHERE id_usuario = ? AND id_plantilla = ?`,
      [id_usuario, id_plantilla],
      (err, result) => {
        if (err)
          return reject({
            code: DEFAULT_ERROR,
            message:
              "Error al comprobar si ya se ha asignado esa plantilla al usuario.",
            statusCode: 500,
          });
        if (result.length > 0) {
          return reject({
            message:
              "Esta plantilla ya ha sido asignada al usuario.",
            statusCode: 400,
          });
        }

        // 3. Inserción en Historial: Crea el registro principal de la rutina
        db.query(
          `INSERT INTO historial_plantilla_usuario (id_plantilla, id_usuario, fecha) VALUES (?, ?, ?)`,
          [id_plantilla, id_usuario, fecha],
          (err, result) => {
            if (err)
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al crear la asignación Plantilla-Cliente.",
                statusCode: 500,
              });

            // Captura el ID autoincremental generado para usarlo en las tablas hijas
            const id_historial = result.insertId;

            // 4. Clonado de Ejercicios: Copia de la tabla 'defecto' a 'variacion'
            // Utiliza INSERT INTO ... SELECT para replicar la estructura de la plantilla
            db.query(
              `INSERT INTO variacion (id_historial, id_ejercicio, series, repeticiones, carga, RPE, fecha)
              SELECT ?, d.id_ejercicio, d.series, d.repeticiones, d.carga, d.RPE, ?
              FROM defecto d
              WHERE d.id_plantilla = ?;`,
              [id_historial, fecha, id_plantilla],
              (err, results) => {
                if (err) return reject({
                  message: "Error al copiar los ejercicios de la plantilla a la rutina.",
                  statusCode: 500,
                });

                // 5. Inicialización de Lecturas: Crea registros base con valores 0 para seguimiento
                // Prepara la tabla de progreso para que el usuario comience a registrar sus series
                db.query(
                `INSERT INTO lectura (id_historial, id_usuario, id_ejercicio, series, repeticiones, carga, RPE, fecha)
                SELECT ?, ?, d.id_ejercicio, 0, 0, 0, 1, ?
                FROM defecto d
                WHERE d.id_plantilla = ?;`,
                [id_historial, id_usuario, fecha, id_plantilla],
                (err, results) => {
                  if (err) return reject({
                    message: "Error al crear las lecturas con valor inicial de la rutina del cliente.",
                    statusCode: 500,
                  });

                resolve({
                  data: { id_historial },
                  message: "Rutina asignada correctamente.",
                  statusCode: 200,
                });
              });
              }
            );
          },
        );
      },
    );
  });
};

/**
 * Modelo: Actualización de rutina asignada con optimización de escritura y validación de cambios.
 * 
 * Verifica la existencia del historial de rutina y compara el estado actual de las variaciones
 * con los nuevos bloques entrantes mediante una comparación profunda. Si no hay diferencias
 * reales en los datos (series, repeticiones, carga, RPE), aborta la operación para evitar
 * escrituras innecesarias. Si hay cambios, ejecuta una operación de borrado e inserción
 * (DELETE + INSERT múltiple) para sincronizar la tabla de variaciones.
 * 
 * @function updateRutinaAdmin
 * @param {Object} params - Objeto con los datos de actualización.
 * @param {number} params.id_historial - ID del registro de historial a actualizar.
 * @param {Array} params.bloques - Array de objetos bloque que contienen las nuevas variaciones.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con mensaje de éxito o indicación de "sin cambios".
 * @rejects {Object} Rechaza con error 404 si el historial de rutina no existe.
 * @rejects {Object} Rechaza con error 500 si falla la consulta de existencia, la obtención de variaciones,
 *                   el borrado de antiguos ejercicios o la inserción de los nuevos.
 */
exports.updateRutinaAdmin = (params) => {
  // 1. Extracción de parámetros y generación de timestamp
  const { id_historial, bloques} = params;
  const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');


  return new Promise((resolve, reject) => {
    // 2. Verificación de existencia del registro de historial
    db.query(
      `SELECT id FROM historial_plantilla_usuario WHERE id = ?`,
      [id_historial],
      (err, result) => {
        if (err)
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar la rutina.",
            statusCode: 500,
          });
        if (result.length === 0) {
          return reject({
            message: "Rutina no encontrada.",
            statusCode: 404,
          });
        }

        /// 3. Obtención del estado actual de las variaciones en BD
        db.query(
          "SELECT id_ejercicio, series, repeticiones, carga, RPE FROM variacion WHERE id_historial = ?",
          [id_historial],
          (err, variacionesExistentes) => {
            if (err)
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al obtener los ejercicios existentes.",
                statusCode: 500,
              });

            // 4. Normalización de datos entrantes: Aplanar estructura de bloques a array simple
            const variacionesActuales = bloques.flatMap((bloque) =>
              bloque.variaciones.map((variacion) => ({
                id_ejercicio: variacion.id_ejercicio,
                series: variacion.series,
                repeticiones: variacion.repeticiones,
                carga: variacion.carga,
                RPE: variacion.RPE,
              })),
            );

            // 5. Lógica de comparación profunda (Deep Equality Check)
            // Verifica si ambos arrays tienen los mismos elementos independientemente del orden
            const arraysIguales = (arr1, arr2) => {
              if (arr1.length !== arr2.length) return false;
              return arr1.every((var1) =>
                arr2.some(
                  (var2) =>
                    var1.id_ejercicio === var2.id_ejercicio &&
                    var1.series === var2.series &&
                    var1.repeticiones === var2.repeticiones &&
                    var1.carga === var2.carga &&
                    var1.RPE === var2.RPE,
                ),
              );
            };

            // Determina si es necesario escribir en BD
            const bloquesCambiados = !arraysIguales(
              variacionesActuales,
              variacionesExistentes,
            );

            // 6. Optimización: Si los datos son idénticos, se resuelve sin tocar la BD
            if (!bloquesCambiados) {
              return resolve({
                message: "No se ha introducido ningún cambio.",
                statusCode: 200,
              });
            }
        
            // 7. Ejecución de actualización (Solo si hay cambios)
            if (bloquesCambiados) {
              // 7.1 Borrado de variaciones anteriores (Clean Slate)
              db.query(
                "DELETE FROM variacion WHERE id_historial = ?",
                [id_historial],
                (err) => {
                  if (err)
                    return reject({
                      code: DEFAULT_ERROR,
                      message: "Error al eliminar los ejercicios antiguos.",
                      statusCode: 500,
                    });

                  // Caso borde: Si la nueva rutina viene vacía
                  if (variacionesActuales.length === 0) {
                    return resolve({
                      message:
                        "Rutina actualizada correctamente (sin ejercicios).",
                      statusCode: 200,
                    });
                  }

                  // 7.2 Inserción múltiple de nuevas variaciones
                  let variacionesInsertadas = 0;
                  const totalVariaciones = variacionesActuales.length;

                  variacionesActuales.forEach((variaciones) => {
                    db.query(
                      "INSERT INTO variacion (id_historial, id_ejercicio, series, repeticiones, carga, RPE, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)",
                      [
                        id_historial,
                        variaciones.id_ejercicio,
                        variaciones.series,
                        variaciones.repeticiones,
                        variaciones.carga,
                        variaciones.RPE,
                        fecha
                      ],
                      (err) => {
                        if (err)
                          return reject({
                            message: "Error al insertar los ejercicios.",
                            statusCode: 500,
                          });

                        // 7.3 Control de finalización de inserciones paralelas
                        variacionesInsertadas++;
                        if (variacionesInsertadas === totalVariaciones) {
                          resolve({
                            message:
                              "Rutina y ejercicios actualizados correctamente.",
                            statusCode: 200,
                          });
                        }
                      },
                    );
                  });
                },
              );
            }
          },
        );
      },
    );
  });
};

/**
 * Modelo: Eliminación de rutina asignada con limpieza en cascada manual.
 * 
 * Verifica la existencia del registro de historial antes de proceder. Ejecuta
 * una secuencia de tres eliminaciones (variaciones, lecturas e historial) en
 * una única llamada a la base de datos mediante sentencias múltiples.
 * Nota: Esta operación requiere que la conexión MySQL tenga habilitada
 * la opción `multipleStatements: true`. Si no existe el registro, resuelve
 * exitosamente con un mensaje 404.
 * 
 * @function deleteRutinaAdmin
 * @param {Object} params - Objeto con el identificador de la rutina.
 * @param {number} params.id_historial - ID del registro de historial a eliminar.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con mensaje de éxito o indicación de "no encontrado".
 * @rejects {Object} Rechaza con error 500 si falla la consulta de verificación o la eliminación en cascada.
 */
exports.deleteRutinaAdmin = (params) => {
  // 1. Extracción del ID de historial
  const { id_historial } = params;
  
   return new Promise((resolve, reject) => {
    // 2. Verificación de existencia del registro
    db.query(
      `SELECT id FROM historial_plantilla_usuario WHERE id = ?`,
      [id_historial],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar la rutina.",
            statusCode: 500,
          });
        }
        // 3. Comportamiento Idempotente: Si no existe, se considera "éxito" sin hacer nada
        if (result.length === 0) {
          return resolve({
            message: "Rutina no encontrada.",
            statusCode: 404,
          });
        }

        // 4. Eliminación en Cascada Manual (Requiere multipleStatements: true)
        // Ejecuta 3 DELETEs en una sola consulta separados por punto y coma
        db.query(`
          DELETE FROM variacion WHERE id_historial = ?;
          DELETE FROM lectura WHERE id_historial = ?;
          DELETE FROM historial_plantilla_usuario WHERE id = ?;`,
          [id_historial, id_historial, id_historial],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al desasignar la rutina.",
                statusCode: 500,
              });
            }
            return resolve({
              message: "Rutina desasignada correctamente.",
              statusCode: 200,
            });
          },
        );
      },
    );
  });
}