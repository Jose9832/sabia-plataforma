import { useRef, useState } from "react";
import { Volver } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import { cultivosCuentas, tiposGasto } from "../../data/contenido";
import { nuevoId } from "../../lib/cola";
import { crearReconocedor, interpretarMonto, pesos } from "../../lib/utilidades";
import { useApp } from "../../state/store";

const soloDigitos = (v: string) => v.replace(/\D/g, "");
const aNumero = (v: string) => (v ? Number(v) : null);

/* --- Cuaderno de cuentas de cosecha ---
   Todo se guarda al instante en el teléfono y viaja al servidor por la cola. */
export function Cuentas() {
  const cuentas = useApp(s => s.datos.cuentas);
  const { ir, aviso, encolar, setCuentas } = useApp.getState();
  const [formGasto, setFormGasto] = useState({ tipo: "Abono", monto: "" });
  const borrarArmado = useRef(false);

  const invertido = cuentas.gastos.reduce((s, g) => s + g.monto, 0);
  const cargas = cuentas.cargas || 0, precio = cuentas.precio || 0;
  const vendido = cargas * precio, resultado = vendido - invertido;
  const minimo = cargas ? invertido / cargas : 0;

  function elegirCultivo(cultivo: string) {
    setCuentas(c => ({ ...c, cultivo }));
    encolar("cuaderno", { cultivo });
  }
  function anotarGasto() {
    const monto = Number(formGasto.monto);
    if (!monto) { aviso("Escribe o dicta cuánto gastaste"); return; }
    const gasto = { client_id: nuevoId(), cultivo: cuentas.cultivo, tipo: formGasto.tipo, monto };
    setCuentas(c => ({ ...c, gastos: [...c.gastos, gasto] }));
    encolar("gasto", gasto);
    setFormGasto({ ...formGasto, monto: "" });
    aviso(`Anotado: ${formGasto.tipo} ${pesos(monto)}`);
  }
  function borrarGasto(clientId: string) {
    setCuentas(c => ({ ...c, gastos: c.gastos.filter(g => g.client_id !== clientId) }));
    encolar("gasto_borrar", { gasto_client_id: clientId });
  }
  function guardarVenta() {
    const c = useApp.getState().datos.cuentas;
    encolar("cuaderno", { cargas: c.cargas, precio: c.precio });
  }
  function confirmarBorrado() {
    if (borrarArmado.current) { borrarArmado.current = false; return true; }
    borrarArmado.current = true;
    aviso("Toca otra vez para borrar las cuentas");
    setTimeout(() => { borrarArmado.current = false; }, 3000);
    return false;
  }
  function cosechaNueva() {
    if (!confirmarBorrado()) return;
    setCuentas(c => ({ cultivo: c.cultivo, gastos: [], cargas: null, precio: null }));
    encolar("cuentas_reiniciar", { cultivo: cuentas.cultivo });
  }

  /* Dictado por voz del valor ("cincuenta mil", "50000", "1 millón") */
  function dictarMonto(boton: HTMLButtonElement) {
    const r = crearReconocedor();
    if (!r) { aviso("Este navegador no permite dictar. Escribe el valor."); return; }
    boton.classList.add("hablando");
    r.onresult = (e: { results: { 0: { 0: { transcript: string } } } }) => {
      const monto = interpretarMonto(e.results[0][0].transcript);
      if (monto) { setFormGasto(f => ({ ...f, monto: String(monto) })); aviso(`Entendí ${pesos(monto)}`); }
      else aviso("No entendí el valor. Intenta otra vez o escríbelo.");
    };
    r.onerror = () => aviso("No se pudo usar el micrófono");
    r.onend = () => boton.classList.remove("hablando");
    r.start();
  }

  return (
    <>
      <Volver texto="Mi finca" onClick={() => ir("finca")} />
      <h2 className="titulo-modulo">Cuaderno de cuentas</h2>
      <p className="subtitulo-pantalla">Anota lo que gastas y lo que vendes para negociar mejor</p>
      <div className="filtros">{cultivosCuentas.map(c => <button key={c} className={`chip ${cuentas.cultivo === c ? "activo" : ""}`} onClick={() => elegirCultivo(c)}>{c}</button>)}</div>

      <div className="resumen-cuentas">
        <div><small>Invertí</small><b>{pesos(invertido)}</b></div>
        <div><small>Vendí</small><b>{pesos(vendido)}</b></div>
        <div className={`resultado ${resultado >= 0 ? "gana" : "pierde"}`}><small>{resultado >= 0 ? "Gané" : "Perdí"}</small><b>{pesos(Math.abs(resultado))}</b></div>
      </div>
      {cargas > 0 && invertido > 0 && <div className="consejo-precio"><Icono nombre="aviso" /><span>Para no perder, vende cada carga a mínimo <b>{pesos(minimo)}</b>.</span></div>}

      <div className="paso-titulo"><span className="paso-num">1</span> ¿Cuánto invertí?</div>
      <div className="formulario">
        <div className="filtros">{tiposGasto.map(t => <button key={t} className={`chip ${formGasto.tipo === t ? "activo" : ""}`} onClick={() => setFormGasto({ ...formGasto, tipo: t })}>{t}</button>)}</div>
        <div className="fila-monto">
          <span className="signo">$</span>
          <input className="campo campo-monto" id="montoGasto" inputMode="numeric" value={formGasto.monto}
            onChange={e => setFormGasto({ ...formGasto, monto: soloDigitos(e.target.value) })} placeholder="0" />
          <button className="boton-dictar" onClick={e => dictarMonto(e.currentTarget)} aria-label="Dictar el valor"><Icono nombre="dictar" /></button>
        </div>
        <div className="montos-rapidos">
          {[10000, 50000, 100000].map(v => (
            <button key={v} onClick={() => setFormGasto(f => ({ ...f, monto: String((Number(f.monto) || 0) + v) }))}>+{v.toLocaleString("es-CO")}</button>
          ))}
        </div>
        <button className="boton-ancho" onClick={anotarGasto}>Anotar gasto</button>
        {cuentas.gastos.length > 0 && (
          <div className="lista-gastos">
            {cuentas.gastos.map(g => (
              <div key={g.client_id} className="gasto-fila"><span>{g.tipo}</span><b>{pesos(g.monto)}</b>
                <button onClick={() => borrarGasto(g.client_id)} aria-label="Borrar">×</button></div>
            ))}
          </div>
        )}
      </div>

      <div className="paso-titulo"><span className="paso-num">2</span> ¿Cuánto vendí?</div>
      <div className="formulario venta">
        <div><label className="etiqueta-campo">Cargas vendidas</label>
          <input className="campo" inputMode="numeric" value={cuentas.cargas ?? ""} placeholder="0"
            onChange={e => setCuentas(c => ({ ...c, cargas: aNumero(soloDigitos(e.target.value)) }))} onBlur={guardarVenta} /></div>
        <div><label className="etiqueta-campo">Precio por carga</label>
          <input className="campo" inputMode="numeric" value={cuentas.precio ?? ""} placeholder="$ 0"
            onChange={e => setCuentas(c => ({ ...c, precio: aNumero(soloDigitos(e.target.value)) }))} onBlur={guardarVenta} /></div>
      </div>
      <button className="boton-texto" onClick={cosechaNueva}>Empezar una cosecha nueva</button>
    </>
  );
}
