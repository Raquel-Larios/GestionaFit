# GestionaFit

> **Repositorio Público para defensa de TFG**
> 
> Proyecto Fin de Grado desarrollado con un enfoque moderno, seguro y escalable para la gestión de entrenamiento personal.

Este repositorio contiene el código fuente completo del proyecto, incluyendo la aplicación frontend, el backend y la configuración de la base de datos. Está diseñado para ser evaluado por el tribunal y para facilitar la implementación local en cualquier entorno compatible.

---

## Tabla de Contenidos
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos del sistema](#requisitos-del-sistema)
- [Instalación y configuración](#instalación-y-configuración)
  - [1. Clonar el Repositorio](#1-clonar-el-repositorio)
  - [2. Instalar Dependencias](#2-instalar-dependencias)
  - [3. Configuración de la Base de Datos](#3-configuración-de-la-base-de-datos)
  - [4. Variables de Entorno](#4-variables-de-entorno)
- [Ejecución de la Aplicación Web](#ejecución-de-la-aplicación-web)
- [Cuentas de Prueba para el Tribunal](#cuentas-de-prueba-para-el-tribunal)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Entorno de Desarrollo](#entorno-de-desarrollo)
- [Consideraciones de Seguridad](#consideraciones-de-seguridad)

---

## Tecnologías Utilizadas
El proyecto ha sido desarrollado y probado rigurosamente utilizando las siguientes herramientas y versiones:

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Backend** | Node.js | v22.16.0 |
| **Gestor de Paquetes** | npm | v11.12.1 |
| **Base de datos** | MySQL | v8.0 (CE) |
| **Gestión BD** | MySQL Workbench | v8.0 CE |
| **Frontend** | Angular | 20 |
| **Entorno Desarrollo** | Visual Studio Code | v1.127.0 |
| **Navegador de Pruebas** | Brave (Motor Chromium) | v1.94.119 (Brave), v152 (Chromium)|

> **Nota sobre Navegadores:** Las pruebas de funcionalidad, responsividad y compatibilidad se han realizado en el navegador **Brave**, el cual utiliza el motor **Chromium**. Esto garantiza compatibilidad total con el estándar **Chrome**, así como con Firefox y Edge.

---

## Requisitos del Sistema

Para ejecutar este proyecto localmente, es necesario contar con:

*  **Sistema Operativo:** Windows, macOS o Linux.
*  **Node.js:** Versión 22.0.0 o superior (se recomienda la v22.16.0).
*  **npm:** Versión 11.0.0 o superior.
*  **MySQL:** Versión 8.0 o superior.
*  **Git:** Para clonar el repositorio.
*  **Visual Studio Code:** Opcional, pero recomendado para la ejecución y edición.
*  **Navegador:** Brave, Chrome, Firefox o Edge.

---

## Instalación y Configuración

### 1. Clonar el Repositorio

Abre una terminal (o el terminal integrado de VS Code) y ejecuta:

```bash
git clone https://github.com/Raquel-Larios/GestionaFit.git
cd GestionaFit
```

### 2. Instalar Dependencias

El proyecto está dividido en dos carpetas principales: `backend` y `frontend`.

**Instalar dependencias del Backend:**
```bash
cd backend
npm install
```

**Instalar dependencias del Frontend**
```bash
cd ../frontend
npm install
```

### 3. Configuración de la Base de Datos

El sistema utiliza **MySQL 8.0**. Necesitarás una instancia de MySQL local (o un contenedor Docker) para que funcione.

1. Inicia MySQL Workbench o tu cliente de consola.
2. Crea una nueva base de datos vacía con el nombre exacto que figure en tu configuración (por defecto `gestionafit_prueba`):
   
   ```sql
   CREATE DATABASE gestionafit_prueba CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   
4. Ejecuta el Script de Inicialización:
   
  **Opción 1:** En la carpeta `scripts/` existe un archivo llamado `init_db.sql`, ejecútalo para crear las tablas y cargar los datos de prueba:
   
  ```bash
  mysql -u tu_usuario -p gestionafit_prueba < scripts/init_db.sql
  ```
  **Opción 2:** Abre el archivo `init_db.sql` en un editor de texto, copia todo su contenido, pégalo en tu archivo Query de MySQL Workbench y ejecuta la consulta.

  **Opción 3:** Abre el archivo `init_db.sql` desde tu conexión de MySQL WorkBench. (File → Open SQL Script)

### 4. Variables de Entorno
> **Importante:** Las credenciales de acceso a la base de datos reales y claves secretas **NO** están en este repositorio por seguridad.

1. Ve a la carpeta `backend/`
2. Busca el archivo `.env.example`.
3. Cópialo y renómbralo a `development.env`:
   ```bash
   cp .env.example development.env
   ```
4. Crea una carpeta `env` y mueve `development.env` dentro de la carpeta `env`:
   ```bash
   mkdir env
   mv development.env env/
   ```
5. Abre el archivo `development.env` en **Visual Studio Code** y edita las credenciales con tus datos locales:
   ```text
   # Base de Datos
   DB_HOST="localhost"
   DB_USER="tu_usuario_mysql"
   DB_PASSWORD="tu_contraseña_mysql"
   DB_NAME="gestionafit_prueba"

   # Servidor
   PORT=3000

   # Autenticación (JWT)
   # Genera una clave secreta aleatoria y segura. Ejemplo:
   # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   JWT_SECRET="tu_clave_secreta"

   # Servicio de Mensajería
   # Se ha usado el servidor de la UPM exclusivamente durante la fase de desarrollo y pruebas, en la     fase de despliegue el servidor cambiará y se utilizará un correo con dominio propio creado ex         profeso para la aplicación.
   # Usuario: tu correo institucional con dominio '@upm.es' o '@alumnos.upm.es'
   # Contraseña: tu contraseña vinculada a ese correo o una App-Password si la UPM lo requiere.
   MAIL_USER="tu_correo_institucional"
   MAIL_PASS="tu_contraseña"
   ```
> **Nota de Seguridad:** Los archivos `.env` están incluidos en el archivo `.gitignore`, por lo que no se subirá al repositorio público. Si no configuras correctamente `MAIL_USER` y `MAIL_PASS`, las funcionalidades de envío de correo no funcionarán, pero el resto de la aplicación sí.

---

## Ejecución de la Aplicación Web

Una vez configurado todo, puedes ejecutar la aplicación en dos terminales separadas.

### Paso 1: Iniciar el Backend

En la primera terminal (en la carpeta `backend/`):
```bash
npm run dev
# npm start dará error porque todavía no se ha preparado para modo producción
```
*El servidor backend se iniciará en `http://localhost:3000`.*

### Paso 2: Iniciar el Frontend

En una segunda terminal (en la carpeta `frontend/`):
```bash
ng serve
#Si este comando da error es que no está instalada la CLI de Angular de modo global.
#Si se diese el caso ve a la carpeta raíz del proyecto y ejecuta: npm install -g @angular/cli
#Si después de ejecutar el comando anterior sigue sin reconocer el comando ng, asegúrate de que la carpeta donde se encuentran los archivos binarios de npm está incluida en el path de tus variables de entorno. 
```
*La aplicación se iniciará en `http://localhost:4200`.*

**Para acceder al sistema:**
1. Abre uno de los navegadores mencionados en el apartado de [requisitos](#requisitos-del-sistema).
2. Navega a la URL que aparezca en la consola (generalmente `http://localhost:4200`).
3. Verás la pantalla de welcome.

---

## Cuentas de Prueba para el Tribunal

Para facilitar la demostración y las pruebas del tribunal, se han creado cuentas preconfiguradas con acceso a diferentes roles.

> **Seguridad:** Las contraseñas de estas cuentas son genéricas y **no** corresponden a datos reales de usuarios. Todas las contraseñas están cifradas en la base de datos mediante `bcrypt`.

| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| Administrador/ Entrenador | admin_prueba@demo.com | AdminPass123 | Acceso total al sistema (gestión de clientes, rutinas, recursos, etc). |
| Cliente 1 | cliente1_prueba@demo.com | ClientePass123 | Acceso limitado para ver sus rutinas, progreso y recursos específicos de sus rutinas. |
| Cliente 2 | cliente2_prueba@demo.com | ClientePass456 | Acceso limitado para ver sus rutinas, progreso y recursos específicos de sus rutinas.

> **Nota de aislamiento de datos:** Se proporcionan dos cuentas de cliente para validar que la aplicación cumple con la privacidad de datos: cada usuario solo visualiza las rutinas e información asignadas exclusivamente a su perfil, asegurando que el acceso se filtre correctamente según la identidad del usuario.

**Instrucciones para el Tribunal:**
1. Abre uno de los navegadores mencionados en el apartado de [requisitos](#requisitos-del-sistema).
2. Accede a la URL de la aplicación (`http://localhost:4200`).
3. Ingresa el **Email** y la **Contraseña** de la tabla anterior.
4. Explora las funcionalidades correspondientes a cada rol.

## Estructura del Proyecto

El repositorio está organizado de la siguiente manera para facilitar el mantenimiento y la escalabilidad:

```text
GestionaFit/
├── backend/                     # Servidor Node.js + Express
│   ├── controllers/             # Controladores
|   ├── database/                # Scripts para la BD
|   ├── env/                     # (Oculto en git) Variables de entorno locales
|   ├── middleware/              # Scripts de validación, autenticación, generador de contraseñas y servicio de mensajería
|   ├── models/                  # Modelos
|   ├── routes/                  # Rutas + Index
|   ├── .env.example             # Plantilla de configuración pública
|   ├── app.js                   # Código de inicialización
|   ├── package-lock.json
|   └── package.json
├── frontend/
|   ├── .angular/
|   ├── .vscode/
|   ├── public/
|   ├── src/                     # Código fuente de Angular
|   |   ├── app/                 # Configuración, estilos y lógica de arranque de la aplicación
|   |   ├── assets/              # Imágenes, interfaces y scripts
|   |   ├── core/                # Elementos estáticos (guards, interceptors y layout)
|   |   ├── shared/              # Servicios, componentes UI reutilizables (atómicos y modulares) y utilidades
|   |   ├── views/               # Vistas de cada pantalla
|   |   ├── index.html           # HTML principal
|   |   ├── main.ts              # Lógica de arranque
|   |   └── styles.css           # Estilos CSS globales 
|   ├── .editorconfig
|   ├── .gitignore
|   ├── angular.json
|   ├── package-lock.json
|   ├── package.json
|   ├── tsconfig.app.json
|   ├── tsconfig.json
|   └── tsconfig.spec.json
├── scripts
|   └── init_db.sql              # Inicialización de la base de datos de prueba
├── .gitignore                   # Archivos excluidos del repositorio
├── package-lock.json
└── README.md                    # Documentación principal
```

## Entorno de Desarrollo

El proyecto ha sido desarrollado íntegramente utilizando:

* **MySQL Workbench v8.0 CE:** Herramienta oficial para la gestión y administración de la base de datos MySQL (creación de esquemas, ejecución de consultas, etc.).
* **Visual Studio Code v1.127.0:** Con extensiones recomendadas para desarrollo en Node.js, TypeScript y Angular.
* **Brave Browser:** Navegador principal para pruebas de UI/UX y depuración. Al estar basado en **Chromium**, garantiza que cualquier problema de renderizado o compatibilidad detectado en Brave será compatible con Chrome, Edge y Safari.

## Consideraciones de Seguridad

* **Contraseñas**: Todas las contraseñas de usuario se almacenan cifradas en la base de datos utilizando el algoritmo `bcrypt`.
* **Varibles de Entorno:** Las credenciales de la base de datos nunca se exponen en el código fuente.
* **Autenticación:** El sistema utiliza tokens JWT (JSON Web Tokens) para gestionar las sesiones de forma segura.
