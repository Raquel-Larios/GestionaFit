const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

//ACTUALIZAR RUTINA CON INPUT DEL CLIENTE
exports.updateRutinaCliente = (params) => {

  const { id_historial, id_usuario, bloques} = params;
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
          "SELECT id_ejercicio, series, repeticiones, carga, RPE FROM lectura WHERE id_historial = ?",
          [id_historial],
          (err, lecturasExistentes) => {
            if (err)
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al obtener los ejercicios existentes.",
                statusCode: 500,
              });

            const lecturasActuales = bloques.flatMap((bloque) =>
              bloque.lecturas.map((lectura) => ({
                id_ejercicio: lectura.id_ejercicio,
                series: lectura.series,
                repeticiones: lectura.repeticiones,
                carga: lectura.carga,
                RPE: lectura.RPE,
              })),
            );

            // Función para comparar dos arrays de defectos
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

            const bloquesCambiados = !arraysIguales(
              lecturasActuales,
              lecturasExistentes,
            );

            // Si no hay cambios, resolver inmediatamente
            if (!bloquesCambiados) {
              return resolve({
                message: "No se ha introducido ningún cambio.",
                statusCode: 200,
              });
            }
        
            // Actualizar lecturas solo si han cambiado
            if (bloquesCambiados) {
              db.query(
                "DELETE FROM lectura WHERE id_historial = ?",
                [id_historial],
                (err) => {
                  if (err)
                    return reject({
                      code: DEFAULT_ERROR,
                      message: "Error al eliminar los ejercicios antiguos.",
                      statusCode: 500,
                    });

                  if (lecturasActuales.length === 0) {
                    return resolve({
                      message:
                        "Actividad actualizada correctamente (sin ejercicios).",
                      statusCode: 200,
                    });
                  }

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