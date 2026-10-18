require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_URL = 'https://api.themoviedb.org/3/search/movie';

app.use(express.static('public'));

app.get('/api/buscar', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Escribe el título de una película.' });

  const clave = process.env.TMDB_API_KEY;
  if (!clave) return res.status(500).json({ error: 'El servidor no tiene configurada la clave de TMDB.' });

  const url = `${TMDB_URL}?api_key=${clave}&language=es-MX&include_adult=false&query=${encodeURIComponent(q)}`;

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

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
