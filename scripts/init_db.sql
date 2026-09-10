-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN TFG GESTIONAFIT
-- ============================================================================
-- Instrucciones:
-- 1. Abre MySQL Workbench o tu consola.
-- 2. Crea la base de datos: CREATE DATABASE gestionafit_prueba;
-- 3. Ejecuta este archivo: mysql -u tu_usuario -p gestionafit_prueba < scripts/init_db.sql
-- ============================================================================
CREATE DATABASE IF NOT EXISTS gestionafit_prueba
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE gestionafit_prueba;

-- 1. Crear tablas si no existen
CREATE TABLE IF NOT EXISTS usuario(
id INT AUTO_INCREMENT UNIQUE NOT NULL,
email varchar(60) UNIQUE NOT NULL,
nombre varchar(60) NOT NULL,
apellidos varchar(100) NOT NULL,
contraseña varchar(60) NOT NULL,
isPassGenerated BOOLEAN DEFAULT TRUE, -- True = 1 y False = 0
foto_perfil TEXT,
peso FLOAT,
rol INT NOT NULL DEFAULT 0, -- rol = 1 := admin y rol = 0 := cliente
CHECK(rol = 1 OR rol = 0),
CHECK(email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.(com|es)$'),
CHECK(peso > 0),
CHECK(isPassGenerated = 1 OR isPassGenerated = 0),

PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS plantilla (
id INT AUTO_INCREMENT UNIQUE NOT NULL,
nombre_plantilla varchar(50) NOT NULL,

PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS categoria(
id INT AUTO_INCREMENT UNIQUE NOT NULL,
nombre_categoria varchar(50) NOT NULL,

PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS ejercicio(
id INT AUTO_INCREMENT UNIQUE NOT NULL,
nombre_ejercicio varchar(50) NOT NULL,
id_categoria INT DEFAULT 0,

PRIMARY KEY(id),
FOREIGN KEY(id_categoria) REFERENCES categoria(id)
);

CREATE TABLE IF NOT EXISTS video(
id INT AUTO_INCREMENT UNIQUE NOT NULL,
nombre_video varchar(60) NOT NULL,
enlace_video TEXT NOT NULL,

PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS material(
id INT AUTO_INCREMENT UNIQUE NOT NULL,
nombre_material varchar(50) NOT NULL,
contenido TEXT NOT NULL,

PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS demostracion(
id_ejercicio INT NOT NULL,
id_video INT NOT NULL,

PRIMARY KEY(id_ejercicio, id_video),
FOREIGN KEY(id_ejercicio) REFERENCES ejercicio(id),
FOREIGN KEY(id_video) REFERENCES video(id)
);

CREATE TABLE IF NOT EXISTS historial_plantilla_usuario(
id INT AUTO_INCREMENT UNIQUE NOT NULL,
id_plantilla INT NOT NULL,
id_usuario INT NOT NULL,
fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

PRIMARY KEY(id),
FOREIGN KEY(id_plantilla) REFERENCES plantilla(id),
FOREIGN KEY(id_usuario) REFERENCES usuario(id)
);

CREATE TABLE IF NOT EXISTS defecto(
id_plantilla INT NOT NULL,
id_ejercicio INT NOT NULL,
series INT,
repeticiones INT,
carga FLOAT,
RPE INT,
CHECK(RPE BETWEEN 1 AND 10),
CHECK(series >= 0),
CHECK(repeticiones >= 0),
CHECK(carga >= 0),

PRIMARY KEY(id_plantilla, id_ejercicio),
FOREIGN KEY(id_plantilla) REFERENCES plantilla(id),
FOREIGN KEY(id_ejercicio) REFERENCES ejercicio(id)
);

CREATE TABLE IF NOT EXISTS variacion(
id_historial INT,
id_plantilla INT NOT NULL,
id_usuario INT NOT NULL,
id_ejercicio INT NOT NULL,
fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
series INT,
repeticiones INT,
carga FLOAT,
RPE INT,
CHECK(RPE BETWEEN 1 AND 10),
CHECK(series >= 0),
CHECK(repeticiones >= 0),
CHECK(carga >= 0),

PRIMARY KEY(id_plantilla, id_usuario, id_ejercicio, fecha),
FOREIGN KEY(id_plantilla) REFERENCES plantilla(id),
FOREIGN KEY(id_usuario) REFERENCES usuario(id),
FOREIGN KEY(id_historial) REFERENCES historial_plantilla_usuario(id) ON DELETE SET NULL,
FOREIGN KEY(id_ejercicio) REFERENCES ejercicio(id)
);

CREATE TABLE IF NOT EXISTS lectura(
id_usuario INT NOT NULL,
id_plantilla INT NOT NULL,
id_ejercicio INT NOT NULL,
id_historial INT,
fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
series INT,
repeticiones INT,
carga FLOAT,
RPE INT,
CHECK(RPE BETWEEN 1 AND 10),
CHECK(series >= 0),
CHECK(repeticiones >= 0),
CHECK(carga >= 0),

PRIMARY KEY(id_usuario, id_plantilla, id_ejercicio, fecha),
FOREIGN KEY(id_usuario) REFERENCES usuario(id),
FOREIGN KEY(id_plantilla) REFERENCES plantilla(id),
FOREIGN KEY(id_ejercicio) REFERENCES ejercicio(id),
FOREIGN KEY(id_historial) REFERENCES historial_plantilla_usuario(id) ON DELETE SET NULL
);

-- 2. Cargar usuarios de prueba
INSERT INTO usuario (email, nombre, apellidos, contraseña, isPassGenerated, rol) VALUES
("admin_prueba@demo.com", "admin", "administrador", "$2b$10$Yjh/GN7J3Ye4Q46GOn/hGu1jSXTYM5xxulnGof0GBVP7t2o5gZVgK", false, 1), 
("cliente1_prueba@demo.com", "cliente", "primero", "$2b$10$L4tdupA8nQtIB7N1pvaKnOiVagfbOTmE42PsYBB4z5e3g6UGfHYQG", false, 0), 
("cliente2_prueba@demo.com", "cliente", "segundo", "$2b$10$Tb4z69zIUt6vBAEjy/hBXOD5zNAcEXmFx4gHdJRxwMQXa0mJOUlZ6", false, 0);

-- 2. Cargar datos base
INSERT INTO plantilla (nombre_plantilla) VALUES 
("calentamiento"), 
("prueba"), 
("ejercicios varios") 
("prueba 2"); 

INSERT INTO categoria (id, nombre_categoria) VALUES
(0, "sin agrupar");

INSERT INTO categoria (nombre_categoria) VALUES 
("fuerza explosiva"), 
("fuerza de resistencia"),
("fuerza isométrica"), 
("fuerza dinámica"), 
("fuerza máxima"), 
("flexibilidad"), 
("fuerza isotónica"); 

INSERT INTO ejercicio (nombre_ejercicio, id_categoria) VALUES 
("peso muerto", 1),
("plancha", 3),
("flexiones", 7),
("sentadillas", 3),
("estiramiento de isquiotibiales sentado", 6);

INSERT INTO video (nombre_video, enlace_video) VALUES
("estiramiento de isquiotibiales sentado", "https://www.youtube.com/watch?v=FyNxSg4YyDA"),
("plancha", "https://www.youtube.com/watch?v=hAqEhJb9oDs&pp=ygURcGxhbmNoYSBhYmRvbWluYWw%3D"),
("flexiones", "https://youtube.com/shorts/cWrJFIdTje0");

INSERT INTO material (nombre_material, contenido) VALUES 
("tabla rpe", "https://imgs.search.brave.com/d63JDd7YAfUDKFYUVJnkxRskkIZovedrwReEuhuWMwI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9lc2N1/ZWxhMnJvZGVzLmNv/bS93cC1jb250ZW50/L3VwbG9hZHMvMjAy/MS8wMi9SUEUzd2Vi/LmpwZw");

INSERT INTO demostracion (id_ejercicio, id_video) VALUES
(5, 1),
(2, 2),
(3, 3);

INSERT INTO historial_plantilla_usuario (id_plantilla, id_usuario) VALUES
(2, 2), 
(3, 3), 
(1, 3); 

INSERT INTO defecto (id_plantilla, id_ejercicio, series, repeticiones, carga, RPE) VALUES
(1, 1, 2, 3, 10, 4),
(1, 2, 1, 2, 2, 3),
(1, 5, 3, 6, 0, 1),
(2, 1, 5, 4, 0, 7),
(3, 2, 3, 4, 0, 1),
(4, 2, 2, 3, 5, 5),
(4, 4, 3, 10, 8, 2);

INSERT INTO variacion (id_historial, id_ejericicio, id_plantilla, id_usuario, series, repeticiones, carga, RPE) VALUES
(3, 1, 1, 3, 3, 10, 4),
(3, 2, 1, 3, 1, 2, 2, 3),
(3, 5, 1, 3, 3, 6, 0, 1),
(1, 1, 2, 2, 5, 4, 0, 7),
(2, 2, 3, 3, 3, 4, 0, 1);

INSERT INTO lectura (id_usuario, id_plantilla, id_ejercicio, id_historial, series, repeticiones, carga, RPE) VALUES
(2, 2, 1, 1, 5, 3, 0, 5),
(3, 1, 1, 3, 2, 2, 0, 3),
(3, 1, 2, 3, 0, 0, 0, 1),
(3, 1, 5, 3, 0, 0, 0, 1),
(3, 3, 2, 2, 2, 3, 0, 1);