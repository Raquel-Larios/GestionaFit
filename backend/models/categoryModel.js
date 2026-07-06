const db = require("../database/db");
const { DEFAULT_ERROR } = require("../constants");

/**
 * Modelo: Creación de categoría con validación de unicidad.
 * 
 * Implementa un patrón de "check-then-act" para asegurar que no existan
 * duplicados (case-insensitive) antes de insertar. Normaliza el nombre
 * a minúsculas para garantizar consistencia en la comparación.
 * 
 * @function createCategory
 * @param {Object} params - Objeto con el nombre de la categoría.
 * @param {string} params.nombre_categoria - Nombre de la categoría a crear.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con { data, message, statusCode } (ID de inserción).
 * @rejects {Object} Rechaza con error 400 si el nombre ya existe (duplicidad).
 * @rejects {Object} Rechaza con error 500 si falla la consulta a la base de datos.
 */
exports.createCategory = (params) => {
  const { nombre_categoria } = params;
  // Normalización a minúsculas para garantizar unicidad independiente de mayúsculas/minúsculas
  const nombreMinusculas = String(nombre_categoria).toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia (Prevención de duplicados)
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
          // 2. Inserción segura mediante consulta parametrizada (previene SQL Injection)
          db.query(
            `INSERT INTO categoria (nombre_categoria) VALUES (?)`,
            [nombreMinusculas],
            (err, result) => {
              if (err) {
                return reject({
                  code: DEFAULT_ERROR,
                  message: "Error al crear la categoría.",
                  statusCode: 500,
                });
              } else {
                resolve({
                  data: result, // Contiene el insertId
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

/**
 * Modelo: Actualización de categoría con validación de integridad y optimización.
 * 
 * Verifica existencia, valida que el nuevo nombre no colisione con otros registros
 * (excluyendo el propio ID que se edita) y evita escrituras innecesarias en la BD
 * si el dato no ha cambiado (comparación case-insensitive).
 * 
 * @function updateCategory
 * @param {Object} params - Objeto con ID y nuevo nombre.
 * @param {number} params.id_categoria - ID de la categoría a actualizar.
 * @param {string} params.nombre_categoria - Nuevo nombre para la categoría.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el resultado de la actualización.
 * @rejects {Object} Rechaza con error 404 si la categoría no existe.
 * @rejects {Object} Rechaza con error 400 si hay conflicto de nombre con otro registro.
 * @rejects {Object} Rechaza con error 500 si falla la consulta a la base de datos.
 */
exports.updateCategory = (params) => {
  const { nombre_categoria, id_categoria } = params;
  const nombreMinusculas = String(nombre_categoria).toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia del registro a editar
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
        // 2. Validación de unicidad: Busca colisiones EXCLUYENDO el ID actual
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

            // 3. Optimización: Si el nombre es idéntico (case-insensitive), no se escribe en BD
            if (nombreMinusculas === categoriaSelect.nombre_categoria) {
              return resolve({
                message: "No se ha introducido ningún cambio.",
                statusCode: 200,
              });
            }

            // 4. Actualización parametrizada
            db.query(
              `UPDATE categoria SET nombre_categoria = ? WHERE id = ?`,
              [nombreMinusculas, id_categoria],
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

/**
 * Modelo: Eliminación de categoría y limpieza de dependencias (Cascada manual).
 * 
 * Ejecuta una operación compuesta en secuencia: primero desvincula la categoría 
 * de los ejercicios asociados (SET 0) para evitar errores de integridad referencial,
 * y posteriormente elimina el registro de la tabla categoría.
 * 
 * @function deleteCategory
 * @param {Object} params - Objeto con el ID de la categoría.
 * @param {number} params.id_categoria - ID de la categoría a eliminar.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con { message, statusCode } tras el borrado.
 * @rejects {Object} Rechaza con error 404 si la categoría no existe.
 * @rejects {Object} Rechaza con error 500 si falla la consulta o la integridad de datos.
 */
exports.deleteCategory = (params) => {
  
  const { id_categoria } = params;

  return new Promise((resolve, reject) => {
    // 1. Verificación previa de existencia
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

        // 2. Operación atómica múltiple (Multi-query):
        // a) UPDATE: Rompe la dependencia en 'ejercicio' (SET 0) para permitir el borrado.
        // b) DELETE: Elimina la categoría.
        // IMPORTANTE: Requiere que la conexión BD tenga 'multipleStatements: true'.
        db.query(
          `UPDATE ejercicio SET id_categoria = 0 WHERE id_categoria = ?;
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

/**
 * Modelo: Asignación de categoría a ejercicio con gestión de conflictos.
 * 
 * Valida la existencia de ambas entidades y verifica si existe una asignación previa.
 * Si el ejercicio ya tiene una categoría distinta, gestiona la sobrescritura
 * mediante el flag 'forceReplace'. Devuelve un error 409 (Conflict) si se requiere
 * confirmación explícita del usuario para reemplazar.
 * 
 * @function linkCategoryToExercise
 * @param {Object} params - Parámetros de asignación.
 * @param {number} params.id_categoria - ID de la categoría a asignar.
 * @param {number} params.id_ejercicio - ID del ejercicio a actualizar.
 * @param {boolean} params.forceReplace - Flag para forzar la sobrescritura.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con la confirmación de la actualización.
 * @rejects {Object} Rechaza con error 404 si el ejercicio o la categoría no existen.
 * @rejects {Object} Rechaza con error 409 si hay conflicto de asignación y no se fuerza el reemplazo.
 * @rejects {Object} Rechaza con error 500 si falla la consulta a la base de datos.
 */
exports.linkCategoryToExercise = (params) => {

  const { id_categoria, id_ejercicio, forceReplace } = params;

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia simultánea (Multi-query)
    // Se ejecutan dos SELECTs paralelos para validar IDs antes de operar
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
        // Validación de existencia individual basada en el orden de los resultados ([0] ejercicio, [1] categoría)
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

        // 2. Detección de asignación previa diferente (INNER JOIN)
        // Busca si el ejercicio tiene YA una categoría distinta a la que queremos asignar
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
            // 3. Gestión de Conflicto (Código 409 Conflict)
            // Si hay resultado (tiene otra categoría) Y no es NULL (0) Y no se fuerza el reemplazo -> Error
            if (result.length > 0 && result[0].id_categoria !== 0 && !forceReplace) {
              const categoria_asignada = result[0].nombre_categoria
              // Estilizado del nombre para el mensaje de error al usuario (Capitalizar)
              const categoria_asignada_estilizada = String(categoria_asignada).charAt(0).toUpperCase() + String(categoria_asignada).slice(1).toLowerCase()
              return reject({
                message: "Este ejercicio ya está asignado a la categoría \""+categoria_asignada_estilizada+"\". ¿Desea reemplazarla?",
                statusCode: 409, // 409 Conflict indica que el estado actual impide la acción sin resolución
              });

            }

            // 4. Ejecución de la asignación (Si no hay conflicto o se fuerza el reemplazo)
            // Se verifica nuevamente por seguridad que la relación exacta no exista ya
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
                  // 5. Actualización final de la clave foránea
                  db.query(
                    `UPDATE ejercicio SET id_categoria = ? WHERE id = ?`,
                    [id_categoria, id_ejercicio],
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

/**
 * Modelo: Eliminación de asignación Categoría-Ejercicio (Desvinculación).
 * 
 * Valida la existencia de ambas entidades y verifica que la relación específica
 * exista antes de proceder a "romper" el vínculo. La desvinculación se realiza
 * estableciendo la clave foránea 'id_categoria' a 0 (estado "sin categoría").
 * 
 * @function unlinkCategoryFormExercise
 * @param {Object} params - Objeto con IDs de la relación.
 * @param {number} params.id_categoria - ID de la categoría a desvincular.
 * @param {number} params.id_ejercicio - ID del ejercicio a actualizar.
 * 
 * @returns {Promise<Object>} Promesa que resuelve con la confirmación de la desvinculación.
 * @rejects {Object} Rechaza con error 404 si la entidad o la relación no existen.
 * @rejects {Object} Rechaza con error 500 si falla la consulta a la base de datos.
 */
exports.unlinkCategoryFormExercise = (params) => {

  const { id_categoria, id_ejercicio } = params;

  return new Promise((resolve, reject) => {
    // 1. Verificación de existencia de entidades (Multi-query)
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

      // 2. Verificación de que la relación específica existe
      // Solo se puede desvincular si el ejercicio tiene ASIGNADA esa categoría concreta
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

        // 3. Ejecución de la desvinculación (Reset a 0)
        // Se establece id_categoria = 0, liberando al ejercicio de la categoría
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


/**
 * Modelo: Obtención de todas las asignaciones activas (Vista consolidada).
 * 
 * Realiza una consulta con INNER JOIN para recuperar únicamente los ejercicios
 * que tienen una categoría asignada (excluye los que tienen 0 o NULL).
 * Devuelve una lista plana con los datos de ambas tablas para facilitar su consumo por el frontend.
 * 
 * @function getLinksCategory_Exercise
 * @returns {Promise<Object>} Promesa que resuelve con un array de objetos { id, nombre_ejercicio, id_categoria, nombre_categoria }.
 * @rejects {Object} Rechaza con error 500 si falla la consulta a la base de datos.
 */
exports.getLinksCategory_Exercise = () => {
  return new Promise ((resolve, reject) => {
    // Consulta de unión: Recupera datos combinados de ejercicio y categoría
    // La cláusula WHERE filtra explícitamente ejercicios sin categoría asignada
    db.query(`SELECT ejercicio.id, ejercicio.nombre_ejercicio, categoria.id, categoria.nombre_categoria 
        FROM ejercicio INNER JOIN categoria ON ejercicio.id_categoria = categoria.id
        WHERE ejercicio.id_categoria IS NOT NULL AND ejercicio.id_categoria != 0`, (err, results) => {
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
