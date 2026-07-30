const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

/**
 * Modelo: Actualización incremental de lecturas de ejercicios con optimización de escritura.
 * 
 * Valida la existencia de la rutina y recupera exclusivamente las lecturas almacenadas 
 * correspondientes a los ejercicios enviados en la petición. Compara los datos entrantes 
 * con los existentes mediante una verificación profunda de atributos (series, repeticiones, 
 * carga, RPE). 
 * 
 * Si no se detectan cambios reales en los ejercicios enviados, aborta la operación para 
 * evitar escrituras innecesarias. Si hay cambios, ejecuta un patrón de borrado e inserción 
 * (DELETE + INSERT) afectando ÚNICAMENTE a los ejercicios modificados, preservando así 
 * el resto de lecturas de la rutina que no han sido enviadas en la petición.
 * 
 * @function updateRutinaCliente
 * @param {Object} params - Objeto con los datos de actualización.
 * @param {number} params.id_historial - ID del registro de historial a actualizar.
 * @param {number} params.id_usuario - ID del usuario propietario (para validación e inserción).
 * @param {Array} params.bloques - Array de objetos bloque que contienen las lecturas de los ejercicios a actualizar.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con mensaje de éxito o indicación de "sin cambios".
 * @rejects {Object} Rechaza con error 404 si el historial de rutina no existe.
 * @rejects {Object} Rechaza con error 500 si falla la consulta de existencia, la obtención de lecturas,
 *                   el borrado de registros específicos o la inserción de los nuevos.
 */
exports.updateRutinaCliente = (params) => {
  const { id_historial, id_usuario, bloques } = params;
  const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia del historial de rutina
    db.query(
      `SELECT id, id_plantilla FROM historial_plantilla_usuario WHERE id = ?`,
      [id_historial],
      (err, result) => {
        if (err) return reject({ code: DEFAULT_ERROR, message: "Error al buscar la rutina.", statusCode: 500 });
        if (result.length === 0) return reject({ message: "Rutina no encontrada.", statusCode: 404 });

        const id_plantilla = result[0].id_plantilla;

        // 2. Obtención filtrada: Recupera de la BD solo las lecturas de los ejercicios que se están enviando en la petición.
        // Esto optimiza la comparación y evita traer datos innecesarios de toda la rutina.

        const ejerciciosAActualizar = bloques.flatMap((bloque) =>
          bloque.lecturas.map((l) => l.id_ejercicio)
        );
        
        const placeholders = ejerciciosAActualizar.map(() => '?').join(',');
        db.query(
          `SELECT id_ejercicio, series, repeticiones, carga, RPE FROM lectura WHERE id_historial = ? AND id_ejercicio IN (${placeholders})`,
          [id_historial, ...ejerciciosAActualizar],
          (err, lecturasExistentes) => {
            if (err) return reject({ code: DEFAULT_ERROR, message: "Error al obtener los ejercicios existentes.", statusCode: 500 });

            // 3. Normalización de datos entrantes: Aplanar la estructura de bloques a un array simple de lecturas
            const lecturasActuales = bloques.flatMap((bloque) =>
              bloque.lecturas.map((lectura) => ({
                id_ejercicio: lectura.id_ejercicio,
                series: lectura.series,
                repeticiones: lectura.repeticiones,
                carga: lectura.carga,
                RPE: lectura.RPE,
              }))
            );

            // 4. Comparación profunda (Deep Equality Check): Verifica si los datos enviados son idénticos a los de la BD
            const arraysIguales = (arr1, arr2) => {
              if (arr1.length !== arr2.length) return false;
              return arr1.every((lec1) =>
                arr2.some(
                  (lec2) =>
                    lec1.id_ejercicio === lec2.id_ejercicio &&
                    lec1.series === lec2.series &&
                    lec1.repeticiones === lec2.repeticiones &&
                    lec1.carga === lec2.carga &&
                    lec1.RPE === lec2.RPE
                )
              );
            };

            const bloquesCambiados = !arraysIguales(lecturasActuales, lecturasExistentes);

            // Optimización de escritura: Si no hay cambios, se resuelve la promesa sin tocar la BD
            if (!bloquesCambiados) {
              return resolve({ message: "No se ha introducido ningún cambio en los ejercicios.", statusCode: 200 });
            }

            // 5. Actualización Incremental (Patrón Delete + Insert)
            if (bloquesCambiados) {
              // 5.1 Borrado selectivo: Se eliminan ÚNICAMENTE los registros de los ejercicios que vienen en la petición.
              // Se usa Promise.all para ejecutar los borrados en paralelo y asegurar que terminan antes de insertar.
              const deletePromises = lecturasActuales.map((lectura) => {
                return new Promise((resolve, reject) => {
                  db.query(
                    "DELETE FROM lectura WHERE id_historial = ? AND id_ejercicio = ?",
                    [id_historial, lectura.id_ejercicio],
                    (err) => {
                      if (err) return reject(err);
                      resolve();
                    }
                  );
                });
              });

              Promise.all(deletePromises)
                .then(() => {
                  // Caso borde: Si la petición venía vacía tras el borrado
                  if (lecturasActuales.length === 0) {
                    return resolve({ message: "Actividad actualizada correctamente (sin ejercicios).", statusCode: 200 });
                  }

                  // 5.2 Inserción de los nuevos registros actualizados
                  let lecturasInsertadas = 0;
                  const totalLecturas = lecturasActuales.length;

                  lecturasActuales.forEach((lectura) => {
                    db.query(
                      "INSERT INTO lectura(id_historial, id_plantilla, id_usuario, id_ejercicio, series, repeticiones, carga, RPE, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                      [
                        id_historial,
                        id_plantilla,
                        id_usuario,
                        lectura.id_ejercicio,
                        lectura.series,
                        lectura.repeticiones,
                        lectura.carga,
                        lectura.RPE,
                        fecha
                      ],
                      (err) => {
                        if (err) return reject({ message: "Error al insertar los ejercicios.", statusCode: 500 });
                        lecturasInsertadas++;
                        // Resolución final cuando todas las inserciones han terminado
                        if (lecturasInsertadas === totalLecturas) {
                          resolve({ message: "Actividad actualizada correctamente.", statusCode: 200 });
                        }
                      }
                    );
                  });
                })
                .catch((err) => reject({ code: DEFAULT_ERROR, message: "Error al eliminar los ejercicios antiguos.", statusCode: 500 }));
            }
          }
        );
      }
    );
  });
};