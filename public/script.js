/* ── Referencias DOM ──────────────────────────────────────── */
const formulario = document.getElementById('formulario');
const consulta   = document.getElementById('consulta');
const mensaje    = document.getElementById('mensaje');
const resultados = document.getElementById('resultados');
const boton      = document.getElementById('btn-buscar');

/* ── Chips de sugerencias rápidas ─────────────────────────── */
document.querySelectorAll('.chip-sugerencia').forEach(chip => {
  chip.addEventListener('click', () => {
    consulta.value = chip.dataset.q;
    formulario.requestSubmit();
  });
});

/* ── Helpers de UI ─────────────────────────────────────────── */

function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.className   = esError ? 'error' : '';
}

function setLoading(activo) {
  boton.disabled = activo;
  document.body.classList.toggle('cargando', activo);
  boton.setAttribute('aria-busy', activo);
}

/** Clase CSS de color según calificación (0-10). */
function claseNota(nota) {
  if (nota >= 7) return 'alta';
  if (nota >= 5) return 'media';
  return 'baja';
}

/** 8 tarjetas esqueleto mientras se carga la búsqueda. */
function mostrarSkeletons(n = 8) {
  resultados.replaceChildren(
    ...Array.from({ length: n }, () => {
      const s = document.createElement('div');
      s.className = 'skeleton';
      s.innerHTML = `
        <div class="skeleton-poster"></div>
        <div class="skeleton-info">
          <div class="skeleton-line"></div>
          <div class="skeleton-line corta"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>`;
      return s;
    })
  );
}

/* ── Construcción de tarjeta ───────────────────────────────── */

function crearTarjeta(p) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta';
  tarjeta.setAttribute('role', 'button');
  tarjeta.setAttribute('tabindex', '0');
  tarjeta.setAttribute('aria-label', `Ver detalles de ${p.titulo}`);
  tarjeta.dataset.id = p.id;

  // Póster
  if (p.poster) {
    const img = document.createElement('img');
    img.src      = p.poster;
    img.alt      = `Póster de ${p.titulo}`;
    img.loading  = 'lazy';
    img.decoding = 'async';
    tarjeta.appendChild(img);
  } else {
    const vacio = document.createElement('div');
    vacio.className   = 'sin-poster';
    vacio.textContent = 'Sin póster';
    tarjeta.appendChild(vacio);
  }

  // Info
  const info = document.createElement('div');
  info.className = 'info';

  const titulo = document.createElement('h2');
  titulo.textContent = p.titulo;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.setAttribute('aria-label', 'Metadatos');

  const badgeAnio = document.createElement('span');
  badgeAnio.className   = 'badge badge-anio';
  badgeAnio.textContent = p.anio || 'S/F';

  const badgeNota = document.createElement('span');
  if (p.calificacion) {
    badgeNota.className = `badge badge-nota ${claseNota(p.calificacion)}`;
    badgeNota.innerHTML = `⭐ ${p.calificacion.toFixed(1)}`;
    badgeNota.setAttribute('aria-label', `Calificación: ${p.calificacion.toFixed(1)} de 10`);
  } else {
    badgeNota.className   = 'badge badge-nota';
    badgeNota.textContent = 'Sin nota';
  }

  meta.append(badgeAnio, badgeNota);

  const sinopsis = document.createElement('p');
  sinopsis.className   = 'sinopsis';
  sinopsis.textContent = p.sinopsis || 'Esta película aún no tiene sinopsis en español.';

  info.append(titulo, meta, sinopsis);
  tarjeta.appendChild(info);

  // Abrir modal al hacer click o teclado
  tarjeta.addEventListener('click', () => abrirModal(p.id));
  tarjeta.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirModal(p.id); }
  });

  return tarjeta;
}

/* ── Submit del buscador ───────────────────────────────────── */

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = consulta.value.trim();
  if (!q) return mostrarMensaje('Escribe el título de una película.', true);

  if (!navigator.onLine) {
    resultados.replaceChildren();
    return mostrarMensaje('Sin conexión a internet. Revisa tu red e inténtalo de nuevo.', true);
  }

  setLoading(true);
  mostrarSkeletons();
  mostrarMensaje('Buscando…');

  try {
    const resp  = await fetch(`/api/buscar?q=${encodeURIComponent(q)}`);
    const datos = await resp.json();

    if (!resp.ok) {
      resultados.replaceChildren();
      return mostrarMensaje(datos.error || 'Ocurrió un error inesperado.', true);
    }

    if (!datos.peliculas || datos.peliculas.length === 0) {
      resultados.replaceChildren();
      return mostrarMensaje(`No encontramos resultados para "${q}". Prueba con otro título.`);
    }

    mostrarMensaje(`${datos.peliculas.length} resultado(s) para "${q}"`);
    resultados.replaceChildren(...datos.peliculas.map(crearTarjeta));

  } catch {
    resultados.replaceChildren();
    mostrarMensaje('No se pudo contactar al servidor. ¿Está encendido?', true);
  } finally {
    setLoading(false);
  }
});

/* ── Modal de detalles ─────────────────────────────────────── */

const modal         = document.getElementById('modal');
const modalBackdrop = modal.querySelector('.modal-backdrop');
const modalLoading  = document.getElementById('modal-loading');
const modalError    = document.getElementById('modal-error');
const modalCerrar   = document.getElementById('modal-cerrar');
const elCuerpo      = modal.querySelector('.modal-cuerpo');

// Elementos de contenido
const elBackdropImg = document.getElementById('modal-backdrop-img');
const elPoster      = document.getElementById('modal-poster');
const elSinPoster   = document.getElementById('modal-sin-poster');
const elTagline     = document.getElementById('modal-tagline');
const elTitulo      = document.getElementById('modal-titulo');
const elTituloOrig  = document.getElementById('modal-titulo-orig');
const elBadges      = document.getElementById('modal-badges');
const elGeneros     = document.getElementById('modal-generos');
const elSinopsis    = document.getElementById('modal-sinopsis');
const elFicha       = document.getElementById('modal-ficha');
const elTmdbLink    = document.getElementById('modal-tmdb-link');

let tarjetaFoco = null; // para devolver el foco al cerrar

function abrirModal(id) {
  tarjetaFoco = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  // Estado: cargando
  modalLoading.classList.add('visible');
  elCuerpo.hidden     = true;
  modalError.hidden   = true;

  modalCerrar.focus();

  fetch(`/api/pelicula/${id}`)
    .then(r => r.json().then(d => ({ ok: r.ok, d })))
    .then(({ ok, d }) => {
      if (!ok) throw new Error(d.error || 'Error al obtener detalles.');
      rellenarModal(d);
    })
    .catch(err => {
      modalLoading.classList.remove('visible');
      modalError.textContent = `⚠️ ${err.message}`;
      modalError.hidden      = false;
    });
}

function rellenarModal(p) {
  // Backdrop panorámico
  elBackdropImg.style.backgroundImage = p.backdrop
    ? `url('${p.backdrop}')`
    : p.poster ? `url('${p.poster}')` : 'none';

  // Póster
  if (p.poster) {
    elPoster.src       = p.poster;
    elPoster.alt       = `Póster de ${p.titulo}`;
    elPoster.hidden    = false;
    elSinPoster.hidden = true;
  } else {
    elPoster.hidden    = true;
    elSinPoster.hidden = false;
  }

  // Tagline
  elTagline.textContent = p.tagline || '';
  elTagline.hidden      = !p.tagline;

  // Título + título original
  elTitulo.textContent    = p.titulo;
  elTituloOrig.textContent = p.titulo_orig ? `Título original: ${p.titulo_orig}` : '';
  elTituloOrig.hidden      = !p.titulo_orig;

  // Badges: año · nota · duración
  elBadges.innerHTML = '';

  if (p.anio) {
    const b = document.createElement('span');
    b.className   = 'badge badge-anio';
    b.textContent = p.anio;
    elBadges.appendChild(b);
  }
  if (p.calificacion) {
    const b = document.createElement('span');
    b.className = `badge badge-nota ${claseNota(p.calificacion)}`;
    b.innerHTML = `⭐ ${p.calificacion.toFixed(1)}&thinsp;<span style="opacity:.55;font-weight:400">(${(p.votos || 0).toLocaleString()} votos)</span>`;
    elBadges.appendChild(b);
  }
  if (p.duracion) {
    const h = Math.floor(p.duracion / 60);
    const m = p.duracion % 60;
    const b = document.createElement('span');
    b.className   = 'badge badge-anio';
    b.textContent = h > 0 ? `${h}h ${m}m` : `${m}m`;
    elBadges.appendChild(b);
  }

  // Géneros
  elGeneros.innerHTML = '';
  (p.generos || []).forEach(g => {
    const chip = document.createElement('span');
    chip.className   = 'genero-chip';
    chip.textContent = g;
    elGeneros.appendChild(chip);
  });
  elGeneros.hidden = !(p.generos?.length);

  // Sinopsis completa (sin recorte)
  elSinopsis.textContent = p.sinopsis || 'Esta película aún no tiene sinopsis en español.';

  // Ficha técnica
  elFicha.innerHTML = '';
  const ficha = [];
  if (p.director)        ficha.push(['Director',      p.director]);
  if (p.reparto?.length) ficha.push(['Reparto',       p.reparto.join(', ')]);
  if (p.pais)            ficha.push(['País',           p.pais]);
  if (p.idioma)          ficha.push(['Idioma orig.',   p.idioma.toUpperCase()]);
  if (p.fecha)           ficha.push(['Estreno',        new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })]);

  ficha.forEach(([dt, dd]) => {
    const term = document.createElement('dt');
    term.textContent = dt;
    const def = document.createElement('dd');
    def.textContent = dd;
    elFicha.append(term, def);
  });
  elFicha.hidden = !ficha.length;

  // Link a TMDB
  elTmdbLink.href = p.tmdb_url || '#';

  // Mostrar contenido
  modalLoading.classList.remove('visible');
  elCuerpo.hidden = false;
}

function cerrarModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  if (tarjetaFoco) tarjetaFoco.focus();
}

// Eventos de cierre
modalCerrar.addEventListener('click', cerrarModal);
modalBackdrop.addEventListener('click', cerrarModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.hidden) cerrarModal();
});
