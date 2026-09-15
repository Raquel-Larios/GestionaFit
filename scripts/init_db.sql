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
INSERT INTO usuario (email, nombre, apellidos, contraseña, isPassGenerated, foto_perfil, rol) VALUES
("admin_prueba@demo.com", "admin", "administrador", "$2b$10$Yjh/GN7J3Ye4Q46GOn/hGu1jSXTYM5xxulnGof0GBVP7t2o5gZVgK", false, "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", 1), 
("cliente1_prueba@demo.com", "cliente", "primero", "$2b$10$L4tdupA8nQtIB7N1pvaKnOiVagfbOTmE42PsYBB4z5e3g6UGfHYQG", false, "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", 0), 
("cliente2_prueba@demo.com", "cliente", "segundo", "$2b$10$Tb4z69zIUt6vBAEjy/hBXOD5zNAcEXmFx4gHdJRxwMQXa0mJOUlZ6", false, "iVBORw0KGgoAAAANSUhEUgAAAC8AAAAvCAYAAABzJ5OsAAAHIElEQVR4AaxXS2wVVRj+p/SWQkFaKmDqq9qEgo+F6BY0iomKj2hUIppIJCxZsjHujGxc6EI2CsrCQAgLg49oxBiCcWFUiCYWQbEIgqHl0VpKoeUy/o/z+M+ZM/cOhZuZc/7/e/znn8edubflwc0H8uu2v3e1tfY3XHtFk95aYJqfPOXLEEwSiNst4MlgieLcmAWYdvNZcS1BSgmhoRlvZFWmaTdfpXg1TXApqlmM6hqbn/7CZn2cpn8pTPMVm8hjnSwco9hRtJUryhmARhwtYJqXJghwe8qZJXRoSKNI4CZlyhXlDIRfDykE+mOa15A54kZVQ7lkieJEZPr8lWhI13RP9JNs3umuZjFrKngsge2pUB8TMle/4TrJ5hGXYnoxQZqPkcfVwgA37490nqgYoT/ZPOIVK1iZb8tHwlEtxjDATcBKI7vcBZIsNIbNpxRGTxTt5hthUJly9dVKNchYLtrqI7tc5eC7Y4qEzYse+7Mr2Rm4iNAyAn+E1wjDqcGJxJOSNMZcASfj5nN3cQzuHone4JZ0AWk9T1m1vZknWCDuLFiCm8/4vAY4msIimaUpCCnLXKeZFpBStIzPBNMjN68BG2d8QGQ3CIa4SZLJ5HJJYUFHK2xc3gM71yyGPa/dBXvX3807xTtfWgwbV/RAb2e7UTefzDKlwnTzritlxzD+0iDkCr94bze8/2wfrFrSBYs6alCb4VmKF82pwar+Ltj8TC+sXbbA+RoFro0SUbr5EjHw1YDCZ939C2HdAwuhc1ZrgYuBjrYZ8Pw93fD00vkxVcj94eMzJGLpwNLNa1dkitNlPR3weH8nzGxt4UOjokfOXIR3vv8Xnth2EF7Yfgi2/DQEJ8em8HuEbqw9Z+YMeGppF8yutSDQaKNqwqMNA59jIn9G5MdiSBBZZafbpLujxlKqsP/Eedjw2SDsHjgLF6auwPD4Zfj4wDC8/tXfcGzkEpw6PwV7jozClh+HmGdjNFAdgaRliWn0OUVy6BTxeSOB3n0ZjcopBLh1XhssWTDLOUcnLsPug+fgwuQVlmv3UWz81V1/wmq8Em99+w/8cHyMNfFAHm4nIHKQExyAcuaLYisqYQzcN78d5uItYNVnJ+qwb/A/sEeTUScQf9Bs8dwGXoOsT1yUgXv1OAykeZWrsFhYkRzObmuBWksG9jMyMWVDmS0VlyKcsEJHBIrVXl2TJSe5bYhSPklpBYrK95vm1qBVPRJLlalSKQwUqMLkgWC/LbjLmiR2CXAZlQI9rPDOw9lv5/A2qddRRV4PTzvCSmlvqj5i6qKjDwEc3RammOW4OxZg7GId6vRNMqt2zpKnjpI0DY2VdUF1TTBbHPxto7gyX3yLHjo9ASN4ANZKPw9W9s2zqZnj62VgMyUbpgYCwoijKdk8+6hAJI7T46OT8PvwhLsl6eVDL6zZNV02w1swh97OmbD1uT745JV+ePPR20AfpFsqMyvY2aR6Yi0P0OBpk2mLxMYjiRn3/jUKI/h8p5Qsy26eA+8+eYdrjq7Gy/cthE2P3Q53drdDF/6EWN57A6zFnxN0QIAf8uEUbKm1SMCPX2PgU6SFOiax3o1HQ/Dd4Bh8ji+mS5flxUSaxTe2wxsP38K/KHet6Yf12GjP3Dawt91kvQ7f/DECR/HFFRSrktACRsfNU26bpthw1SY0bPl5CLbtH4axS3X2cC3EOXEDoriNT9Zh569n4CPUOyoRFOzu5vRibp7SQIyLEOb2ODeEhcm745fTsOHTQfji0DkYwt8v/Ag1uil8nJ4an4Kv8Wxv/PIY/64hj6ErTkWHaz6oEOvi3IhjmG6Dt/edhNU7DsMjWwfgoQ9+433lhwOwevth2LT3BAwMjbvbx5SpPtmzZRzp5g15vSb3J4YXjw85tQoJaY+4yFpsXnsopt3UUKFBookFPAREDmZVmnJ6Vwd0lKCA9SSOKEyJxYm3YvPKwy9UlauQzYWBBTwEVIDgsy7IAyUljVlS2AMoNq9YLkOvf8Ki3RaI4Aqpu4kqaGNJHlyTdPPctTHah7NJ7aQlFpM5lykeFVzujU0qZ3/odM0z57QqU6GlE5ClcA4XQEC2ErhxLbHymPC75kNOZRyGS9CFt4idm30NqQGvpUwctrzl7EwKHVPOuwJd80yUDryEYjO+9wjIaODdR5xWGJwDA9zYYWdKdEw57wo0zcvhyMiScCglQllZZu28rk3KxA3x0Gya57LubMoFNVVIL3QAR4kRpydrZzZIGOGBluFADSlM0eD/BmqUH/DGqhfDZ7SXIZHnYFQerhh5n49iK67gIFGFSPg30EpZw4NFzKwxLIePUY0YEU7IJX4FImG2XF1lqSCjoStNWYM/I+A/6feUXy73Uo5ybs3zDAYHE3OicGPuIhekHOaed5pkgCc4xKPiceE4F3MaFc6OpjBLTWwpM+d0Evhs5vA/AAAA//+g6SbFAAAABklEQVQDANNAJzOXDCOqAAAAAElFTkSuQmCC", 0);

-- 2. Cargar datos base
INSERT INTO plantilla (nombre_plantilla) VALUES 
("calentamiento"), 
("prueba"), 
("ejercicios varios"),
("prueba 2"); 

SET SESSION sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

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

INSERT INTO variacion (id_historial, id_ejercicio, id_plantilla, id_usuario, series, repeticiones, carga, RPE) VALUES
(3, 1, 1, 3, 2, 3, 10, 4),
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