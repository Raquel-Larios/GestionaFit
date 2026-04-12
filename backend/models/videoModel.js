const {
  createVideoValidation,
  updateVideoValidation,
  deleteVideoValidation,
  linkVideoValidation,
} = require("../middleware/validation");
const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

//CREAR VIDEO
exports.createVideo = (params) => {
  const { error } = createVideoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { nombre_video, enlace_video } = params;
  const nombreMinusculas = String(nombre_video).toLowerCase();

  return new Promise((resolve, reject) => {
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
                  }
                );
              }
            }
          );
        }
      }
    );
  });
};

//ACTUALIZAR VIDEO
exports.updateVideo = (params) => {
  const { error } = updateVideoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { nombre_video, enlace_video, id_video } = params;
  const nombreMinusculas = String(nombre_video).toLowerCase();

  return new Promise((resolve, reject) => {
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

                if (
                  nombreMinusculas === videoSelect.nombre_video &&
                  enlace_video === videoSelect.enlace_video
                ) {
                  return resolve({
                    message: "No se ha introducido ningún cambio.",
                    statusCode: 200,
                  });
                }

                const fields = []
                const values = [];

                if(nombreMinusculas !== videoSelect.nombre_video){
                  fields.push('nombre_video = ?')
                  values.push(nombreMinusculas)
                }
                if (enlace_video !== videoSelect.enlace_video){
                  fields.push('enlace_video = ?')
                  values.push(enlace_video)
                }

                values.push(id_video)
                const query = `UPDATE video SET ${fields.join(', ')} WHERE id = ?`

                db.query(
                  query, values,
                  (err, result) => {
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
                  }
                );
              }
            );
          }
        );
      }
    );
  });
};

//ELIMINAR VIDEO
exports.deleteVideo = (params) => {
  const { error } = deleteVideoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { id_video } = params;

  return new Promise((resolve, reject) => {
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

      db.query(`DELETE FROM demostracion WHERE id_video = ?;
        DELETE FROM video WHERE id = ?;`, [id_video, id_video], (err, result) => {
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
      });
    });
  });
};

//ASIGNAR A EJERCICIO-ASIGNAR A VIDEO
exports.linkVideoToExercise = (params) => {
  const { error } = linkVideoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { id_video, id_ejercicio } = params;

  return new Promise((resolve, reject) => {
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
        if (result.length > 0) {
          return reject({
            message: "Este vídeo ya tiene un ejercicio asignado.",
            statusCode: 400,
          });
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
          }
        );
      }
    );
  });
};

//ELIMINAR ASIGNACIÓN A EJERICIO
exports.unlinkVideoFromExercise = (params) => {
  const { error } = deleteVideoValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { id_video } = params;

  return new Promise((resolve, reject) => {
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
        db.query(
          `DELETE FROM demostracion WHERE id_video = ?`,
          [id_video],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message:
                  "Error al eliminar la asignación Vídeo-Ejercicio.",
                statusCode: 500,
              });
            }

            resolve({
              message: "Asignación Vídeo-Ejercicio eliminada correctamente.",
              statusCode: 200,
            });
          }
        );
      }
    );
  });
};

//GET ASIGNACIÓN VÍDEO-EJERCICIO O EJERICIO-VÍDEO
exports.getLinksVideo_Exercise = () => {

  return new Promise ((resolve, reject) => {
    db.query('SELECT * FROM demostracion', (err, results) => {
            if(err){
              return reject({
                code: DEFAULT_ERROR,
                message: "No se han podido recuperar las asignaciones Vídeo-Ejercicio/Ejercicio-Vídeo.",
                statusCode: 500,
              })
            }
            resolve({
              data: results,
              statusCode: 200,
            })
            
        });
  });
}
