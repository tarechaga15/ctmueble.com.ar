import { useState, useEffect, useMemo, Fragment } from "react";
import {
  Users,
  Plus,
  Pencil,
  KeyRound,
  Shield,
  ShieldCheck,
  Search,
  Mail,
  Check,
  SlidersHorizontal,
  Loader2,
  RefreshCw,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Modal from "../Modal";
import { laboratoryUsersService } from "../../services/laboratoryUsersService";
import { useToast } from "../../context/ToastContext";

const usuarioVacio = {
  nombreCompleto: "",
  dni: "",
  email: "",
  telefono: "",
  rol: "Usuario",
};

export default function LaboratoryUsersTab() {
  const toast = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroUsuario, setFiltroUsuario] = useState("");

  // Modal Nuevo Usuario
  const [modalNuevoUsuario, setModalNuevoUsuario] = useState(false);
  const [formNuevo, setFormNuevo] = useState(usuarioVacio);
  const [isCreandoUsuario, setIsCreandoUsuario] = useState(false);

  // Modal Edición
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formEdicion, setFormEdicion] = useState({
    nombreCompleto: "",
    dni: "",
    rol: "Usuario",
    activo: true,
  });
  const [isGuardandoEdicion, setIsGuardandoEdicion] = useState(false);

  // Modal Reset Password
  const [usuarioResetPassword, setUsuarioResetPassword] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [isReseteandoPassword, setIsReseteandoPassword] = useState(false);

  // Reenviar activación
  const [reenviandoId, setReenviandoId] = useState(null);

  // Modal Matriz de Permisos
  const [modalPermisos, setModalPermisos] = useState(false);
  const [permisosData, setPermisosData] = useState({ catalogo: [], matriz: [] });
  const [loadingPermisos, setLoadingPermisos] = useState(false);
  const [savingPermisos, setSavingPermisos] = useState(false);
  const [matrizLocal, setMatrizLocal] = useState({});

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await laboratoryUsersService.getUsers();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarPermisos = async () => {
    setLoadingPermisos(true);
    try {
      const data = await laboratoryUsersService.getPermissions();
      setPermisosData(data || { catalogo: [], matriz: [] });
      setMatrizLocal({});
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error al cargar la matriz de permisos");
    } finally {
      setLoadingPermisos(false);
    }
  };

  const handleOpenPermisos = () => {
    setModalPermisos(true);
    cargarPermisos();
  };

  const usuariosFiltrados = useMemo(() => {
    if (!filtroUsuario.trim()) return usuarios;
    const q = filtroUsuario.toLowerCase();
    return usuarios.filter(
      (u) =>
        (u.nombreCompleto && u.nombreCompleto.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.dni && u.dni.toLowerCase().includes(q))
    );
  }, [usuarios, filtroUsuario]);

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    if (!formNuevo.email.trim() || !formNuevo.nombreCompleto.trim()) {
      toast.error("Completá los campos obligatorios");
      return;
    }

    setIsCreandoUsuario(true);
    try {
      const res = await laboratoryUsersService.createUser({
        nombreCompleto: formNuevo.nombreCompleto.trim(),
        dni: formNuevo.dni.trim(),
        email: formNuevo.email.trim(),
        rol: formNuevo.rol,
      });

      if (res?.mailingSent) {
        toast.success(`Usuario creado y correo de activación enviado a ${formNuevo.email}`);
      } else {
        toast.success("Usuario creado exitosamente en modo laboratorio");
      }

      setModalNuevoUsuario(false);
      setFormNuevo(usuarioVacio);
      cargarUsuarios();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error al crear usuario");
    } finally {
      setIsCreandoUsuario(false);
    }
  };

  const abrirEdicion = (u) => {
    setUsuarioEditando(u);
    setFormEdicion({
      nombreCompleto: u.nombreCompleto || "",
      dni: u.dni || "",
      rol: u.rol || "Usuario",
      activo: u.activo !== false,
    });
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!usuarioEditando) return;

    setIsGuardandoEdicion(true);
    try {
      await laboratoryUsersService.updateUser(usuarioEditando.id, {
        nombreCompleto: formEdicion.nombreCompleto.trim(),
        dni: formEdicion.dni.trim(),
        rol: formEdicion.rol,
        activo: formEdicion.activo,
      });
      toast.success("Usuario actualizado correctamente");
      setUsuarioEditando(null);
      cargarUsuarios();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error al actualizar usuario");
    } finally {
      setIsGuardandoEdicion(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!usuarioResetPassword) return;

    if (nuevaPassword.length < 12 || nuevaPassword.length > 64) {
      toast.error("La contraseña debe tener entre 12 y 64 caracteres");
      return;
    }

    setIsReseteandoPassword(true);
    try {
      await laboratoryUsersService.resetPassword(usuarioResetPassword.id, nuevaPassword);
      toast.success(`Contraseña actualizada para ${usuarioResetPassword.nombreCompleto}`);
      setUsuarioResetPassword(null);
      setNuevaPassword("");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error al resetear contraseña");
    } finally {
      setIsReseteandoPassword(false);
    }
  };

  const handleReenviarActivacion = async (u) => {
    setReenviandoId(u.id);
    try {
      const res = await laboratoryUsersService.resendActivation(u.id);
      if (res?.mailingSent) {
        toast.success(`Correo de activación reenviado a ${u.email}`);
      } else {
        toast.success(`Enlace de activación generado para ${u.email}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error al reenviar activación");
    } finally {
      setReenviandoId(null);
    }
  };

  // Matriz de permisos Helpers
  const catalogoPermisos = useMemo(() => permisosData?.catalogo ?? [], [permisosData]);
  const gruposPermisos = useMemo(() => {
    const grupos = {};
    for (const item of catalogoPermisos) {
      if (!grupos[item.grupo]) grupos[item.grupo] = [];
      grupos[item.grupo].push(item);
    }
    return grupos;
  }, [catalogoPermisos]);

  function keyPermiso(rol, accion) {
    return `${rol}:${accion}`;
  }

  function getPermitido(rol, accion) {
    const k = keyPermiso(rol, accion);
    if (k in matrizLocal) return matrizLocal[k];
    const match = permisosData?.matriz?.find((m) => m.rol === rol && m.accion === accion);
    if (match) return match.permitido;
    const cat = catalogoPermisos.find((c) => c.clave === accion);
    return rol === "Usuario" ? Boolean(cat?.usuario) : Boolean(cat?.consulta);
  }

  const handleGuardarPermisos = async () => {
    setSavingPermisos(true);
    try {
      const items = catalogoPermisos.flatMap((a) =>
        ["Usuario", "Consulta"].map((rol) => ({
          rol,
          accion: a.clave,
          permitido: getPermitido(rol, a.clave),
        }))
      );
      await laboratoryUsersService.updatePermissions(items);
      toast.success("Matriz de permisos guardada correctamente");
      setModalPermisos(false);
      setMatrizLocal({});
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error al guardar permisos");
    } finally {
      setSavingPermisos(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Listado de usuarios habilitados
            </CardTitle>
            <CardDescription className="mt-1">
              Definí el nombre, correo, DNI y establecé los permisos de acceso para cada usuario interno del laboratorio.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenPermisos}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Matriz de permisos por rol
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setFormNuevo(usuarioVacio);
                setModalNuevoUsuario(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, usuario, correo o DNI..."
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={cargarUsuarios}
              title="Recargar usuarios"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo electrónico</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Rol y Permisos</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Cargando usuarios del laboratorio...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : usuariosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                      {filtroUsuario
                        ? "No se encontraron usuarios coincidentes."
                        : "No hay usuarios registrados en el laboratorio."}
                    </TableCell>
                  </TableRow>
                ) : (
                  usuariosFiltrados.map((u) => {
                    const isSuperAdmin = Boolean(u.isSuperAdmin);
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-foreground">
                          {u.nombreCompleto}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          @{u.username}
                        </TableCell>
                        <TableCell>
                          {u.email ? (
                            <a
                              href={`mailto:${u.email}`}
                              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                            >
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              {u.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground/60 text-xs italic">Sin correo</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-foreground">
                          {u.dni ? u.dni : <span className="text-muted-foreground/60 italic">—</span>}
                        </TableCell>
                        <TableCell>
                          {u.rol === "Admin" ? (
                            <Badge className="gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                              <ShieldCheck className="h-3 w-3" />
                              Admin (Acceso total)
                            </Badge>
                          ) : u.rol === "Usuario" ? (
                            <Badge variant="secondary" className="gap-1">
                              <Shield className="h-3 w-3 text-muted-foreground" />
                              Usuario (Operativo)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-muted-foreground">
                              Consulta (Solo lectura)
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {u.activo ? (
                            <Badge
                              variant="outline"
                              className="text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                            >
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs text-muted-foreground">
                              Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              title="Reenviar invitación de activación por correo"
                              disabled={reenviandoId === u.id}
                              onClick={() => handleReenviarActivacion(u)}
                            >
                              {reenviandoId === u.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Editar usuario y permisos"
                              onClick={() => abrirEdicion(u)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Resetear contraseña"
                              onClick={() => {
                                setUsuarioResetPassword(u);
                                setNuevaPassword("");
                              }}
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* --- MODAL NUEVO USUARIO --- */}
      <Modal
        show={modalNuevoUsuario}
        onClose={() => setModalNuevoUsuario(false)}
        title="Nuevo usuario de laboratorio"
      >
        <form onSubmit={handleCrearUsuario} className="space-y-4 pt-1">
          <p className="text-xs text-muted-foreground">
            Fijá los datos del usuario interno. Al crearlo, se enviará automáticamente un correo para que active su cuenta y ya estará activa dentro del modo laboratorio.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="nuevo-nombre">Nombre completo *</Label>
            <Input
              id="nuevo-nombre"
              placeholder="Ej. Martín González"
              value={formNuevo.nombreCompleto}
              onChange={(e) => setFormNuevo({ ...formNuevo, nombreCompleto: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nuevo-dni">DNI / Documento *</Label>
              <Input
                id="nuevo-dni"
                placeholder="Ej. 35123456"
                value={formNuevo.dni}
                onChange={(e) => setFormNuevo({ ...formNuevo, dni: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nuevo-email">Correo electrónico *</Label>
              <Input
                id="nuevo-email"
                type="email"
                placeholder="martin@ctmueble.com.ar"
                value={formNuevo.email}
                onChange={(e) => setFormNuevo({ ...formNuevo, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Establecer rol y permisos *</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Admin", label: "Admin", desc: "Acceso total sin restricciones" },
                { id: "Usuario", label: "Usuario", desc: "Operaciones del día a día" },
                { id: "Consulta", label: "Consulta", desc: "Solo lectura e informes" },
              ].map((r) => {
                const selected = formNuevo.rol === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormNuevo({ ...formNuevo, rol: r.id })}
                    className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <span className="font-semibold">{r.label}</span>
                    <span className="text-muted-foreground text-[11px] leading-tight mt-1">
                      {r.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground flex items-start gap-2.5">
            <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong>Activación automática por correo:</strong> El nuevo integrante recibirá un correo con su enlace y código OTP de activación. Una vez verificado, podrá ingresar y operar directamente en modo laboratorio.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalNuevoUsuario(false)}
              disabled={isCreandoUsuario}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isCreandoUsuario}>
              {isCreandoUsuario ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Creando y enviando correo...
                </>
              ) : (
                "Crear usuario y enviar correo"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL EDITAR USUARIO --- */}
      <Modal
        show={Boolean(usuarioEditando)}
        onClose={() => setUsuarioEditando(null)}
        title={`Editar usuario: ${usuarioEditando?.username || ""}`}
      >
        <form onSubmit={handleGuardarEdicion} className="space-y-4 pt-1">
          <p className="text-xs text-muted-foreground">
            Modificá el nombre, documento, rol asignado y estado del usuario en el laboratorio.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="edit-nombre">Nombre completo *</Label>
            <Input
              id="edit-nombre"
              value={formEdicion.nombreCompleto}
              onChange={(e) => setFormEdicion({ ...formEdicion, nombreCompleto: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-dni">DNI / Documento</Label>
              <Input
                id="edit-dni"
                value={formEdicion.dni}
                onChange={(e) => setFormEdicion({ ...formEdicion, dni: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Correo electrónico</Label>
              <Input
                id="edit-email"
                value={usuarioEditando?.email || ""}
                disabled
                className="bg-muted text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rol y permisos asignados</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Admin", label: "Admin", desc: "Acceso total sin restricciones" },
                { id: "Usuario", label: "Usuario", desc: "Operaciones según matriz" },
                { id: "Consulta", label: "Consulta", desc: "Solo reportes y lectura" },
              ].map((r) => {
                const selected = formEdicion.rol === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormEdicion({ ...formEdicion, rol: r.id })}
                    className={`flex flex-col text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <span className="font-semibold">{r.label}</span>
                    <span className="text-muted-foreground text-[11px] leading-tight mt-1">
                      {r.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="edit-activo"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary cursor-pointer"
              checked={formEdicion.activo}
              onChange={(e) => setFormEdicion({ ...formEdicion, activo: e.target.checked })}
            />
            <Label htmlFor="edit-activo" className="text-xs font-normal cursor-pointer text-foreground">
              Usuario activo (habilitado para ingresar al sistema y realizar operaciones)
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUsuarioEditando(null)}
              disabled={isGuardandoEdicion}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isGuardandoEdicion}>
              {isGuardandoEdicion ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL RESETEAR CONTRASEÑA --- */}
      <Modal
        show={Boolean(usuarioResetPassword)}
        onClose={() => setUsuarioResetPassword(null)}
        title="Resetear contraseña"
      >
        <form onSubmit={handleResetPassword} className="space-y-4 pt-1">
          <p className="text-xs text-muted-foreground">
            Fijá una nueva contraseña temporal para <strong>{usuarioResetPassword?.nombreCompleto}</strong> (@{usuarioResetPassword?.username}).
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="reset-password">Nueva contraseña temporal *</Label>
            <Input
              id="reset-password"
              type="password"
              minLength={12}
              maxLength={64}
              placeholder="Mínimo 12 caracteres"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUsuarioResetPassword(null)}
              disabled={isReseteandoPassword}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isReseteandoPassword}>
              {isReseteandoPassword ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar contraseña"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL MATRIZ DE PERMISOS --- */}
      <Modal
        show={modalPermisos}
        onClose={() => setModalPermisos(false)}
        title="Matriz de permisos del laboratorio"
        wide
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-muted-foreground">
            Configurá qué operaciones tienen permitidas los roles <strong>Usuario</strong> y <strong>Consulta</strong> en el laboratorio. El rol <strong>Admin</strong> siempre cuenta con acceso irrestricto a todas las funcionalidades.
          </p>

          {loadingPermisos ? (
            <div className="py-12 flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Cargando matriz de permisos...</span>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 sticky top-0 z-10">
                    <TableHead>Acción / Módulo</TableHead>
                    <TableHead className="w-28 text-center font-semibold">Usuario</TableHead>
                    <TableHead className="w-28 text-center font-semibold">Consulta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(gruposPermisos).map(([grupo, acciones]) => (
                    <Fragment key={grupo}>
                      <TableRow className="bg-muted/20 border-t border-border">
                        <TableCell
                          colSpan={3}
                          className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {grupo}
                        </TableCell>
                      </TableRow>
                      {acciones.map((a) => (
                        <TableRow key={a.clave} className="hover:bg-muted/30">
                          <TableCell className="text-xs py-2 text-foreground">
                            {a.descripcion}
                          </TableCell>
                          {["Usuario", "Consulta"].map((rol) => {
                            const isChecked = getPermitido(rol, a.clave);
                            return (
                              <TableCell key={rol} className="text-center py-2">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-border text-primary cursor-pointer accent-primary"
                                  checked={isChecked}
                                  onChange={(e) =>
                                    setMatrizLocal((prev) => ({
                                      ...prev,
                                      [keyPermiso(rol, a.clave)]: e.target.checked,
                                    }))
                                  }
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
            <p className="text-[11px] text-muted-foreground">
              Los cambios aplicarán para todos los usuarios con esos roles en el laboratorio.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalPermisos(false)}
                disabled={savingPermisos}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleGuardarPermisos}
                disabled={savingPermisos || loadingPermisos}
              >
                {savingPermisos ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Guardar permisos
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
