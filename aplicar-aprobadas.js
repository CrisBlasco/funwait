#!/usr/bin/env node
/*
 * Añade al juego las palabras APROBADAS por tema = propuestas − descartes.
 * Los descartes se han extraído del informe-validacion.md (parecidas + poco mimables).
 *
 *   node aplicar-aprobadas.js            → solo informe (no toca el juego) + escribe descartadas.md
 *   node aplicar-aprobadas.js --apply    → además añade las aprobadas a public/index.html
 */
const fs = require('fs');

const PROPUESTAS = 'palabras-nuevas-revision.md';
const INDEX = 'public/index.html';
const APPLY = process.argv.includes('--apply');

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

// ---- descartes por tema (cadenas exactas copiadas de las propuestas) ----
const DESCARTES = {
  objetos: ["Tenedor de postre","Termómetro de fiebre","Cepillo de uñas","Rollo de cocina","Bolsa de la compra","Marco de fotos","Enchufe múltiple","Felpudo de entrada","Pósit","Bisagra","Pisapapeles"],
  animales: ["Pavo","Erizo de mar","Raya","Oso pardo","Cabra montesa","Tortuga marina","Cría de león","Cormorán","Vieira","Percebe","Muflón","Ajolote","Galápago","Milpiés"],
  herramientas: ["Taladro de mano","Taladro de pecho","Sierra de calar","Arco de sierra","Llave de carraca","Vaso de llave","Carraca","Llave de carburador","Broca de pared","Broca de metal","Disco de desbaste","Masilla","Silicona","Nivel de agua","Falsa escuadra","Destornillador plano","Serrucho de poda","Lijadora de banda","Grapadora de pared","Plomada de albañil","Embudo de aceite","Cubo de mortero","Tornillo prisionero","Cola blanca","Lija de agua","Pelacables automático","Cordel de tiza","Cinta de pintor","Rejilla de pintor","Gato tijera","Gramil","Calibre","Pie de rey","Plomo","Tiralíneas","Gubia","Escoplo","Garlopín","Clavija","Espiga","Pasta de soldar","Estaño","Tester","Manómetro","Remache","Fresa","Aireador","Escardillo"],
  profesiones: ["Portero","Guardia de seguridad","Bombero forestal","Submarinista profesional","Entrenador personal","Árbitro de tenis","Dentista infantil","Hojalatero","Curtidor","Peletero","Tintorero","Tornero","Cantero","Grabador","Realizador","Escenógrafo","Vinicultor","Vendimiador","Astrólogo","Especialista","Cámara"],
  halloween: ["Fantasma encadenado","Conde Drácula","Serpiente venenosa","Sapo verrugoso","Vela negra","Calabaza podrida","Vela de calabaza","Telaraña pegajosa","Calavera parlante","Vendas de momia","Disfraz de fantasma","Nariz de bruja","Dientes de vampiro","Caballero sin cabeza","Banshee","Grimorio","Pentáculo","Talismán","Amuleto","Alma en pena","Espectro","Jeroglíficos","Sopa de ojos","Ojo de tritón","Baba verde","Nicho","Panteón","Torreón","Lámpara de aceite","Candelabro","Péndulo"],
  navidad: ["Belén viviente","Trineo de madera","Estrella de papel","Anguila de mazapán","Fiambre de Navidad","Sello de Navidad","Papel de regalo brillante","Propósitos de Año Nuevo","Árbol decorado","Bola brillante","Aguinaldo","Marimorena","Misa del gallo","Caganer","Lucero del alba","Alfajor","Pestiño","Peladillas","Dátiles","Higos secos","Carillón","Órgano de iglesia","Sopa de Navidad"],
  disney: ["Chip","Príncipe Felipe","Príncipe Encantador","Bruno el perro","Hiram Flaversham","Basil","Scrooge McPato","Fauna","Primavera","Flora","Din Don","Maurice","Sultán","Maximus","Ángela","Cri-Kee","Shang","Chi-Fu","Clopin","Terk","Tantor","Kala","Kerchak","Sabor la leoparda","Clayton","Milo","Kida","Capitán Rourke","Nani","David","Jumba","Pleakley","Kenai","Koda","Rutt","Tuke","Ronno el ciervo","Flor la mofeta","Gran Duque Búho","Faline","Thomas O'Malley","Duquesa","Toulouse","Berlioz","Gusano Heimlich","Flik","Atta","Hopper","Tuck y Roll","Copito de Nieve","Jorgito","Juanito","Jaimito","Rosa"],
  verano: ["Regadera de playa","Pelota de playa hinchable","Balón de fútbol playa","Nevera de playa","Bocadillo de playa","Tienda de playa","Portería de arena","Arena mojada","Cubo con forma de castillo","Flotador de flamenco","Donut hinchable","Termo de hielo","Cucurucho","Barca de pedales","Pistola de agua gigante","Oasis","Bahía","Islote","Arrecife","Laguna","Cala","Espigón","Rompeolas","Windsurf","Mojito sin alcohol","Verbena de verano"],
  superheroes: ["Puño de hierro","Capa de Batman","Máscara de Batman","Boomerang de Batman","Gancho de Batman","Traje de Spiderman","Capa de Superman","Tío de Superman","Rayo de Thor","Casco de Thor","Armadura de Iron Man","Casco de Iron Man","Tridente de Aquaman","Anillo de Linterna Verde","Tiara de Wonder Woman","Doble identidad","Invisibilidad","Teletransporte","Vuelo","Super velocidad","Super fuerza","Visión láser","Rayo de energía","Rayo congelante","Batería de poder","Máscara de gas","Guarida secreta","Salto gigante","Telaraña gigante","Robot gigante","Planta carnívora gigante","Bat-Mite","Arenoso","Carnicero","Mariposa Mental","Dazzler","Juggernaut","Apocalipsis","Centinela robot","Ra's al Ghul","Talia","Pozo de Lázaro","Agente Coulson","Maria Hill","Red Skull","Abominación","Blade","Elektra","Kraven","Kingpin","Ghost Rider","Hulk gris","Mujer Maravilla"],
  dibujos: ["Señor Cangrejo","Arenita ardilla","Patricio estrella","Caillou calvo","El asombroso mundo de Gumball","Phineas y Ferb","Pato de Pocoyó","Scooby snacks","Mochila","Mapa de Dora","La máquina del misterio","Rick y Morty dibujo","Los Thundermans","Gravity Falls","Hora de aventuras","Hilda","Oso Pardo y Oso Blanco"]
};

// ---- leer propuestas por tema ----
function propuestasPorTema() {
  const txt = fs.readFileSync(PROPUESTAS, 'utf8');
  const out = {};
  const secciones = txt.split(/^##\s+/m);
  for (const sec of secciones) {
    const clave = sec.split(/[\s(]/)[0].trim();
    if (!DESCARTES[clave]) continue;
    out[clave] = [...sec.matchAll(/^\s*-\s+(.+?)\s*$/gm)].map(x => x[1].trim());
  }
  return out;
}

const propuestas = propuestasPorTema();
let html = fs.readFileSync(INDEX, 'utf8');

let totalProp = 0, totalAprob = 0, totalDesc = 0, problemas = 0;
const descartadasDoc = ['# Palabras descartadas por tema', '', 'Extraídas del informe-validacion.md (parecidas + poco mimables).', ''];
const filas = [];

for (const clave of Object.keys(DESCARTES)) {
  const prop = propuestas[clave] || [];
  const desc = DESCARTES[clave];
  const descNorm = new Set(desc.map(norm));
  const aprobadas = prop.filter(p => !descNorm.has(norm(p)));
  const descartadas = prop.filter(p => descNorm.has(norm(p)));

  // descartes que NO casan con ninguna propuesta (posible error de copia)
  const propNorm = new Set(prop.map(norm));
  const huerfanos = desc.filter(d => !propNorm.has(norm(d)));

  totalProp += prop.length; totalAprob += aprobadas.length; totalDesc += descartadas.length;
  filas.push([clave, prop.length, descartadas.length, aprobadas.length, huerfanos.length]);

  descartadasDoc.push(`## ${clave} — ${descartadas.length} descartadas`);
  descartadas.forEach(d => descartadasDoc.push(`- ${d}`));
  if (huerfanos.length) { descartadasDoc.push(`> ⚠️ Descartes sin coincidencia: ${huerfanos.join(', ')}`); problemas += huerfanos.length; }
  descartadasDoc.push('');

  if (APPLY && aprobadas.length) {
    const re = new RegExp(`(${clave}: \\{\\s*\\n\\s*nombre: "[^"]+", emoji: "[^"]*", color: "[^"]*",\\s*\\n\\s*palabras: )(\\[[\\s\\S]*?\\])(\\s*\\n\\s*\\})`);
    if (!re.test(html)) { console.error(`✗ No encontré el array de "${clave}" en ${INDEX}`); process.exit(1); }
    html = html.replace(re, (m, pre, arr, post) => {
      const actuales = JSON.parse(arr);
      const combinado = actuales.concat(aprobadas);
      return pre + JSON.stringify(combinado) + post;
    });
  }
}

fs.writeFileSync('descartadas.md', descartadasDoc.join('\n'));

console.log('tema            propuestas  descartadas  aprobadas  (descartes sin coincidencia)');
for (const [c, p, d, a, h] of filas) {
  console.log(c.padEnd(14), String(p).padStart(10), String(d).padStart(12), String(a).padStart(10), h ? `   ⚠️ ${h}` : '');
}
console.log('-----');
console.log(`TOTAL  propuestas:${totalProp}  descartadas:${totalDesc}  aprobadas:${totalAprob}`);
console.log(problemas ? `\n⚠️  Hay ${problemas} descarte(s) sin coincidencia: revisa descartadas.md antes de aplicar.` : '\n✓ Todos los descartes casan con una propuesta.');
if (APPLY) { fs.writeFileSync(INDEX, html); console.log('\n✅ Aprobadas añadidas a ' + INDEX); }
else console.log('\n(Modo informe: no se ha tocado el juego. Repite con --apply para añadirlas.)');
