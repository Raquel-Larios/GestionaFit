const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

/**
 * Modelo: Asignación de plantilla a usuario con replicación de datos (Admin).
 *
 * Crea una nueva instancia de rutina para un usuario clonando los datos de una plantilla base.
 * Verifica previamente que no exista una asignación activa idéntica para evitar duplicados.
 * Ejecuta una secuencia transaccional manual en tres fases:
 * 1. Inserción del registro maestro en 'historial_plantilla_usuario'.
 * 2. Clonado de ejercicios desde 'defecto' hacia 'variacion' (configuración inicial).
 * 3. Inicialización de registros en 'lectura' con valores neutros para comenzar el seguimiento.
 *
 * @function createRutinaAdmin
 * @param {Object} params - Objeto con los identificadores de usuario y plantilla.
 * @param {number} params.id_usuario - ID del usuario destinatario.
 * @param {number} params.id_plantilla - ID de la plantilla base a clonar.
 *
 * @returns {Promise<Object>} Promesa que resuelve con el ID del historial creado y mensaje de éxito.
 * @rejects {Object} Rechaza con error 400 si la plantilla ya está asignada activamente al usuario.
 * @rejects {Object} Rechaza con error 500 si falla la verificación, la inserción del historial,
 *                   la copia de ejercicios o la inicialización de lecturas.
 */
exports.createRutinaAdmin = (params) => {
  // 1. Extracción de parámetros y generación de timestamp actual (formato YYYY-MM-DD HH:MM:SS)
  const { id_usuario, id_plantilla } = params;
  const fecha = new Date().toISOString().slice(0, 19).replace("T", " ");

  return new Promise((resolve, reject) => {
    // 2. Verificación de duplicados: Asegura que no exista ya una asignación activa de esta plantilla al usuario
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
            message: "Esta plantilla ya ha sido asignada al usuario.",
            statusCode: 400,
          });
        }

        // 3. Inserción en Historial: Crea el registro maestro de la asignación
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

            // Captura el ID autoincremental generado para vincular las tablas hijas
            const id_historial = result.insertId;

            // 4. Clonado de Ejercicios (Defecto -> Variacion):
            // Utiliza 'INSERT INTO ... SELECT' para replicar masivamente los ejercicios de la plantilla.
            // Se inyectan las claves foráneas del nuevo historial (id_historial, id_usuario) en cada fila copiada.
            db.query(
              `INSERT INTO variacion (id_historial, id_plantilla, id_usuario, id_ejercicio, series, repeticiones, carga, RPE, fecha)
              SELECT ? as id_historial, ? as id_plantilla, ? as id_usuario, d.id_ejercicio, d.series, d.repeticiones, d.carga, d.RPE, ? as fecha
              FROM defecto d
              WHERE d.id_plantilla = ?;`,
              [id_historial, id_plantilla, id_usuario, fecha, id_plantilla],
              (err, results) => {
                if (err)
                  return reject({
                    message:
                      "Error al copiar los ejercicios de la plantilla a la rutina.",
                    statusCode: 500,
                  });

                /// 5. Inicialización de Lecturas (Defecto -> Lectura):
                // Crea registros paralelos en la tabla de seguimiento con valores neutros (0 series, 0 reps, RPE=1).
                // Esto garantiza que exista un espacio de registro para cada ejercicio desde el primer momento.
                db.query(
                  `INSERT INTO lectura (id_historial, id_plantilla, id_usuario, id_ejercicio, series, repeticiones, carga, RPE, fecha)
                SELECT ? as id_historial, ? as id_plantilla, ? as id_usuario, d.id_ejercicio, 0, 0, 0, 1, ? as fecha
                FROM defecto d
                WHERE d.id_plantilla = ?;`,
                  [id_historial, id_plantilla, id_usuario, fecha, id_plantilla],
                  (err, results) => {
                    if (err)
                      return reject({
                        message:
                          "Error al crear las lecturas con valor inicial de la rutina del cliente.",
                        statusCode: 500,
                      });

                    resolve({
                      data: { id_historial },
                      message: "Rutina asignada correctamente.",
                      statusCode: 200,
                    });
                  },
                );
              },
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
 * escrituras innecesarias.
 *
 * Si hay cambios, ejecuta una estrategia de "Pizarra Limpia" (Clean Slate): elimina TODAS las
 * variaciones existentes asociadas a ese historial e inserta de nuevo el conjunto completo
 * de ejercicios recibidos. Esto sincroniza la tabla de variaciones exactamente con el estado
 * deseado, simplificando la lógica de actualización frente a modificaciones parciales. Además, 
 * desasigna las lecturas que han quedado huérfanas de variación e inserta su correspondiente fila
 * con datos por defecto en la tabla lectura cuando se añade una variación nueva o se modifica una existente.
 *
 * @function updateRutinaAdmin
 * @param {Object} params - Objeto con los datos de actualización.
 * @param {number} params.id_historial - ID del registro de historial a actualizar.
 * @param {Array} params.bloques - Array de objetos bloque que contienen las nuevas variaciones.
 *
 * @returns {Promise<Object>} Promesa que resuelve con mensaje de éxito o indicación de "sin cambios".
 * @rejects {Object} Rechaza con error 404 si el historial de rutina no existe.
 * @rejects {Object} Rechaza con error 500 si falla la consulta de existencia, la obtención de variaciones,
 *                   el borrado de ejercicios antiguos o la inserción de los nuevos.
 */
exports.updateRutinaAdmin = (params) => {
  // 1. Extracción de parámetros y generación de timestamp actual (formato YYYY-MM-DD HH:MM:SS)
  const { id_historial, bloques } = params;
  const fecha = new Date().toISOString().slice(0, 19).replace("T", " ");

  return new Promise((resolve, reject) => {
    // 2. Verificación de existencia del registro de historial y obtención de contexto (usuario, plantilla)
    db.query(
      `SELECT id, id_plantilla, id_usuario FROM historial_plantilla_usuario WHERE id = ?`,
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

        id_plantilla = result[0].id_plantilla;
        id_usuario = result[0].id_usuario;

        // 3. Obtención del estado actual de TODAS las variaciones en BD para comparar
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

            // 4. Normalización de datos entrantes: Aplanar estructura de bloques a array simple de variaciones
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

            // 6. Optimización de escritura: Si los datos son idénticos, se resuelve sin tocar la BD
            if (!bloquesCambiados) {
              return resolve({
                message: "No se ha introducido ningún cambio.",
                statusCode: 200,
              });
            }

            // Identificadores de ejercicios
            const idsEjActuales = variacionesActuales.map(
              (variacion) => variacion.id_ejercicio,
            );
            const idsEjAnteriores = variacionesExistentes.map(
              (variacion) => variacion.id_ejercicio,
            );

            // Ejercicios eliminados: existían antes pero ya no están
            const idsEjEliminados = idsEjAnteriores.filter(
              (id) => !idsEjActuales.includes(id),
            );

            // Ejercicios nuevos o modificados: requieren lectura inicial nueva
            const requiereNuevaLectura = variacionesActuales.filter(
              (variacionActual) => {
                const existente = variacionesExistentes.find(
                  (variacionAnt) =>
                    variacionAnt.id_ejercicio === variacionActual.id_ejercicio,
                );
                if (!existente) return true; // Nuevo
                return !(
                  variacionActual.series === existente.series &&
                  variacionActual.repeticiones === existente.repeticiones &&
                  variacionActual.carga === existente.carga &&
                  variacionActual.RPE === existente.RPE
                );
              },
            );

            // 7. Ejecución de actualización (Solo si hay cambios detectados)
            if (bloquesCambiados) {
              // 7.1: Clean Slate de variaciones.

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

                  // 7.2: Desasignar lecturas huérfanas

                  let necesitaDesasignar = idsEjEliminados.length > 0;
                  if (necesitaDesasignar) {
                    const placeholders = idsEjEliminados
                      .map(() => "?")
                      .join(",");
                    const queryEliminados = `UPDATE lectura SET  id_historial = NULL WHERE id_historial = ? AND id_ejercicio IN (${placeholders})`;
                    db.query(
                      queryEliminados,
                      [id_historial, ...idsEjEliminados],
                      (err) => {
                        if (err)
                          return reject({
                            code: DEFAULT_ERROR,
                            message:
                              "Error al desasignar las lecturas sin variacion.",
                            statusCode: 500,
                          });
                        necesitaDesasignar = false;
                      },
                    );
                  }

                  // Caso borde: Si la nueva rutina viene vacía tras el borrado
                  if (variacionesActuales.length === 0) {
                    return resolve({
                      message:
                        "Rutina actualizada correctamente (sin ejercicios).",
                      statusCode: 200,
                    });
                  }

                  //7.3: Insertar nuevas variaciones (se ejecuta siempre, espere o no al UPDATE)
                  let variacionesInsertadas = 0;
                  const totalVariaciones = variacionesActuales.length;

                  variacionesActuales.forEach((variaciones) => {
                    db.query(
                      "INSERT INTO variacion (id_historial, id_plantilla, id_usuario, id_ejercicio, series, repeticiones, carga, RPE, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                      [
                        id_historial,
                        id_plantilla,
                        id_usuario,
                        variaciones.id_ejercicio,
                        variaciones.series,
                        variaciones.repeticiones,
                        variaciones.carga,
                        variaciones.RPE,
                        fecha,
                      ],
                      (err) => {
                        if (err)
                          return reject({
                            message: "Error al insertar los ejercicios.",
                            statusCode: 500,
                          });

                        variacionesInsertadas++;

                        if (variacionesInsertadas === totalVariaciones) {
                          // 7.4: Insertar lectura inicial solo para los nuevos/modificados

                          if (requiereNuevaLectura.length === 0) {
                            return resolve({
                              message: "Rutina actualizada correctamente.",
                              statusCode: 200,
                            });
                          }

                          let lecturasInsertadas = 0;
                          requiereNuevaLectura.forEach((variacion) => {
                            db.query(
                              "INSERT INTO lectura (id_historial, id_plantilla, id_usuario, id_ejercicio, series, repeticiones, carga, RPE, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                              [
                                id_historial,
                                id_plantilla,
                                id_usuario,
                                variacion.id_ejercicio,
                                0,
                                0,
                                0,
                                1,
                                fecha,
                              ],
                              (err) => {
                                if (err)
                                  return reject({
                                    code: DEFAULT_ERROR,
                                    message:
                                      "Error al insertar las lecturas iniciales.",
                                    statusCode: 500,
                                  });

                                lecturasInsertadas++;

                                // 7.3 Control de finalización: Se resuelve cuando todas las inserciones han terminado
                                if (
                                  lecturasInsertadas ===
                                  requiereNuevaLectura.length
                                ) {
                                  resolve({
                                    message:
                                      "Rutina y ejercicios actualizados correctamente.",
                                    statusCode: 200,
                                  });
                                }
                              },
                            );
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
 * Modelo: Desvinculación de rutina asignada (Borrado de vista activa).
 *
 * Verifica la existencia del registro de historial antes de proceder.
 * Implementa un comportamiento idempotente: si el registro no existe, retorna un estado 404 sin error.
 * Si existe, elimina el registro de la tabla 'historial_plantilla_usuario'.
 *
 * Nota: Gracias a la configuración 'ON DELETE SET NULL' en las claves foráneas de las tablas hijas
 * ('variacion', 'lectura'), esta eliminación no borra los datos de ejecución, sino que preserva el
 * histórico al nulificar su referencia al padre (id_historial = NULL).
 *
 * @function unlinkRutinaAdmin
 * @param {Object} params - Objeto con el identificador de la rutina.
 * @param {number} params.id_historial - ID del registro de historial a eliminar.
 *
 * @returns {Promise<Object>} Promesa que resuelve con mensaje de éxito (200) o de "no encontrado" (404).
 * @rejects {Object} Rechaza con error 500 si falla la consulta de verificación o la eliminación.
 */
exports.unlinkRutinaAdmin = (params) => {
  // 1. Extracción del ID de historial
  const { id_historial } = params;

  return new Promise((resolve, reject) => {
    // 2. Verificación de existencia del registro de asignación
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
        // 3. Comportamiento Idempotente: Si no existe, se retorna 404 sin considerar error de servidor
        if (result.length === 0) {
          return resolve({
            message: "Rutina no encontrada.",
            statusCode: 404,
          });
        }

        // 4. Eliminación del registro de asignación (Vista Activa).
        // Las tablas hijas ('variacion', 'lectura') conservan sus datos gracias a 'ON DELETE SET NULL',
        // quedando sus campos 'id_historial' como NULL para preservar el histórico de ejecución.
        db.query(
          `
          DELETE FROM historial_plantilla_usuario WHERE id = ?;`,
          [id_historial],
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
};
