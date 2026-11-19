'use strict';

const ROLES = ['Admin', 'Usuario', 'Consulta'];

const CATALOGO_PERMISOS = [
  { clave: 'essays.ver', grupo: 'Ensayos y Solicitudes', descripcion: 'Ver ensayos y solicitudes del laboratorio', usuario: true, consulta: true },
  { clave: 'essays.crear', grupo: 'Ensayos y Solicitudes', descripcion: 'Crear y registrar solicitudes de ensayo', usuario: true, consulta: false },
  { clave: 'essays.editar', grupo: 'Ensayos y Solicitudes', descripcion: 'Modificar datos de ensayos y cargar resultados', usuario: true, consulta: false },
  { clave: 'essays.estados', grupo: 'Ensayos y Solicitudes', descripcion: 'Avanzar estados y procedimientos del ensayo', usuario: true, consulta: false },
  { clave: 'essays.informes', grupo: 'Ensayos y Solicitudes', descripcion: 'Generar y descargar informes de ensayos', usuario: true, consulta: true },
  { clave: 'essays.anular', grupo: 'Ensayos y Solicitudes', descripcion: 'Cancelar o anular solicitudes de ensayo', usuario: false, consulta: false },

  { clave: 'muestras.ver', grupo: 'Muestras y Órdenes de Trabajo', descripcion: 'Ver listado y detalle de muestras', usuario: true, consulta: true },
  { clave: 'muestras.recepcionar', grupo: 'Muestras y Órdenes de Trabajo', descripcion: 'Recepcionar, rotular y asignar muestras físicas', usuario: true, consulta: false },
  { clave: 'ordenes.editar', grupo: 'Muestras y Órdenes de Trabajo', descripcion: 'Crear y editar órdenes de trabajo', usuario: true, consulta: false },
  { clave: 'ordenes.ensayar', grupo: 'Muestras y Órdenes de Trabajo', descripcion: 'Cargar dimensiones, mediciones y ensayos físicos', usuario: true, consulta: false },
  { clave: 'ordenes.cerrar', grupo: 'Muestras y Órdenes de Trabajo', descripcion: 'Cerrar y finalizar órdenes de trabajo', usuario: true, consulta: false },

  { clave: 'clientes.ver', grupo: 'Clientes y Empresas', descripcion: 'Ver clientes y empresas representadas', usuario: true, consulta: true },
  { clave: 'clientes.crear', grupo: 'Clientes y Empresas', descripcion: 'Dar de alta clientes y empresas', usuario: true, consulta: false },
  { clave: 'clientes.editar', grupo: 'Clientes y Empresas', descripcion: 'Editar datos fiscales y contactos comerciales', usuario: true, consulta: false },

  { clave: 'configuracion.env', grupo: 'Configuración del Sistema', descripcion: 'Ver y modificar variables de entorno', usuario: false, consulta: false },
  { clave: 'configuracion.mailing', grupo: 'Configuración del Sistema', descripcion: 'Gestionar credenciales y pruebas de correo', usuario: false, consulta: false },
  { clave: 'configuracion.usuarios', grupo: 'Configuración del Sistema', descripcion: 'Gestionar usuarios internos, roles y permisos', usuario: false, consulta: false }
];

module.exports = {
  ROLES,
  CATALOGO_PERMISOS
};
