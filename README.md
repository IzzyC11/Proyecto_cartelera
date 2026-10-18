# Cartelera: buscador de películas

App web que busca películas por título usando la API de [TMDB](https://www.themoviedb.org/) y muestra póster, año, calificación y sinopsis. El frontend nunca ve la clave de la API: las peticiones pasan por un backend Express que la lee desde variables de entorno.

## Requisitos
- Node.js 18 o superior
- Una clave de API de TMDB (gratuita): themoviedb.org → Configuración → API

## Cómo ejecutarla
1. Clona el repositorio e instala dependencias:
   ```bash
   git clone <URL-DE-TU-REPO>
   cd buscador-peliculas
   npm install
   ```
2. Crea tu archivo `.env` a partir de la plantilla y pega tu clave:
   ```bash
   cp .env.example .env
   ```
   ```
   TMDB_API_KEY=tu_clave_real
   PORT=3000
   ```
3. Inicia el servidor:
   ```bash
   npm start
   ```
4. Abre http://localhost:3000

> El archivo `.env` está en `.gitignore`: la clave nunca se sube al repositorio.

## Manejo de errores
- Sin conexión a internet: la app avisa que no hay red.
- Servidor o TMDB inaccesibles: mensaje claro de que no se pudo conectar.
- Búsqueda vacía: pide escribir un título.
- Sin resultados: indica que no se encontró nada y sugiere probar otro título.
- Límite de peticiones (HTTP 429): avisa que hay demasiadas peticiones y que se espere un momento.
- Clave inválida o faltante: el servidor informa el problema sin exponer la clave.

## Declaración de uso de IA
Herramientas de IA usadas:

Claude (claude.ai)
Antigravity CLI (en la terminal de Visual Studio Code)

Para qué usé cada una:

Claude: generar la versión inicial del proyecto (servidor Express, ruta que consulta TMDB y estructura base del frontend), proponer el manejo de errores, guiarme para obtener la clave de TMDB y para usar Git y GitHub.
Antigravity CLI: mejorar el diseño del frontend (HTML y CSS).[por ejemplo: cambiar la paleta de colores, mejorar las tarjetas, hacer la interfaz responsiva.]

Lo que hice yo sin ayuda de IA:

Elegí el tema del proyecto y la API.
Creé mi cuenta de TMDB, obtuve mi API key y configuré mi archivo .env.
Instalé y ejecuté el proyecto, y probé los casos de error.
Elegí las decisiones de diseño del frontend.
Creé el repositorio en GitHub, hice los commits y los subí con git push.
Detecté que mi .env.example había quedado con la clave real y lo corregí, dejando solo texto de plantilla.

Nota sobre el código: la base del servidor y del frontend fue generada con ayuda de IA; mi parte fue configurarla, probarla, dirigir el diseño y subirla al repositorio. Los prompts, respuestas y correcciones están en mi bitácora de programación con IA.
