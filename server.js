require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_BASE = 'https://api.themoviedb.org/3';

app.use(express.static('public'));

/* ── Búsqueda de películas ───────────────────────────────── */
app.get('/api/buscar', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Escribe el título de una película.' });

  const clave = process.env.TMDB_API_KEY;
  if (!clave) return res.status(500).json({ error: 'El servidor no tiene configurada la clave de TMDB.' });

  const url = `${TMDB_BASE}/search/movie?api_key=${clave}&language=es-MX&include_adult=false&query=${encodeURIComponent(q)}`;

  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (r.status === 401) return res.status(500).json({ error: 'La clave de TMDB no es válida.' });
    if (r.status === 429) return res.status(429).json({ error: 'Demasiadas peticiones. Espera un momento e inténtalo de nuevo.' });
    if (!r.ok) return res.status(502).json({ error: `TMDB respondió con un error (${r.status}).` });

    const data = await r.json();
    const peliculas = (data.results || []).map((p) => ({
      id: p.id,
      titulo: p.title,
      anio: (p.release_date || '').slice(0, 4),
      calificacion: p.vote_average,
      sinopsis: p.overview,
      poster: p.poster_path ? `https://image.tmdb.org/t/p/w342${p.poster_path}` : null
    }));
    res.json({ peliculas });
  } catch (err) {
    console.error('Error al consultar TMDB:', err.message);
    res.status(502).json({ error: 'No se pudo conectar con TMDB. Revisa tu conexión.' });
  }
});

/* ── Detalles de una película por ID ─────────────────────── */
app.get('/api/pelicula/:id', async (req, res) => {
  const id    = parseInt(req.params.id, 10);
  const clave = process.env.TMDB_API_KEY;

  if (!id || isNaN(id)) return res.status(400).json({ error: 'ID de película inválido.' });
  if (!clave)           return res.status(500).json({ error: 'El servidor no tiene configurada la clave de TMDB.' });

  const url = `${TMDB_BASE}/movie/${id}?api_key=${clave}&language=es-MX&append_to_response=credits`;

  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (r.status === 401) return res.status(500).json({ error: 'La clave de TMDB no es válida.' });
    if (r.status === 404) return res.status(404).json({ error: 'Película no encontrada.' });
    if (r.status === 429) return res.status(429).json({ error: 'Demasiadas peticiones. Espera un momento.' });
    if (!r.ok)            return res.status(502).json({ error: `TMDB respondió con un error (${r.status}).` });

    const p = await r.json();

    // Extraer director y actores principales del cast
    const director = (p.credits?.crew || []).find(c => c.job === 'Director')?.name || null;
    const reparto  = (p.credits?.cast || []).slice(0, 5).map(c => c.name);

    res.json({
      id:           p.id,
      titulo:       p.title,
      titulo_orig:  p.original_title !== p.title ? p.original_title : null,
      tagline:      p.tagline || null,
      anio:         (p.release_date || '').slice(0, 4),
      fecha:        p.release_date || null,
      duracion:     p.runtime || null,
      calificacion: p.vote_average,
      votos:        p.vote_count,
      sinopsis:     p.overview,
      generos:      (p.genres || []).map(g => g.name),
      idioma:       p.original_language,
      pais:         (p.production_countries || [])[0]?.name || null,
      poster:       p.poster_path    ? `https://image.tmdb.org/t/p/w500${p.poster_path}`    : null,
      backdrop:     p.backdrop_path  ? `https://image.tmdb.org/t/p/w1280${p.backdrop_path}` : null,
      director,
      reparto,
      tmdb_url:     `https://www.themoviedb.org/movie/${p.id}`
    });
  } catch (err) {
    console.error('Error al obtener detalles:', err.message);
    res.status(502).json({ error: 'No se pudo conectar con TMDB. Revisa tu conexión.' });
  }
});

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
