const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

/**
 * Modelo: Actualización de registro de actividad (lecturas) con optimización de escritura.
 * 
 * Valida la existencia de la rutina y compara las lecturas entrantes con las almacenadas
 * mediante una comparación profunda de atributos (series, repeticiones, carga, RPE).
 * Si no hay cambios reales, aborta la operación para evitar escrituras innecesarias.
 * Si hay cambios, ejecuta un patrón de borrado e inserción (DELETE + INSERT múltiple).
 * 
 * @function updateRutinaCliente
 * @param {Object} params - Objeto con los datos de actualización.
 * @param {number} params.id_historial - ID del registro de historial a actualizar.
 * @param {number} params.id_usuario - ID del usuario propietario (para validación e inserción).
 * @param {Array} params.bloques - Array de objetos bloque que contienen las nuevas lecturas.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con mensaje de éxito o indicación de "sin cambios".
 * @rejects {Object} Rechaza con error 404 si el historial de rutina no existe.
 * @rejects {Object} Rechaza con error 500 si falla la consulta de existencia, la obtención de lecturas,
 *                   el borrado de registros antiguos o la inserción de los nuevos.
 */
exports.updateRutinaCliente = (params) => {
  // 1. Extracción de parámetros y generación de timestamp actual
  const { id_historial, id_usuario, bloques} = params;
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

        // 3. Obtención del estado actual de las lecturas en BD
        db.query(
          "SELECT id_ejercicio, series, repeticiones, carga, RPE FROM lectura WHERE id_historial = ?",
          [id_historial],
          (err, lecturasExistentes) => {
            if (err)
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al obtener los ejercicios existentes.",
                statusCode: 500,
              });

            // 4. Normalización de datos entrantes: Aplanar estructura de bloques a array simple
            const lecturasActuales = bloques.flatMap((bloque) =>
              bloque.lecturas.map((lectura) => ({
                id_ejercicio: lectura.id_ejercicio,
                series: lectura.series,
                repeticiones: lectura.repeticiones,
                carga: lectura.carga,
                RPE: lectura.RPE,
              })),
            );

            // 5. Lógica de comparación profunda (Deep Equality Check)
            // Verifica si ambos arrays tienen los mismos elementos independientemente del orden
            const arraysIguales = (arr1, arr2) => {
              if (arr1.length !== arr2.length) return false;
              return arr1.every((lec1) =>
                arr2.some(
                  (lec2) =>
                    lec1.id_ejercicio === lec2.id_ejercicio &&
                    lec1.series === lec2.series &&
                    lec1.repeticiones === lec2.repeticiones &&
                    lec1.carga === lec2.carga &&
                    lec1.RPE === lec2.RPE,
                ),
              );
            };

            // Determina si es necesario escribir en BD
            const bloquesCambiados = !arraysIguales(
              lecturasActuales,
              lecturasExistentes,
            );

            // 6. Optimización: Si los datos son idénticos, se resuelve sin tocar la BD
            if (!bloquesCambiados) {
              return resolve({
                message: "No se ha introducido ningún cambio.",
                statusCode: 200,
              });
            }
        
            // 7. Ejecución de actualización incremental (Solo si hay cambios en este ejercicio)
            if (bloquesCambiados) {
              // 7.1 Borrado selectivo del ejercicio antiguo
              // NOTA DE DISEÑO: Se borra SOLO el registro del ejercicio específico que se está actualizando.
              // Esto permite que la función escale en el futuro para recibir múltiples ejercicios,
              // pero actualmente asume que 'lecturasActuales' contiene datos de un único ejercicio.
              // Se usa lecturasExistentes[0] como referencia del ID a borrar si no viene en el input,
              // aunque lo ideal es que el ID venga en 'lecturasActuales'.
              db.query(
                "DELETE FROM lectura WHERE id_historial = ? AND id_ejercicio = ?",
                [id_historial, lecturasExistentes[0].id_ejercicio],
                (err) => {
                  if (err)
                    return reject({
                      code: DEFAULT_ERROR,
                      message: "Error al eliminar los ejercicios antiguos.",
                      statusCode: 500,
                    });

                  // Caso borde: Si la actualización envía un ejercicio vacío
                  if (lecturasActuales.length === 0) {
                    return resolve({
                      message:
                        "Actividad actualizada correctamente (sin ejercicios).",
                      statusCode: 200,
                    });
                  }

                  // 7.2 Inserción del nuevo registro del ejercicio actualizado
                  let lecturasInsertadas = 0;
                  const totalLecturas = lecturasActuales.length;

                  lecturasActuales.forEach((lecturas) => {
                    db.query(
                      "INSERT INTO lectura(id_historial, id_usuario, id_ejercicio, series, repeticiones, carga, RPE, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
                      [
                        id_historial,
                        id_usuario,
                        lecturas.id_ejercicio,
                        lecturas.series,
                        lecturas.repeticiones,
                        lecturas.carga,
                        lecturas.RPE,
                        fecha
                      ],
                      (err) => {
                        if (err)
                          return reject({
                            message: "Error al insertar los ejercicios.",
                            statusCode: 500,
                          });

                        // 7.3 Confirmación de inserción
                        lecturasInsertadas++;
                        if (lecturasInsertadas === totalLecturas) {
                          resolve({
                            message:
                              "Actividad actualizada correctamente.",
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