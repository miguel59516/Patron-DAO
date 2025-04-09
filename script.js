const form = document.getElementById('usuarioForm');
const tabla = document.getElementById('usuarioTabla');
const editModal = document.getElementById('editModal');
const editNombre = document.getElementById('editNombre');
const editCorreo = document.getElementById('editCorreo');
const confirmEdit = document.getElementById('confirmEdit');
const cancelEdit = document.getElementById('cancelEdit');

let usuarios = [];
let editandoDni = null;

function renderTabla() {
  tabla.innerHTML = '';
  usuarios.forEach((usuario) => {
    const tr = document.createElement('tr');
    const tiempoPasado = Date.now() - usuario.creado;
    const habilitado = tiempoPasado < 86400000;
    const creadoFecha = new Date(usuario.creado).toLocaleString();

    tr.innerHTML = `
      <td class="dni-tooltip" title="Creado: ${creadoFecha}">${usuario.dni}</td>
      <td>${usuario.nombre}</td>
      <td>${usuario.correo}</td>
      <td>${usuario.ultimoAcceso.toLocaleString()}</td>
      <td>
        <button onclick="editarFecha('${usuario.dni}')">Editar Fecha</button>
      </td>
      <td>
        <div class="tooltip">
          <button id="editar-${usuario.dni}"
            ${habilitado ? '' : 'disabled class="expired"'}
            onmouseover="iniciarTooltip('${usuario.dni}', 'editar')"
            onclick="abrirEditar('${usuario.dni}')">
            Editar
          </button>
          <span class="tooltiptext" id="tooltip-editar-${usuario.dni}"></span>
        </div>
        <div class="tooltip">
          <button id="eliminar-${usuario.dni}"
            ${habilitado ? '' : 'disabled class="expired"'}
            onmouseover="iniciarTooltip('${usuario.dni}', 'eliminar')"
            onclick="confirmarEliminar('${usuario.dni}')">
            Eliminar
          </button>
          <span class="tooltiptext" id="tooltip-eliminar-${usuario.dni}"></span>
        </div>
      </td>
    `;
    tabla.appendChild(tr);
  });
}

function iniciarTooltip(dni, tipo) {
  const usuario = usuarios.find(u => u.dni === dni);
  const tooltip = document.getElementById(`tooltip-${tipo}-${dni}`);
  const boton = document.getElementById(`${tipo}-${dni}`);

  function updateTooltip() {
    const diff = usuario.creado + 86400000 - Date.now();
    if (diff <= 0) {
      tooltip.textContent = `Ya no puede ${tipo} este registro.`;
      boton.disabled = true;
      boton.classList.add('expired');
      clearInterval(usuario[`${tipo}Intervalo`]);
    } else {
      const horas = Math.floor(diff / 3600000);
      const minutos = Math.floor((diff % 3600000) / 60000);
      const segundos = Math.floor((diff % 60000) / 1000);
      tooltip.textContent = `Usted podrá ${tipo} este registro por ${horas}h ${minutos}m ${segundos}s más`;
    }
  }

  if (!usuario[`${tipo}Intervalo`]) {
    usuario[`${tipo}Intervalo`] = setInterval(updateTooltip, 1000);
  }
  updateTooltip();
}

function abrirEditar(dni) {
  const usuario = usuarios.find(u => u.dni === dni);
  if (!usuario) return;
  const tiempoPasado = Date.now() - usuario.creado;

  if (tiempoPasado < 86400000) {
    editandoDni = dni;
    editNombre.value = usuario.nombre;
    editCorreo.value = usuario.correo;
    editModal.classList.remove('hidden');
  } else {
    alert('Ya no puede editar este registro. Ha pasado más de 24 horas.');
  }
}

function cerrarModal() {
  editandoDni = null;
  editModal.classList.add('hidden');
}

confirmEdit.addEventListener('click', () => {
  const usuario = usuarios.find(u => u.dni === editandoDni);
  if (usuario && Date.now() - usuario.creado < 86400000) {
    usuario.nombre = editNombre.value;
    usuario.correo = editCorreo.value;
    renderTabla();
    cerrarModal();
  } else {
    alert('Ya no puede editar este registro. Ha pasado más de 24 horas.');
    cerrarModal();
  }
});

cancelEdit.addEventListener('click', cerrarModal);

function confirmarEliminar(dni) {
  const confirmacion = confirm('¿Está seguro que desea eliminar este registro?');
  if (confirmacion) {
    eliminarUsuario(dni);
  }
}

function eliminarUsuario(dni) {
  const usuario = usuarios.find(u => u.dni === dni);
  if (usuario && Date.now() - usuario.creado < 86400000) {
    usuarios = usuarios.filter(u => u.dni !== dni);
    renderTabla();
  } else {
    alert('Este registro solo puede eliminarse dentro de las primeras 24 horas.');
  }
}

function editarFecha(dni) {
  const usuario = usuarios.find(u => u.dni === dni);
  if (!usuario) return;

  const nuevaFecha = prompt('Ingrese nueva fecha de creación (YYYY-MM-DD HH:MM:SS):');
  if (nuevaFecha) {
    const fecha = new Date(nuevaFecha);
    if (!isNaN(fecha)) {
      usuario.creado = fecha.getTime();
      renderTabla();
    } else {
      alert('Fecha inválida.');
    }
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const dni = document.getElementById('dni').value;
  const nombre = document.getElementById('nombre').value;
  const correo = document.getElementById('correo').value;

  if (usuarios.some(u => u.dni === dni)) {
    alert('El DNI ya existe.');
    return;
  }

  const nuevoUsuario = {
    dni,
    nombre,
    correo,
    ultimoAcceso: new Date(),
    creado: Date.now(),
    editarIntervalo: null,
    eliminarIntervalo: null
  };

  usuarios.push(nuevoUsuario);
  renderTabla();
  form.reset();
});
