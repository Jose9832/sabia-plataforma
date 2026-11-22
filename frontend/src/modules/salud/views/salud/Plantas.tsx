/* Botiquín de plantas: «Plantas de la vereda» (campesina) y «Botiquín de plantas» (afro). */
import { BotonLeer, TarjetaModulo, Volver } from "../../components/comunes";
import { Icono } from "../../components/icons/Icono";
import { useApp } from "../../state/store";

export function Plantas({ variante }: { variante: "campesina" | "afro" }) {
  const detalle = useApp(s => s.nav.detalle);
  const plantas = useApp(s => s.datos.plantas);
  const ir = useApp(s => s.ir);
  const campo = variante === "campesina";
  const nombreLista = campo ? "Plantas de la vereda" : "Botiquín de plantas";

  if (detalle) {
    const p = plantas.find(x => x.slug === detalle);
    if (!p) return <Volver texto={nombreLista} onClick={() => ir("salud", "plantas")} />;
    const usoTitulo = campo ? "Para qué sirve" : "Para qué se usa";
    const ir_a = campo ? "Ve al hospital si hay:" : "Ve al centro de salud si hay:";
    return (
      <>
        <Volver texto={nombreLista} onClick={() => ir("salud", "plantas")} />
        <div className="tarjeta-palabra">
          <div className="foto-planta grande" style={{ background: p.color, color: "var(--verde)" }}>
            <Icono nombre="hoja" className="" width={64} height={64} style={{ opacity: 0.55 }} /><span>Foto de la planta</span>
          </div>
          <div className="cuerpo">
            <h2 style={campo ? { fontSize: 24 } : { fontSize: 24, marginBottom: 6 }}>{p.nombre}</h2>
            {campo && p.cientifico && <div style={{ fontSize: 14, color: "var(--texto-suave)", fontStyle: "italic", marginBottom: 6 }}>{p.cientifico}</div>}
            <span className="insignia-ventana publico">{campo ? "Pendiente: validar con los mayores de la vereda" : "Pendiente: validar con las sabedoras"}</span>
            <div className="seccion-titulo">{usoTitulo}</div><p>{p.uso}</p>
            <div className="seccion-titulo">Cómo se prepara</div><p>{p.preparacion}</p>
            <div className="seccion-titulo">Precaución</div><p>{p.precaucion}</p>
            <div className="caja-urgente" style={{ marginTop: 16 }}><Icono nombre="hospital" /><span><b>{ir_a}</b> {p.hospital}</span></div>
            <BotonLeer texto={`${p.nombre}. ${usoTitulo}: ${p.uso} Cómo se prepara: ${p.preparacion} Precaución: ${p.precaucion} ${ir_a.replace(":", "")}: ${p.hospital}`}>Escuchar</BotonLeer>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Volver texto="Salud" onClick={() => ir("salud")} />
      <h2 className="titulo-modulo">{nombreLista}</h2>
      <p className="subtitulo-pantalla">{campo ? "Botiquín de plantas que usan nuestros mayores" : "Los remedios de la casa, el primer cuidado de la familia"}</p>
      <div className="caja-urgente suave"><Icono nombre="aviso" /><span>Este conocimiento es tradicional y <b>no reemplaza la consulta médica</b>.</span></div>
      <div className="modulos">
        {plantas.map(p => (
          <TarjetaModulo key={p.slug} icono={<Icono nombre="hoja" />} fondo={p.color} color="var(--verde)"
            titulo={p.nombre} desc={p.uso} voz={`${p.nombre}. ${p.uso}`} onClick={() => ir("salud", "plantas", p.slug)} />
        ))}
      </div>
    </>
  );
}
