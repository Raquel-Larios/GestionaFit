const {
  createExerciseValidation,
  updateExerciseValidation,
  deleteExerciseValidation,
  linkVideoValidation
} = require("../middleware/validation");
const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

//CREAR EJERCICIO
exports.createExercise = (params) => {
  const { error } = createExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { nombre_ejercicio, id_categoria } = params;
  const nombreMinusculas = String(nombre_ejercicio).toLowerCase();

  return new Promise((resolve, reject) => {
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

        let query, values;
        if(id_categoria === null){
            query = 'INSERT INTO ejercicio (nombre_ejercicio) VALUES (?)';
            values = [nombreMinusculas];
        }
        else{
            query = 'INSERT INTO ejercicio (nombre_ejercicio, id_categoria) VALUES (?, ?)';
            values = [nombreMinusculas, id_categoria];
        }

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

//ACTUALIZAR EJERCICIO
exports.updateExercise = (params) => {
  const { error } = updateExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { nombre_ejercicio, id_categoria, id_ejercicio } = params;
  const nombreMinusculas = String(nombre_ejercicio).toLowerCase();

  return new Promise((resolve, reject) => {
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

            if((id_categoria === ejercicioSelect.id_categoria) && nombreMinusculas === ejercicioSelect.nombre_ejercicio){
                return resolve({
                    message: "No se ha introducido ningún cambio.",
                    statusCode: 200,
                });
            }

            let query, values;

            if(nombreMinusculas !== ejercicioSelect.nombre_ejercicio && id_categoria !== ejercicioSelect.id_categoria){
                query = 'UPDATE ejercicio SET nombre_ejercicio = ? , id_categoria = ? WHERE id = ?';
                values = [nombreMinusculas, id_categoria, id_ejercicio]
            }
            else if(nombreMinusculas !== ejercicioSelect.nombre_ejercicio && id_categoria === ejercicioSelect.id_categoria){
                query = 'UPDATE ejercicio SET nombre_ejercicio = ? WHERE id = ?';
                values = [nombreMinusculas, id_ejercicio]
            }
            else{
                query = 'UPDATE ejercicio SET id_categoria = ? WHERE id = ?';
                values = [id_categoria, id_ejercicio]
            }

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

//ELIMINAR EJERCICIO
exports.deleteExercise = (params) => {
  const { error } = deleteExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { id_ejercicio } = params;

  return new Promise((resolve, reject) => {
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

      //Se borran las apariciones del id en todas las tablas que no funcionen como historial, es decir,
      // no se borra de la de lectura ya que estos datos se necesitan para las gráficas.
      db.query(`
        DELETE FROM defecto WHERE id_ejercicio = ?;
        DELETE FROM variacion WHERE id_ejercicio =?;
        DELETE FROM demostracion WHERE id_ejercicio = ?;
        DELETE FROM ejercicio WHERE id = ?;`, [id_ejercicio, id_ejercicio, id_ejercicio, id_ejercicio], (err, result) => {
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

//ASIGNAR EJERCICIO-VIDEO
exports.linkExerciseToVideo = (params) => {
  const { error } = linkVideoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { id_video, id_ejercicio, forceReplace } = params;

  return new Promise((resolve, reject) => {
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
          if (!forceReplace) {
            const video_asignado = result[0].nombre_video;
            const video_asignado_estilizado =
              String(video_asignado).charAt(0).toUpperCase() +
              String(video_asignado).slice(1).toLowerCase();
            return reject({
              message:
                'Este ejercicio ya está asignado al vídeo "' +
                video_asignado_estilizado +
                '". ¿Desea reemplazarlo?',
              statusCode: 409,
            });
          } else {
            //Es una relacion 1:1
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
              },
            );
          }
        }
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

//ELIMINAR ASIGNACIÓN EJERCICIO-VÍDEO
exports.unlinkExerciseFromVideo = (params) => {
  const { error } = deleteExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { id_ejercicio } = params;

  return new Promise((resolve, reject) => {
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