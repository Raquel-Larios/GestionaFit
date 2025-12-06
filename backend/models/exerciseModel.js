const {
  createExerciseValidation,
  updateExerciseValidation,
  deleteExerciseValidation,
} = require("../middleware/validation");
const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

//CREAR EJERCICIO
exports.createExercise = (params) => {
  const { error } = createExerciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { nombre, categoriaId } = params;
  const nombreMinusculas = String(nombre).toLowerCase();

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

        let query = "";
        if(categoriaId === null){
            query = `(nombre_ejercicio) VALUE ('${nombreMinusculas}')`;
        }
        else{
            query = `(nombre_ejercicio, id_categoria) VALUES ('${nombreMinusculas}','${categoriaId}')`
        }

        if (result.length === 0){
          db.query(
            `INSERT INTO ejercicio '${query}'`,
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

  const { nombre, categoriaId, ejercicioId } = params;
  const nombreMinusculas = String(nombre).toLowerCase();

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id FROM ejercicio WHERE id = ?`,
      [ejercicioId],
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
          [nombreMinusculas, ejercicioId],
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

            if((categoriaId === null || categoriaId === ejercicioSelect.id_categoria) && nombreMinusculas === ejercicioSelect.nombre_ejercicio){
                //categoriaId es null por defecto y no se puede poner a null desde el formulario, luego si es null es porque no se ha cambiado
                return reject({
                    message: "No se ha introducido ningún cambio.",
                    statusCode: 400,
                });
            }

            let query = "";

            if(nombreMinusculas !== ejercicioSelect.nombre_ejercicio && categoriaId !== ejercicioSelect.id_categoria){
                query = `nombre_ejercicio = '${nombreMinusculas}', id_categoria = '${categoriaId}'`;
            }
            else if(nombreMinusculas !== ejercicioSelect.nombre_ejercicio && categoriaId === ejercicioSelect.id_categoria){
                query = `nombre_ejercicio = '${nombreMinusculas}'`;
            }
            else{
                query = `id_categoria = '${categoriaId}'`;
            }

                db.query(
                  `UPDATE ejercicio SET ${query} where id = ?`,
                  [ejercicioId],
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

  const { ejercicioId } = params;

  return new Promise((resolve, reject) => {
    db.query(`SELECT id FROM ejercicio WHERE id = ?`, [ejercicioId], (err, result) => {
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

      //Se borran las apraiciones del id en todas las tablas que no funcionen como historial, es decir,
      // no se borra de la de lectura ya que estos datos se necesitan para las gráficas.
      db.query(`
        DELETE FROM defecto WHERE id_ejercicio = ?;
        DELETE FROM variacion WHERE id_ejercicio =?;
        DELETE FROM demostracion WHERE id_ejercicio = ?;
        DELETE FROM ejercicio WHERE id = ?;`, [ejercicioId, ejercicioId, ejercicioId, ejercicioId], (err, result) => {
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

//ELIMINAR ASIGNACIÓN EJERCICIO-VÍDEO
exports.unlinkExerciseFromVideo = (params) => {
  const { error } = deleteExrciseValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { ejercicioId } = params;

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id_ejercicio FROM demostracion WHERE id_ejercicio = ?`,
      [videoId],
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
          [ejercicioId],
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