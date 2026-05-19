
const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

//CREAR PLANTILLA DE ADMIN (DEFECTO)
exports.createTemplate = (params) => {

  const { nombre_plantilla, bloques } = params;
  const nombrePlantillaMinusculas = String(nombre_plantilla).toLowerCase();

  return new Promise((resolve, reject) => {
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
            let defectosInsertados = 0;
            const totalDefectos = bloques.flatMap((b) => b.defectos).length;

            if (totalDefectos === 0) {
              return resolve({
                data: result,
                message: "Plantilla creada correctamente (sin ejercicios).",
                statusCode: 200,
              });
            }

            // Insertar cada bloque y sus defectos
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

//ACTUALIZAR PLANTILLA DE ADMIN
exports.updateTemplate = (params) => {
  
  const { id_plantilla, nombre_plantilla, bloques } = params;
  const nombrePlantillaMinusculas = String(nombre_plantilla).toLowerCase();

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id FROM plantilla WHERE id = ?`,
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

        const plantillaSelect = result[0];
        const nombreCambiado =
          nombrePlantillaMinusculas !== plantillaSelect.nombre_plantilla;

        // Comprobar si los bloques han cambiado (comparación profunda)
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

            const defectosActuales = bloques.flatMap((bloque) =>
              bloque.defectos.map((defecto) => ({
                id_ejercicio: defecto.id_ejercicio,
                series: defecto.series,
                repeticiones: defecto.repeticiones,
                carga: defecto.carga,
                RPE: defecto.RPE,
              })),
            );

            // Función para comparar dos arrays de defectos
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

            // Si no hay cambios, resolver inmediatamente
            if (!nombreCambiado && !bloquesCambiados) {
              return resolve({
                message: "No se ha introducido ningún cambio.",
                statusCode: 200,
              });
            }

            // Actualizar nombre de la plantilla si ha cambiado
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

            // Actualizar defectos solo si han cambiado
            if (bloquesCambiados) {
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
              // Solo se actualiza el nombre
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

//ELIMINAR PLANTILLA DE ADMIN
exports.deleteTemplate = (params) => {

  const { id_plantilla } = params;

  return new Promise((resolve, reject) => {
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

//ELIMINAR RUTINA ASIGNADA A CLIENTE DE ADMIN
exports.deleteRutinaPlantilla = (params) => {

  const { id_usuario, id_plantilla } = params;
  
   return new Promise((resolve, reject) => {
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
