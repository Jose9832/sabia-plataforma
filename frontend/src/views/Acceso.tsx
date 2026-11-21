import { useState } from "react";
import { BotonEscuchar, Volver } from "../components/comunes";
import { IconoComunidad } from "../components/icons/Icono";
import { comunidades, usuariosPrueba, type IdComunidad } from "../data/contenido";
import type { Usuario } from "../data/tipos";
import { ErrorApi, SinConexion, enviar } from "../lib/api";
import { enLinea, useApp } from "../state/store";

interface TokenOut { access_token: string; usuario: Usuario }
const formVacio = { id: "", clave: "", nombre: "", clave2: "", ver: false, error: "" };

/* ---------- ACCESO: elegir comunidad → ingresar o registrarse ---------- */
export function Acceso() {
  const sub = useApp(s => s.nav.sub);
  const comunidadElegida = useApp(s => s.ui.comunidadElegida);
  const { ir, setUi, iniciarSesion } = useApp.getState();
  const [f, setF] = useState(formVacio);
  const [enviando, setEnviando] = useState(false);
  const cambiar = (c: Partial<typeof formVacio>) => setF(prev => ({ ...prev, ...c }));

  if (!comunidadElegida) return (
    <>
      <Volver texto="Volver" onClick={() => ir("puertas")} />
      <h2 className="titulo-modulo">¿De qué comunidad eres?</h2>
      <p className="subtitulo-pantalla">Elige tu comunidad para entrar</p>
      <div className="modulos">
        {(Object.entries(comunidades) as [IdComunidad, (typeof comunidades)[IdComunidad]][]).map(([id, c]) => (
          <div key={id} className="tarjeta-modulo" role="button" onClick={() => { setUi({ comunidadElegida: id }); ir("acceso", "ingresar"); }}>
            <div className="icono-circulo" style={{ background: c.fondo, color: c.color }}><IconoComunidad comunidad={id} /></div>
            <div className="textos"><strong>{c.titulo}</strong><span>{c.desc}</span></div>
            <BotonEscuchar texto={`${c.titulo}. ${c.desc}`} />
          </div>
        ))}
      </div>
    </>
  );

  const c = comunidades[comunidadElegida];
  const registro = sub === "registro";

  /* Llama a la API (POST /api/auth/login o /api/auth/registro) */
  async function autenticar(ruta: string, cuerpo: object, nueva: boolean) {
    if (!enLinea(useApp.getState())) {
      cambiar({ error: "Sin conexión: para entrar con tu cuenta necesitas internet. Después la app funciona sin señal." });
      return;
    }
    setEnviando(true);
    try {
      const r = await enviar<TokenOut>(ruta, cuerpo, { enLinea: true });
      iniciarSesion({ token: r.access_token, usuario: r.usuario }, nueva);
    } catch (e) {
      cambiar({
        error: e instanceof ErrorApi ? e.message
          : e instanceof SinConexion ? "No pudimos comunicarnos con el servidor. Revisa tu conexión e intenta otra vez."
          : "Ocurrió un error inesperado."
      });
    } finally {
      setEnviando(false);
    }
  }

  function ingresar() {
    if (!f.id || !f.clave) { cambiar({ error: "Escribe tu número de identificación y tu contraseña." }); return; }
    void autenticar("/auth/login", { numero_identificacion: f.id, clave: f.clave, comunidad: comunidadElegida }, false);
  }

  function registrarse() {
    let error = "";
    if (f.nombre.trim().length < 3) error = "Escribe tu nombre completo.";
    else if (f.id.length < 5) error = "El número de identificación debe tener al menos 5 dígitos.";
    else if (f.clave.length < 6) error = "La contraseña debe tener al menos 6 caracteres.";
    else if (f.clave !== f.clave2) error = "Las contraseñas no son iguales.";
    if (error) { cambiar({ error }); return; }
    void autenticar("/auth/registro", { nombre: f.nombre.trim(), numero_identificacion: f.id, clave: f.clave, comunidad: comunidadElegida }, true);
  }

  return (
    <>
      <Volver texto="Cambiar comunidad" onClick={() => { setUi({ comunidadElegida: null }); ir("acceso"); }} />
      <div className="cabecera-acceso" style={{ background: c.fondo, color: c.color }}>
        <div className="icono-acceso"><IconoComunidad comunidad={comunidadElegida} tam={34} /></div>
        <div><small>Comunidad</small><b>{c.titulo}</b></div>
      </div>
      <h2 className="titulo-modulo">{registro ? "Crear mi cuenta" : "Ingresar"}</h2>
      <p className="subtitulo-pantalla">{registro ? "Regístrate una sola vez con tu documento." : "Escribe tu número de identificación y tu contraseña."}</p>

      <form className="formulario" onSubmit={e => { e.preventDefault(); if (registro) registrarse(); else ingresar(); }}>
        {registro && <>
          <label className="etiqueta-campo" htmlFor="fNombre">Nombre completo</label>
          <input className="campo" id="fNombre" autoComplete="name" value={f.nombre} onChange={e => cambiar({ nombre: e.target.value })} placeholder="Ej: María Pérez" />
        </>}

        <label className="etiqueta-campo" htmlFor="fId">Número de identificación</label>
        <input className="campo" id="fId" inputMode="numeric" autoComplete="username" value={f.id}
          onChange={e => cambiar({ id: e.target.value.replace(/\D/g, "") })} placeholder="Solo números" />

        <label className="etiqueta-campo" htmlFor="fClave">Contraseña</label>
        <div className="campo-clave">
          <input className="campo" id="fClave" type={f.ver ? "text" : "password"} autoComplete={registro ? "new-password" : "current-password"}
            value={f.clave} onChange={e => cambiar({ clave: e.target.value })} placeholder={registro ? "Mínimo 6 caracteres" : "Tu contraseña"} />
          <button type="button" className="ver-clave" onClick={() => cambiar({ ver: !f.ver })}>{f.ver ? "Ocultar" : "Ver"}</button>
        </div>

        {registro && <>
          <label className="etiqueta-campo" htmlFor="fClave2">Repite la contraseña</label>
          <input className="campo" id="fClave2" type={f.ver ? "text" : "password"} autoComplete="new-password" value={f.clave2} onChange={e => cambiar({ clave2: e.target.value })} />
        </>}

        {f.error && <div className="error-campo">{f.error}</div>}
        <button type="submit" className="boton-ancho" style={{ background: c.color }} disabled={enviando}>
          {enviando ? (registro ? "Creando cuenta…" : "Ingresando…") : registro ? "Crear cuenta y entrar" : "Ingresar"}
        </button>
        <button type="button" className="boton-texto" onClick={() => { setF({ ...f, error: "" }); ir("acceso", registro ? "ingresar" : "registro"); }}>
          {registro ? <>Ya tengo cuenta · <b>Ingresar</b></> : <>¿No tienes cuenta? <b>Regístrate</b></>}
        </button>
      </form>

      {!registro && (
        <details className="pista-cuentas">
          <summary>Cuentas de prueba para la presentación</summary>
          {usuariosPrueba.map(u => <div key={u.id}><b>{comunidades[u.comunidad].nombre}:</b> ID {u.id} · contraseña {u.clave}</div>)}
        </details>
      )}
    </>
  );
}
