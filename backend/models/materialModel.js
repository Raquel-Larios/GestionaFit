
const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

/**
 * Modelo: Creación de material educativo con validación de unicidad doble.
 * 
 * Verifica que no exista otro material con el mismo nombre (case-insensitive)
 * ni con el mismo contenido exacto antes de insertar. Esto evita duplicados
 * tanto en la identificación como en el recurso educativo en sí.
 * 
 * @function createMaterial
 * @param {Object} params - Objeto con datos del material.
 * @param {string} params.nombre_material - Nombre del material.
 * @param {string} params.contenido - Contenido del material (texto o URL).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con { data, message, statusCode } tras la inserción.
 * @rejects {Object} Rechaza con error 400 si el nombre o el contenido ya existen.
 * @rejects {Object} Rechaza con error 500 si falla la consulta a la base de datos.
 */
exports.createMaterial = (params) => {

  const { nombre_material, contenido } = params;
  // Normalización a minúsculas para garantizar unicidad independiente de mayúsculas/minúsculas
  const nombreMinusculas = String(nombre_material).toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. Verificación de unicidad del NOMBRE
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
          // 2. Verificación de unicidad del CONTENIDO (si el nombre es válido)
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
                // 3. Inserción segura (si ambas validaciones pasan)
                db.query(
                  `INSERT INTO material (nombre_material, contenido) VALUES (?, ?)`,
                  [nombreMinusculas, contenido],
                  (err, result) => {
                    if (err) {
                      return reject({
                        data: err,
                        code: DEFAULT_ERROR,
                        message: "Error al crear el material.",
                        statusCode: 500,
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

/**
 * Modelo: Actualización de material con validación de unicidad y optimización de escritura.
 * 
 * Verifica existencia, valida que ni el nombre ni el contenido colisionen con otros registros
 * (excluyendo el propio ID) y compara con los datos actuales para evitar escrituras innecesarias.
 * Construye dinámicamente la sentencia UPDATE modificando solo los campos que han cambiado.
 * 
 * @function updateMaterial
 * @param {Object} params - Objeto con datos actualizados.
 * @param {string} params.nombre_material - Nuevo nombre del material.
 * @param {string} params.contenido - Nuevo contenido del material.
 * @param {number} params.id_material - ID del material a actualizar.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el resultado de la actualización.
 * @rejects {Object} Rechaza con error 404 si el material no existe.
 * @rejects {Object} Rechaza con error 400 si hay conflicto de nombre o contenido.
 * @rejects {Object} Rechaza con error 500 si falla la consulta a la base de datos.
 */
exports.updateMaterial = (params) => {

  const { nombre_material, contenido, id_material } = params;
  // Normalización a minúsculas para garantizar unicidad case-insensitive
  const nombreMinusculas = String(nombre_material).toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia del registro
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

        // 2. Validación de unicidad del NOMBRE (excluyendo el ID actual)
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

            // 3. Validación de unicidad del CONTENIDO (excluyendo el ID actual)
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

                // 4. Optimización: Si los datos son idénticos, no se escribe en BD
                if (
                  nombreMinusculas === materialSelect.nombre_material &&
                  contenido === materialSelect.contenido
                ) {
                  return resolve({
                    message: "No se ha introducido ningún cambio.",
                    statusCode: 200,
                  });
                }

                // 5. Construcción dinámica de la consulta UPDATE (Solo actualiza lo modificado)
                // Nota: Los nombres de campo son literales fijos controlados, lo que hace seguro este patrón específico.
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
                // Construcción de la query final
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

/**
 * Modelo: Eliminación de material educativo.
 * 
 * Verifica la existencia del registro antes de proceder al borrado físico.
 * Al no tener dependencias críticas externas (o tener cascada en BD),
 * se realiza un DELETE directo sobre la tabla principal.
 * 
 * @function deleteMaterial
 * @param {Object} params - Objeto con el ID del material.
 * @param {number} params.id_material - ID del material a eliminar.
 * 
 * @returns {Promise<Object>} Promesa que resuelve tras el borrado exitoso.
 * @rejects {Object} Rechaza con error 404 si el material no existe.
 * @rejects {Object} Rechaza con error 500 si falla la consulta a la base de datos.
 */
exports.deleteMaterial = (params) => {

  const { id_material} = params;

  return new Promise((resolve, reject) => {
    // 1. Verificación previa de existencia
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

        // 2. Ejecución del borrado físico
        db.query(
          `DELETE FROM material WHERE id = ?;`,
          [id_material],
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
          }
        );
      }
    );
  });
};
