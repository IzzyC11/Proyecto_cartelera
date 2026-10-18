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
- Sin conexión a internet (cliente) o sin acceso a TMDB (servidor)
- Búsqueda vacía y resultados vacíos
- Límite de peticiones (HTTP 429) y clave inválida o faltante

## Declaración de uso de IA
> Completa esta sección con lo que realmente hiciste.

**Herramientas de IA usadas:** Claude (claude.ai) [agrega aquí otras, si usaste: ChatGPT, Copilot, Cursor, etc.]

**Para qué usé cada una:**
- Claude: [ej. generar la estructura inicial del proyecto, proponer el manejo de errores, explicar errores, redactar el README]

**Lo que hice sin ayuda de IA:** [ej. sacar mi clave de TMDB, configurar el .env, hacer los commits, probar la app, ajustar estilos, ...]
