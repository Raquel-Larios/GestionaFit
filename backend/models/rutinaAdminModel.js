const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");


//ES EL ASIGNAR PLANTILLA A CLIENTE PORQUE ASÍ ES COMO SE CREA UNA RUTINA DE ADMIN
exports.createRutinaAdmin = (params) => {
  const { id_usuario, id_plantilla} = params;
  const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

  return new Promise((resolve, reject) => {
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

            const id_historial = result.insertId;

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

//ACTUALIZAR RUTINA ASIGNADA A CLIENTE DE ADMIN
exports.updateRutinaAdmin = (params) => {

  const { id_historial, bloques} = params;
  const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');


  return new Promise((resolve, reject) => {
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

        // Comprobar si los bloques han cambiado (comparación profunda)
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

            const variacionesActuales = bloques.flatMap((bloque) =>
              bloque.variaciones.map((variacion) => ({
                id_ejercicio: variacion.id_ejercicio,
                series: variacion.series,
                repeticiones: variacion.repeticiones,
                carga: variacion.carga,
                RPE: variacion.RPE,
              })),
            );

            // Función para comparar dos arrays de defectos
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

            const bloquesCambiados = !arraysIguales(
              variacionesActuales,
              variacionesExistentes,
            );

            // Si no hay cambios, resolver inmediatamente
            if (!bloquesCambiados) {
              return resolve({
                message: "No se ha introducido ningún cambio.",
                statusCode: 200,
              });
            }
        
            // Actualizar variaciones solo si han cambiado
            if (bloquesCambiados) {
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

                  if (variacionesActuales.length === 0) {
                    return resolve({
                      message:
                        "Rutina actualizada correctamente (sin ejercicios).",
                      statusCode: 200,
                    });
                  }

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

//ELIMINAR RUTINA ASIGNADA A CLIENTE DE ADMIN desde Rutina
exports.deleteRutinaAdmin = (params) => {

  const { id_historial } = params;
  
   return new Promise((resolve, reject) => {
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
        if (result.length === 0) {
          return resolve({
            message: "Rutina no encontrada.",
            statusCode: 404,
          });
        }

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