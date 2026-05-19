const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

//CREAR CATEGORÍA
exports.createCategory = (params) => {

  const { nombre_categoria } = params;

  const nombreMinusculas = String(nombre_categoria).toLowerCase();

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT nombre_categoria FROM categoria WHERE nombre_categoria = ?`,
      [nombreMinusculas],
      (err, result) => {
        if (result.length > 0) {
          return reject({
            message:
              "Ya hay una categoría con este nombre, por favor escoja uno distinto.",
            statusCode: 400,
          });
        } else if (result.length === 0) {
          console.log("Valor a insertar:", nombreMinusculas);
          db.query(
            `INSERT INTO categoria (nombre_categoria) VALUE (?)`,
            [nombreMinusculas],
            (err, result) => {
              if (err) {
                return reject({
                  data: err,
                  code: DEFAULT_ERROR,
                  message: "Error al crear la categoría.",
                  statusCode: 400,
                });
              } else {
                resolve({
                  data: result,
                  message: "Categoría creada correctamente.",
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

//ACTUALIZAR CATEGORÍA
exports.updateCategory = (params) => {

  const { nombre_categoria, id_categoria } = params;
  const nombreMinusculas = String(nombre_categoria).toLowerCase();

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, nombre_categoria FROM categoria WHERE id = ?`,
      [id_categoria],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar la categoría.",
            statusCode: 500,
          });
        }

        if (result.length === 0) {
          return reject({
            message: "Categoría no encontrada.",
            statusCode: 404,
          });
        }

        const categoriaSelect = result[0];

        db.query(
          `SELECT id FROM categoria WHERE nombre_categoria = ? AND id !=?;`,
          [nombreMinusculas, id_categoria],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al validar la categoría.",
                statusCode: 500,
              });
            }

            if (result.length > 0) {
              return reject({
                message:
                  "Ya hay una categoría con este nombre, por favor escoja uno distinto.",
                statusCode: 400,
              });
            }

            if (nombreMinusculas === categoriaSelect.nombre_categoria) {
              return resolve({
                message: "No se ha introducido ningún cambio.",
                statusCode: 200,
              });
            }

            db.query(
              `UPDATE categoria SET nombre_categoria = '${nombreMinusculas}' WHERE id = ?`,
              [id_categoria],
              (err, result) => {
                if (err) {
                  return reject({
                    code: DEFAULT_ERROR,
                    message:
                      "Error al actualizar la categoría, inténtelo otra vez.",
                    statusCode: 500,
                  });
                }

                resolve({
                  data: result,
                  message: "Categoría actualizada correctamente.",
                });
              }
            );
          }
        );
      }
    );
  });
};

//ELIMINAR CATEGORÍA Y DESVINCULAR DE LAS OTRAS TABLAS EN LA QUE ESTUVIERA
exports.deleteCategory = (params) => {
  
  const { id_categoria } = params;

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id FROM categoria WHERE id = ?`,
      [id_categoria],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar la categoría.",
            statusCode: 500,
          });
        }
        if (result.length === 0) {
          return reject({
            message: "Categoría no encontrada.",
            statusCode: 404,
          });
        }

        db.query(
          `UPDATE ejercicio SET id_categoria = NULL WHERE id_categoria = ?;
                    DELETE FROM categoria WHERE id = ?;`,
          [id_categoria, id_categoria],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al eliminar la categoría.",
                statusCode: 500,
              });
            }
            resolve({
              message: "Categoría eliminada correctamente.",
              statusCode: 200,
            });
          });
      }
    );
  });
};

//ASIGNAR CATEGORÍA-EJERCICIO
exports.linkCategoryToExercise = (params) => {

  const { id_categoria, id_ejercicio, forceReplace } = params;

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id FROM ejercicio WHERE id = ?;
      SELECT id FROM categoria WHERE id = ?`,
      [id_ejercicio, id_categoria],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar los ids del ejercicio y categoría seleccionados.",
            statusCode: 500,
          });
        }
        if (result[0].length === 0) {
          return reject({
            message: "Ejercicio a asignar no encontrado.",
            statusCode: 404,
          });
        }
        if (result[1].length === 0) {
          return reject({
            message: "Categoría a asignar no encontrada.",
            statusCode: 404,
          });
        }

        db.query(
          `SELECT ejercicio.id, ejercicio.id_categoria, categoria.nombre_categoria FROM ejercicio INNER JOIN categoria ON ejercicio.id_categoria = categoria.id WHERE ejercicio.id = ? AND ejercicio.id_categoria != ?`,
          [id_ejercicio, id_categoria],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message:
                  "Error al comprobar si el ejercicio ya está asignado a otra categoría.",
                statusCode: 500,
              });
            }
            if (result.length > 0 && result[0].id_categoria !== 0 && !forceReplace) {
              const categoria_asignada = result[0].nombre_categoria
              const categoria_asignada_estilizada = String(categoria_asignada).charAt(0).toUpperCase() + String(categoria_asignada).slice(1).toLowerCase()
              return reject({
                message: "Este ejercicio ya está asignado a la categoría \""+categoria_asignada_estilizada+"\". ¿Desea reemplazarla?",
                statusCode: 409,
              });

            }
            if (result.length === 0 || (result.length > 0 && (result[0].id_categoria === 0 || forceReplace) )) {
              db.query(
                `SELECT id, id_categoria FROM ejercicio WHERE id = ? AND id_categoria = ?`,
                [id_ejercicio, id_categoria],
                (err, result) => {
                  if (err) {
                    return reject({
                      code: DEFAULT_ERROR,
                      message:
                        "Error al comprobar si la categoría ya está asignada al ejercicio seleccionado.",
                      statusCode: 500,
                    });
                  }
                  if (result.length > 0) {
                    return reject({
                      message:
                        "Esta categoría ya está asignada al ejercicio seleccionado.",
                      statusCode: 400,
                    });
                  }
                  db.query(
                    `UPDATE ejercicio SET id_categoria = '${id_categoria}' WHERE id = ?`,
                    [id_ejercicio],
                    (err, result) => {
                      if (err) {
                        return reject({
                          code: DEFAULT_ERROR,
                          message:
                            "Error al realizar la asignación Categoría-Ejercicio seleccionada.",
                          statusCode: 500,
                        });
                      }
                      resolve({
                        data: result,
                        message:
                          "Asignación Categoría-Ejercicio realizada correctamente.",
                        statusCode: 200,
                      });
                    }
                  );
                }
              );
            }
          }
        );
      }
    );
  });
};

//ELIMINAR ASIGNACIÓN A EJERCICIO
exports.unlinkCategoryFormExercise = (params) => {

  const { id_categoria, id_ejercicio } = params;

  return new Promise((resolve, reject) => {
    db.query(`SELECT id FROM ejercicio WHERE id = ?; 
      SELECT id FROM categoria WHERE id = ?`, [id_ejercicio, id_categoria], (err, result) => {
      if (err){
        return reject({
          code: DEFAULT_ERROR,
          message: "Error al buscar los ids del ejercicio y la categoría seleccionados.",
          statusCode: 500,
        });
      }
      if(result[0].length === 0){
        return reject({
          message: "Ejercicio selecionado no encontrado.",
          statusCode: 404,
        });
      }
      if(result[1].length === 0){
        return reject({
          message: "Categoría selecionada no encontrada.",
          statusCode: 404,
        });
      }

      db.query(`SELECT id, id_categoria FROM ejercicio WHERE id = ? AND id_categoria = ?`, [id_ejercicio, id_categoria], (err, result) => {
        if(err){return reject({
          code: DEFAULT_ERROR,
          message: "Error al buscar la asignación Categoría-Ejercicio.",
          statusCode: 500,
        });}
        if(result.length === 0){
          return reject({
            message: "Asignación Categoría-Ejercicio no encontrada.",
            statusCode: 404,
          });
        }
        db.query(`UPDATE ejercicio SET id_categoria = 0 WHERE id = ?`, [id_ejercicio], (err, result) => {
          if(err){
            return reject({
              code: DEFAULT_ERROR,
              message: "Error al eliminar la asignación Categoría-Ejercicio.",
              statusCode: 500,
            });
          }
          resolve({
            data: result,
            message: "Asignación Categoría-Ejercicio eliminada correctamente.",
            statusCode: 200,
          });
        })
      })
    }
    )
  });
};

exports.getLinksCategory_Exercise = () => {

  return new Promise ((resolve, reject) => {
    db.query(`SELECT ejercicio.id, ejercicio.nombre_ejercicio, categoria.id, categoria.nombre_categoria 
        FROM ejercicio INNER JOIN categoria ON ejercicio.id_categoria = categoria.id
        WHERE ejercicio.id_categoria IS NOT NULL`, (err, results) => {
            if(err){
              return reject({
                code: DEFAULT_ERROR,
                message: "No se han podido recuperar las asignaciones Categoría-Ejercicio.",
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
