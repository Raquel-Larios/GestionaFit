
const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

/**
 * Modelo: Creación de plantilla base (defecto) con inserción masiva de ejercicios.
 * 
 * Valida la unicidad del nombre de la plantilla (en minúsculas) antes de crear el registro.
 * Inserta la plantilla principal y luego clona la estructura de bloques y ejercicios
 * en la tabla 'defecto'. Optimiza la operación verificando si hay ejercicios antes de iterar.
 * 
 * @function createTemplate
 * @param {Object} params - Objeto con los datos de la plantilla.
 * @param {string} params.nombre_plantilla - Nombre de la plantilla (se normaliza a minúsculas).
 * @param {Array} params.bloques - Array de bloques que contienen los ejercicios por defecto.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el ID de la plantilla creada y mensaje de éxito.
 * @rejects {Object} Rechaza con error 400 si el nombre de la plantilla ya existe.
 * @rejects {Object} Rechaza con error 500 si falla la creación de la plantilla o la inserción de ejercicios.
 */
exports.createTemplate = (params) => {
  // 1. Extracción y normalización de datos
  const { nombre_plantilla, bloques } = params;
  const nombrePlantillaMinusculas = String(nombre_plantilla).toLowerCase();

  return new Promise((resolve, reject) => {
    // 2. Verificación de unicidad del nombre
    db.query(
      `SELECT id FROM plantilla WHERE nombre_plantilla = ?`,
      [nombrePlantillaMinusculas],
      (err, result) => {
        if (err)
          return reject({
            code: DEFAULT_ERROR,
            message:
              "Error al comprobar si ya hay una plantilla con ese nombre.",
            statusCode: 500,
          });
        if (result.length > 0) {
          return reject({
            message:
              "Ya existe una plantilla con este nombre, por favor escoja uno distinto.",
            statusCode: 400,
          });
        }

        // 3. Inserción del registro principal de la plantilla
        db.query(
          `INSERT INTO plantilla (nombre_plantilla) VALUES (?)`,
          [nombrePlantillaMinusculas],
          (err, result) => {
            if (err)
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al crear la plantilla.",
                statusCode: 500,
              });

            const id_plantilla = result.insertId;

            // 4. Preparación para inserción de ejercicios (defectos)
            // Aplanamos el array de bloques para contar el total real de ejercicios
            let defectosInsertados = 0;
            const totalDefectos = bloques.flatMap((b) => b.defectos).length;

            // Caso borde: Plantilla vacía (sin ejercicios)
            if (totalDefectos === 0) {
              return resolve({
                data: result,
                message: "Plantilla creada correctamente (sin ejercicios).",
                statusCode: 200,
              });
            }

            // 5. Inserción iterativa de ejercicios 
            bloques.forEach((bloque) => {
              bloque.defectos.forEach((defecto) => {
                db.query(
                  "INSERT INTO defecto (id_plantilla, id_ejercicio, series, repeticiones, carga, RPE) VALUES (?, ?, ?, ?, ?, ?)",
                  [
                    id_plantilla,
                    defecto.id_ejercicio,
                    defecto.series,
                    defecto.repeticiones,
                    defecto.carga,
                    defecto.RPE,
                  ],
                  (err) => {
                    if (err) {
                      return reject({
                        message: "Error al insertar los ejercicios.",
                        statusCode: 500,
                      });
                    }

                    // 6. Control de finalización de inserciones paralelas
                    defectosInsertados++;
                    if (defectosInsertados === totalDefectos) {
                      resolve({
                        data: result,
                        message: "Plantilla creada correctamente.",
                        statusCode: 200,
                      });
                    }
                  },
                );
              });
            });
          },
        );
      },
    );
  });
};

/**
 * Modelo: Actualización de plantilla base con optimización de escritura y validación de cambios.
 * 
 * Verifica la existencia de la plantilla y la unicidad del nuevo nombre (excluyendo el ID actual).
 * Compara los datos entrantes con los actuales mediante una comparación profunda para evitar
 * escrituras innecesarias. Construye dinámicamente las sentencias UPDATE y DELETE/INSERT
 * modificando solo los campos que han cambiado realmente (nombre o ejercicios).
 * 
 * @function updateTemplate
 * @param {Object} params - Objeto con los datos actualizados.
 * @param {number} params.id_plantilla - ID de la plantilla a actualizar.
 * @param {string} params.nombre_plantilla - Nuevo nombre de la plantilla.
 * @param {Array} params.bloques - Array de bloques con los ejercicios por defecto.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el resultado de la actualización.
 * @rejects {Object} Rechaza con error 404 si la plantilla no existe.
 * @rejects {Object} Rechaza con error 400 si hay conflicto de nombre (duplicidad).
 * @rejects {Object} Rechaza con error 500 si falla alguna consulta a la base de datos.
 */
exports.updateTemplate = (params) => {
  
  const { id_plantilla, nombre_plantilla, bloques } = params;
  const nombrePlantillaMinusculas = String(nombre_plantilla).toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia del registro
    db.query(
      `SELECT id, nombre_plantilla FROM plantilla WHERE id = ?`,
      [id_plantilla],
      (err, result) => {
        if (err)
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar la plantilla.",
            statusCode: 500,
          });
        if (result.length === 0) {
          return reject({
            message: "Plantilla no encontrada.",
            statusCode: 404,
          });
        }

        // 2. Validación de unicidad del nombre (excluyendo el ID actual)
        db.query(
          `SELECT id FROM plantilla WHERE nombre_plantilla = ? AND id != ?`,
          [nombrePlantillaMinusculas, id_plantilla],
          (err, result) => {
            if (err)
              return reject({
                code: DEFAULT_ERROR,
                message:
                  "Error al comprobar si ya existe una plantilla con ese nombre.",
                statusCode: 500,
              });
            if (result.length > 0) {
              return reject({
                message:
                  "Ya hay una plantilla con este nombre, por favor escoja uno distinto.",
                statusCode: 400,
              });
            }
          },
        );

        // 3. Preparación de variables de estado
        const plantillaSelect = result[0];
        const nombreCambiado =
          nombrePlantillaMinusculas !== plantillaSelect.nombre_plantilla;

        // 4. Obtención de ejercicios actuales para comparación
        db.query(
          "SELECT id_ejercicio, series, repeticiones, carga, RPE FROM defecto WHERE id_plantilla = ?",
          [id_plantilla],
          (err, defectosExistentes) => {
            if (err)
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al obtener los ejercicios existentes.",
                statusCode: 500,
              });

            // 5. Normalización de datos entrantes
            const defectosActuales = bloques.flatMap((bloque) =>
              bloque.defectos.map((defecto) => ({
                id_ejercicio: defecto.id_ejercicio,
                series: defecto.series,
                repeticiones: defecto.repeticiones,
                carga: defecto.carga,
                RPE: defecto.RPE,
              })),
            );

            // 6. Comparación profunda (Deep Equality Check)
            const arraysIguales = (arr1, arr2) => {
              if (arr1.length !== arr2.length) return false;
              return arr1.every((def1) =>
                arr2.some(
                  (def2) =>
                    def1.id_ejercicio === def2.id_ejercicio &&
                    def1.series === def2.series &&
                    def1.repeticiones === def2.repeticiones &&
                    def1.carga === def2.carga &&
                    def1.RPE === def2.RPE,
                ),
              );
            };

            
            const bloquesCambiados = !arraysIguales(
              defectosActuales,
              defectosExistentes,
            );

            // 7. Optimización: Si no hay cambios en nombre ni ejercicios, abortar
            if (!nombreCambiado && !bloquesCambiados) {
              return resolve({
                message: "No se ha introducido ningún cambio.",
                statusCode: 200,
              });
            }

            // 8. Actualización condicional del nombre
            if (nombreCambiado) {
              db.query(
                "UPDATE plantilla SET nombre_plantilla = ? WHERE id = ?",
                [nombrePlantillaMinusculas, id_plantilla],
                (err) => {
                  if (err)
                    return reject({
                      code: DEFAULT_ERROR,
                      message: "Error al actualizar el nombre de la plantilla.",
                      statusCode: 500,
                    });
                },
              );
            }

            // 9. Actualización de ejercicios (Solo si han cambiado)
            if (bloquesCambiados) {
              // 9.1 Borrado de ejercicios anteriores (Clean Slate)
              db.query(
                "DELETE FROM defecto WHERE id_plantilla = ?",
                [id_plantilla],
                (err) => {
                  if (err)
                    return reject({
                      code: DEFAULT_ERROR,
                      message: "Error al eliminar los ejercicios antiguos.",
                      statusCode: 500,
                    });

                  if (defectosActuales.length === 0) {
                    return resolve({
                      message:
                        "Plantilla actualizada correctamente (sin ejercicios).",
                      statusCode: 200,
                    });
                  }

                  // 9.2 Inserción múltiple de nuevos ejercicios
                  let defectosInsertados = 0;
                  const totalDefectos = defectosActuales.length;

                  defectosActuales.forEach((defecto) => {
                    db.query(
                      "INSERT INTO defecto (id_plantilla, id_ejercicio, series, repeticiones, carga, RPE) VALUES (?, ?, ?, ?, ?, ?)",
                      [
                        id_plantilla,
                        defecto.id_ejercicio,
                        defecto.series,
                        defecto.repeticiones,
                        defecto.carga,
                        defecto.RPE,
                      ],
                      (err) => {
                        if (err)
                          return reject({
                            message: "Error al insertar los ejercicios.",
                            statusCode: 500,
                          });

                        defectosInsertados++;
                        if (defectosInsertados === totalDefectos) {
                          resolve({
                            message:
                              "Plantilla y ejercicios actualizados correctamente.",
                            statusCode: 200,
                          });
                        }
                      },
                    );
                  });
                },
              );
            } else {
              // 10. Caso: Solo cambió el nombre (los ejercicios ya se actualizaron arriba)
              resolve({
                message: "Plantilla actualizada correctamente.",
                statusCode: 200,
              });
            }
          },
        );
      },
    );
  });
};

/**
 * Modelo: Eliminación de plantilla base con limpieza en cascada manual.
 * 
 * Verifica la existencia de la plantilla antes de proceder. Ejecuta una secuencia
 * de eliminaciones múltiples (defectos y plantilla) en una única llamada a la BD.
 * Nota: Requiere `multipleStatements: true` en la configuración de MySQL.
 * Si no existe el registro, rechaza la promesa con error 404.
 * 
 * @function deleteTemplate
 * @param {Object} params - Objeto con el identificador de la plantilla.
 * @param {number} params.id_plantilla - ID de la plantilla a eliminar.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con mensaje de éxito.
 * @rejects {Object} Rechaza con error 404 si la plantilla no existe.
 * @rejects {Object} Rechaza con error 500 si falla la verificación o la eliminación en cascada.
 */
exports.deleteTemplate = (params) => {

  const { id_plantilla } = params;

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia
    db.query(
      `SELECT id FROM plantilla WHERE id = ?`,
      [id_plantilla],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar la plantilla.",
            statusCode: 500,
          });
        }
        if (result.length === 0) {
          return reject({
            message: "Plantilla no encontrada.",
            statusCode: 404,
          });
        }

        // 2. Eliminación en Cascada Manual (Requiere multipleStatements: true)
        // Primero borra los hijos (defecto) y luego el padre (plantilla)
        db.query(`
          DELETE FROM defecto WHERE id_plantilla = ?;
          DELETE FROM plantilla WHERE id = ?;`,
          [id_plantilla, id_plantilla],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al eliminar la plantilla.",
                statusCode: 500,
              });
            }
            resolve({
              message: "Plantilla eliminada correctamente.",
              statusCode: 200,
            });
          },
        );
      },
    );
  });
};

/**
 * Modelo: Desvinculación de rutina asignada con limpieza de variaciones.
 * 
 * Busca el registro de historial cruzando usuario y plantilla. Elimina las
 * variaciones asociadas a ese historial y luego el registro de asignación.
 * No elimina la plantilla base ni los ejercicios globales, solo la instancia asignada.
 * Requiere `multipleStatements: true` para ejecutar los DELETEs en secuencia.
 * 
 * @function deleteRutinaPlantilla
 * @param {Object} params - Objeto con los identificadores de usuario y plantilla.
 * @param {number} params.id_usuario - ID del usuario afectado.
 * @param {number} params.id_plantilla - ID de la plantilla a desvincular.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con mensaje de éxito.
 * @rejects {Object} Rechaza con error 404 si no existe la asignación para ese usuario.
 * @rejects {Object} Rechaza con error 500 si falla la búsqueda o la eliminación de registros.
 */
exports.deleteRutinaPlantilla = (params) => {

  const { id_usuario, id_plantilla } = params;
  
   return new Promise((resolve, reject) => {
    // 1. Búsqueda del registro de historial específico
    db.query(
      `SELECT id FROM historial_plantilla_usuario WHERE id_usuario = ? AND id_plantilla = ?`,
      [id_usuario, id_plantilla],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar la rutina.",
            statusCode: 500,
          });
        }
        if (result.length === 0) {
          return reject({
            message: "Rutina no encontrada.",
            statusCode: 404,
          });
        }

        const id_historial = result[0].id

        // 2. Eliminación en Cascada Manual de la asignación
        // Borra las variaciones (hijos) y luego el historial (padre)
        db.query(`
          DELETE FROM variacion WHERE id_historial = ?;
          DELETE FROM historial_plantilla_usuario WHERE id = ?;`,
          [id_historial, id_historial],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al desasignar la rutina.",
                statusCode: 500,
              });
            }
            resolve({
              message: "Rutina desasignada correctamente.",
              statusCode: 200,
            });
          },
        );
      },
    );
  });
}
