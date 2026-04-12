const {
  createMaterialValidation,
  updateMaterialValidation,
  deleteMaterialValidation,
} = require("../middleware/validation");
const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

//CREAR MATERIAL
exports.createMaterial = (params) => {
  const { error } = createMaterialValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { nombre_material, contenido } = params;
  const nombreMinusculas = String(nombre_material).toLowerCase();

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT nombre_material FROM material WHERE nombre_material = ?`,
      [nombreMinusculas],
      (err, result) => {
        if (result.length > 0) {
          return reject({
            message:
              "Ya hay un material con este nombre, por favor escoja uno distinto.",
            statusCode: 400,
          });
        } else if (result.length === 0) {
          db.query(
            `SELECT contenido FROM material WHERE contenido = ?`,
            [contenido],
            (err, result) => {
              if (result.length > 0) {
                return reject({
                  message: "Ya hay un material con este contenido.",
                  statusCode: 400,
                });
              } else {
                db.query(
                  `INSERT INTO material (nombre_material, contenido) VALUE (?, ?)`,
                  [nombreMinusculas, contenido],
                  (err, result) => {
                    if (err) {
                      return reject({
                        data: err,
                        code: DEFAULT_ERROR,
                        message: "Error al crear el material.",
                        statusCode: 400,
                      });
                    } else {
                      resolve({
                        data: result,
                        message: "Material creado correctamente.",
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

//ACTUALIZAR MATERIAL
exports.updateMaterial = (params) => {
  const { error } = updateMaterialValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { nombre_material, contenido, id_material } = params;
  const nombreMinusculas = String(nombre_material).toLowerCase();

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, nombre_material, contenido FROM material WHERE id = ?`,
      [id_material],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar el material.",
            statusCode: 500,
          });
        }

        if (result.length === 0) {
          return reject({
            message: "Material no encontrado.",
            statusCode: 404,
          });
        }

        const materialSelect = result[0];

        db.query(
          `SELECT id FROM material WHERE nombre_material = ? AND id != ?;`,
          [nombreMinusculas, id_material],
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al validar el material.",
                statusCode: 500,
              });
            }

            if (result.length > 0) {
              return reject({
                message:
                  "Ya hay un material con este nombre, por favor escoja uno distinto.",
                statusCode: 400,
              });
            }

            db.query(
              `SELECT id FROM material WHERE contenido = ? AND id != ?`,
              [contenido, id_material],
              (err, result) => {
                if (err) {
                  return reject({
                    code: DEFAULT_ERROR,
                    message: "Error al validar el material.",
                    statusCode: 500,
                  });
                }

                if (result.length > 0) {
                  return reject({
                    message: "Ya hay un material con este contenido.",
                    statusCode: 400,
                  });
                }

                if (
                  nombreMinusculas === materialSelect.nombre_material &&
                  contenido === materialSelect.contenido
                ) {
                  return resolve({
                    message: "No se ha introducido ningún cambio.",
                    statusCode: 200,
                  });
                }

                const fields = []
                const values = [];

                if(nombreMinusculas !== materialSelect.nombre_material){
                  fields.push('nombre_material = ?')
                  values.push(nombreMinusculas)
                }
                if (contenido !== materialSelect.contenido){
                  fields.push('contenido = ?')
                  values.push(contenido)
                }

                values.push(id_material)
                const query = `UPDATE material SET ${fields.join(', ')} WHERE id = ?`

                db.query(
                  query, values,
                  (err, result) => {
                    if (err) {
                      return reject({
                        code: DEFAULT_ERROR,
                        message:
                          "Error al actualizar el material, inténtelo otra vez.",
                        statusCode: 500,
                      });
                    }

                    resolve({
                      data: result,
                      message: "Material actualizado correctamente.",
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

//ELIMINAR MATERIAL
exports.deleteMaterial = (params) => {
  const { error } = deleteMaterialValidation(params);
  if (error) throw { message: error.details[0].message, statusCode: 400 };

  const { id_material} = params;

  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id FROM material WHERE id = ?`,
      [id_material],
      (err, result) => {
        if (err) {
          return reject({
            code: DEFAULT_ERROR,
            message: "Error al buscar el material.",
            statusCode: 500,
          });
        }
        if (result.length === 0) {
          return reject({
            message: "Material no encontrado.",
            statusCode: 404,
          });
        }

        db.query(
          `DELETE FROM material WHERE id = ?;`,
          [id_material]
        ),
          (err, result) => {
            if (err) {
              return reject({
                code: DEFAULT_ERROR,
                message: "Error al eliminar el material.",
                statusCode: 500,
              });
            }
            resolve({
              message: "Material eliminado correctamente.",
              statusCode: 200,
            });
          };
      }
    );
  });
};
