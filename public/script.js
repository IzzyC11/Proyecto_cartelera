const formulario = document.getElementById('formulario');
const consulta = document.getElementById('consulta');
const mensaje = document.getElementById('mensaje');
const resultados = document.getElementById('resultados');
const boton = formulario.querySelector('button');

function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.className = esError ? 'error' : '';
}

function crearTarjeta(p) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta';

  if (p.poster) {
    const img = document.createElement('img');
    img.src = p.poster;
    img.alt = `Póster de ${p.titulo}`;
    img.loading = 'lazy';
    tarjeta.appendChild(img);
  } else {
    const vacio = document.createElement('div');
    vacio.className = 'sin-poster';
    vacio.textContent = 'Sin póster';
    tarjeta.appendChild(vacio);
  }

  const info = document.createElement('div');
  info.className = 'info';

  const titulo = document.createElement('h2');
  titulo.textContent = p.titulo;

  const meta = document.createElement('p');
  meta.className = 'meta';
  const anio = p.anio || 'Año desconocido';
  const nota = p.calificacion ? `${p.calificacion.toFixed(1)} / 10` : 'Sin calificación';
  meta.textContent = `${anio} · ${nota}`;

  const sinopsis = document.createElement('p');
  sinopsis.className = 'sinopsis';
  sinopsis.textContent = p.sinopsis || 'Esta película aún no tiene sinopsis en español.';

  info.append(titulo, meta, sinopsis);
  tarjeta.appendChild(info);
  return tarjeta;
}

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = consulta.value.trim();
  if (!q) return mostrarMensaje('Escribe el título de una película.', true);

  if (!navigator.onLine) {
    resultados.replaceChildren();
    return mostrarMensaje('Sin conexión a internet. Revisa tu red e inténtalo de nuevo.', true);
  }

  boton.disabled = true;
  resultados.replaceChildren();
  mostrarMensaje('Buscando...');

  try {
    const resp = await fetch(`/api/buscar?q=${encodeURIComponent(q)}`);
    const datos = await resp.json();

    if (!resp.ok) return mostrarMensaje(datos.error || 'Ocurrió un error inesperado.', true);

    if (!datos.peliculas || datos.peliculas.length === 0) {
      return mostrarMensaje(`No encontramos resultados para "${q}". Prueba con otro título.`);
    }

    mostrarMensaje(`${datos.peliculas.length} resultado(s) para "${q}"`);
    resultados.append(...datos.peliculas.map(crearTarjeta));
  } catch (err) {
    mostrarMensaje('No se pudo contactar al servidor. ¿Está encendido?', true);
  } finally {
    boton.disabled = false;
  }
});
