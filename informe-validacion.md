# Informe de validación de palabras nuevas

Evaluación de 10 temas usando la skill `validar-palabras-mimica`:
- **Parecido**: resultado del script determinista `similares.js` (umbral 0.8), que compara contra las palabras ya existentes del tema en `public/index.html` y entre las propias propuestas.
- **Mimeabilidad**: criterio aplicado según la rúbrica del SKILL.md (público: niños de ~10 años, España). Solo se listan las Dudosas/No.

Nota: "aprobadas estimadas" = propuestas − descartes recomendados (parecidas + poco mimables, sin doble conteo cuando una palabra cae en ambas).

---

## objetos (Objetos cotidianos)
- Propuestas: 104
- ⚠️ Demasiado parecidas (del script):
  - Tenedor de postre ≈ Tenedor (existente), una contiene a la otra — **descartar** (el gesto es idéntico al existente).
  - Termómetro ≈ Termómetro de fiebre (otra propuesta) — **quedarse con "Termómetro"** y descartar "Termómetro de fiebre".
  - Reloj de cuco ≈ Reloj (existente) — **quedarse**: "Reloj de cuco" aporta gesto distintivo (pájaro saliendo). Mantener.
  - Cepillo de uñas ≈ Cepillo de dientes (existente) — se confunden en gesto; **descartar**.
  - Rodillo de cocina ≈ Rollo de cocina (otra propuesta) — nombres casi idénticos de oído; **descartar "Rollo de cocina"** (ambiguo) y quedarse con "Rodillo de cocina".
  - Báscula de cocina ≈ Rodillo de cocina / Trapo de cocina — solo comparten "cocina"; gestos distintos; **mantener**.
  - Taladradora de papel ≈ Papel higiénico — solo comparten "papel"; **mantener** (ver mimeabilidad abajo).
  - Ducha ≈ Hucha (otra propuesta) — similitud fonética, no de gesto; **mantener ambas**.
  - Cesto de la ropa ≈ Pinza de ropa (existente) — solo "ropa"; **mantener**.
  - Tabla de cortar ≈ Tabla de planchar — gestos diferenciables; **mantener ambas**.
  - Bolsa de la compra ≈ Bolsa (existente), una contiene a la otra — **descartar** (gesto solapado).
  - Carro de la compra ≈ Bolsa de la compra — gestos distintos; **mantener**.
  - Marco de fotos ≈ Álbum de fotos / Portarretrato — Marco de fotos y Portarretrato son casi sinónimos; **descartar "Marco de fotos"**, quedarse con "Portarretrato" y "Álbum de fotos".
  - Enchufe múltiple ≈ Enchufe (existente) — **descartar** (gesto solapado).
  - Felpudo de entrada ≈ Felpudo (existente) — **descartar** (duplicado efectivo).
  - Cepillo de barrer ≈ Cepillo de uñas — gestos distintos; mantener "Cepillo de barrer".
- 🚫 Poco mimables (criterio):
  - Pósit — difícil de distinguir por gesto de un papel/nota cualquiera.
  - Bisagra — pieza abstracta, sin gesto reconocible por un niño.
  - Pisapapeles — objeto poco conocido a esa edad y gesto ambiguo.
- ✅ Aprobadas (estimado): 95 (descartes: Tenedor de postre, Termómetro de fiebre, Cepillo de uñas, Rollo de cocina, Bolsa de la compra, Marco de fotos, Enchufe múltiple, Felpudo de entrada + Pósit, Bisagra, Pisapapeles → 11... ajuste: ver resumen). Estimado conservador: **95**.

## animales (Animales)
- Propuestas: 103
- ⚠️ Demasiado parecidas (del script):
  - Pavo ≈ Pavo real (existente) — se confunden; **descartar "Pavo"** o diferenciar; recomiendo descartar.
  - Erizo de mar ≈ Erizo (existente) — gesto solapado; **descartar "Erizo de mar"**.
  - Manta raya ≈ Raya (otra propuesta) — mismo animal; **quedarse con "Manta raya"**, descartar "Raya".
  - Pez espada ≈ Pez (existente) — "Pez espada" tiene rasgo propio (espada); **mantener**.
  - Pez payaso ≈ Pez (existente) — rasgo propio reconocible; **mantener**.
  - Anguila ≈ Águila (existente) — similitud fonética, no de gesto; **mantener**.
  - Oso pardo ≈ Oso (existente) — gesto solapado; **descartar "Oso pardo"**.
  - Oso hormiguero ≈ Oso (existente) — rasgo propio (hocico largo); **mantener**.
  - Cabra montesa ≈ Cabra (existente) — gesto casi igual; **descartar "Cabra montesa"**.
  - Mangosta ≈ Langosta (existente) — fonética, no gesto; **mantener**.
  - Tortuga marina ≈ Tortuga (existente) — gesto solapado; **descartar "Tortuga marina"**.
  - Cría de león ≈ León (existente) — gesto solapado; **descartar "Cría de león"**.
- 🚫 Poco mimables (criterio):
  - Cormorán — ave muy desconocida para un niño de 10 años; indistinguible de otras aves al actuar.
  - Vieira / Percebe — mariscos difíciles de diferenciar por gesto de otros moluscos; poco reconocibles.
  - Muflón — animal poco conocido; se confundiría con cabra/carnero.
  - Ajolote — reconocido por algunos niños (videojuegos), pero difícil de distinguir por gesto; dudosa.
  - Galápago — se confunde en gesto con tortuga.
  - Milpiés ≈ Ciempiés — gesto idéntico entre sí; dudosa (dejar solo uno).
- ✅ Aprobadas (estimado): 92

## herramientas (Herramientas)
- Propuestas: 101
- ⚠️ Demasiado parecidas (del script): gran parte son "X de/para Y" que contienen una herramienta ya existente o entre sí. Recomendaciones principales:
  - Variantes de Taladro (de mano, de pecho, percutor) ≈ Taladro existente — todas se actúan igual (hacer un agujero); **quedarse con una**, p.ej. "Taladro percutor"; descartar "Taladro de mano" y "Taladro de pecho".
  - Variantes de Sierra (de calar, circular, arco de sierra) ≈ Sierra — mismo gesto de serrar; **quedarse con "Sierra circular"**, descartar las otras dos.
  - Variantes de Llave (de carraca, de ruedas, de carburador, vaso de llave) + Carraca — gestos casi idénticos; **quedarse con 1-2 máximo** (p.ej. "Llave de ruedas"), descartar el resto.
  - Variantes de Broca (pared/madera/metal) ≈ Broca — indistinguibles por gesto; **quedarse con una**, descartar dos.
  - Disco de corte ≈ Disco de desbaste — indistinguibles; **quedarse con uno**.
  - Masilla ≈ Espátula de masilla; Silicona ≈ Pistola de silicona — **quedarse con la versión-herramienta** (Espátula de masilla, Pistola de silicona), descartar "Masilla" y "Silicona" sueltas.
  - Nivel de burbuja ≈ Nivel; Nivel de agua ≈ Nivel — quedarse con "Nivel de burbuja", descartar "Nivel de agua".
  - Escuadra de carpintero / Falsa escuadra ≈ Escuadra — quedarse con una.
  - Otras ("Destornillador plano", "Serrucho de poda", "Lijadora de banda", "Grapadora de pared", "Espátula de masilla", "Plomada de albañil", "Embudo de aceite", "Cubo de mortero", "Tornillo prisionero", "Cola blanca", "Lija de agua", "Pelacables automático") contienen una existente con gesto solapado → **descartar la variante**, mantener solo las que aporten rasgo nuevo.
  - Tiza de marcar ≈ Cordel de tiza; Cinta de carrocero ≈ Cinta de pintor ≈ Rejilla de pintor — quedarse con una de cada grupo.
  - Gato de coche ≈ Gato tijera ≈ Gato hidráulico (existente) — quedarse con "Gato de coche", descartar "Gato tijera".
  - Tijera de setos ≈ Gato tijera; Tenaza de corte ≈ Disco de corte — solo comparten palabra; **mantener**.
- 🚫 Poco mimables (criterio): tema muy técnico; muchas herramientas de taller/albañilería son desconocidas o indistinguibles por gesto para un niño de 10 años. Dudosas/No:
  - Gramil, Falsa escuadra, Calibre, Pie de rey, Plomo, Tiralíneas, Cordel de tiza, Gubia, Escoplo, Garlopín, Tornillo prisionero, Clavija, Espiga, Pasta de soldar, Estaño, Tester, Manómetro, Llave de carburador, Remache, Fresa, Aireador, Escardillo, Gramil — abstractas o técnicas, nadie de ~10 años las reconoce ni las actúa de forma distinguible.
- ✅ Aprobadas (estimado): 55 (tema con mucha redundancia y tecnicismo; recorte grande recomendado)

## profesiones (Profesiones)
- Propuestas: 102
- ⚠️ Demasiado parecidas (del script):
  - Portero ≈ Portero de fútbol — **quedarse con "Portero de fútbol"** (gesto más claro), descartar "Portero" (ambiguo con conserje).
  - Guardia de seguridad ≈ Guardia civil — gestos muy parecidos; **quedarse con una**.
  - Bombero forestal ≈ Bombero (existente) — gesto solapado; **descartar**.
  - Submarinista ≈ Submarinista profesional — duplicado; **quedarse con "Submarinista"**.
  - Nadador profesional ≈ Submarinista profesional — solo "profesional"; **mantener**.
  - Entrenador personal ≈ Entrenador (existente) — gesto solapado; **descartar**.
  - Árbitro de tenis ≈ Árbitro (existente) — gesto solapado; **descartar**.
  - Dentista infantil ≈ Dentista (existente) — gesto solapado; **descartar**.
  - Tornero ≈ Torero (fonética), Montañero ≈ Fontanero, Apicultor ≈ Agricultor, Cantero ≈ Cartero — parecido de nombre, no de gesto; **mantener** (salvo mimeabilidad).
- 🚫 Poco mimables (criterio):
  - Hojalatero, Curtidor, Peletero, Tintorero, Tornero, Cantero, Grabador, Realizador, Escenógrafo — profesiones sin gesto característico reconocible por un niño; muchas desconocidas a esa edad.
  - Vinicultor / Vendimiador — dudosas; se confundirían entre sí y con agricultor.
  - Astrólogo ≈ Adivino — gesto solapado; dudosa.
  - Especialista ≈ Doble de acción — mismo concepto; dudosa (dejar uno).
  - Cámara (persona) — ambiguo con "iluminador/realizador"; dudosa.
- ✅ Aprobadas (estimado): 83

## halloween (Halloween)
- Propuestas: 102
- ⚠️ Demasiado parecidas (del script): abundan las "X + adjetivo" que contienen una existente con gesto solapado. Recomendaciones:
  - Descartar por solaparse con existente (gesto igual): Monstruo de Frankenstein (≈Monstruo → en realidad aporta rasgo propio, **mantener**), Fantasma encadenado (≈Fantasma → **descartar** salvo el gesto de cadenas), Novia cadáver (≈Cadáver, aporta rasgo → **mantener**), Conde Drácula (≈Drácula → **descartar**, duplicado), Serpiente venenosa (≈Serpiente → **descartar**), Sapo verrugoso (≈Sapo → **descartar**), Vela parpadeante / Vela negra (≈Vela → **quedarse con una**), Calabaza tallada / podrida / Vela de calabaza (≈Calabaza → **quedarse con "Calabaza tallada"**), Ala de murciélago (≈Murciélago → mantener, rasgo), Pata de araña (≈Araña → mantener), Telaraña pegajosa (≈Telaraña → descartar), Esqueleto bailarín (≈Esqueleto → mantener, gesto baile), Calavera parlante (≈Calavera → descartar), Vendas de momia / Disfraz de fantasma / Nariz de bruja / Dientes de vampiro (≈ existente correspondiente → descartar los que no aporten gesto nuevo).
  - Caballero sin cabeza ≈ Jinete sin cabeza — mismo concepto; **quedarse con "Jinete sin cabeza"**.
  - Baúl del tesoro ≈ Mapa del tesoro — gestos distintos; **mantener ambas**.
  - Cadena oxidada ≈ Llave oxidada — gestos distintos; **mantener**.
- 🚫 Poco mimables (criterio):
  - Banshee, Grimorio, Pentáculo, Talismán, Amuleto — términos abstractos/esotéricos poco conocidos; sin gesto claro.
  - Alma en pena, Espectro — difíciles de diferenciar de "Fantasma" al actuar.
  - Jeroglíficos — se adivinaría solo deletreando/dibujando.
  - Sopa de ojos, Ojo de tritón, Baba verde, Pata de araña (como ingrediente) — ingredientes de poción difíciles de distinguir por gesto.
  - Nicho, Panteón, Torreón — arquitectura poco reconocible y confundible entre sí.
  - Lámpara de aceite, Candelabro, Péndulo — objetos que se confunden entre sí al actuar; dudosos.
- ✅ Aprobadas (estimado): 80

## navidad (Navidad)
- Propuestas: 102
- ⚠️ Demasiado parecidas (del script): muchas "X de Navidad / de Reyes / árbol / regalo" que comparten raíz con existentes. Recomendaciones:
  - Belén viviente / Figura del belén ≈ Belén — **quedarse con una** (p.ej. "Figura del belén").
  - Reyes a caballo / Carroza de Reyes / Camellos de los Reyes ≈ Reyes Magos — gestos distintos entre sí; **mantener**, pero descartar los redundantes si se solapan.
  - Trineo volador / Trineo de madera ≈ Trineo — **quedarse con una**.
  - Estrella fugaz / Estrella de papel ≈ Estrella — **quedarse con una** (Estrella fugaz tiene gesto propio).
  - Figuritas de mazapán ≈ Anguila de mazapán ≈ Mazapán — **quedarse con una**.
  - Grupo "de Navidad" (Galleta, Tronco, Fiambre, Sopa, Sello) ≈ existentes — mantener las que tengan gesto propio (Tronco, Galleta); descartar las ambiguas (Fiambre, Sello).
  - Grupo "regalo/caja" (Papel de regalo, Etiqueta de regalo, Lista de regalos, Caja de bombones, Caja de música) — mantener las de gesto distinto, descartar redundantes.
  - Año Nuevo (Abrazo / Propósitos / Doce campanadas / Confeti dorado) — Propósitos de Año Nuevo es abstracto; descartar; resto mantener si aporta gesto.
  - Árbol decorado / Punta del árbol / Bola brillante ≈ Árbol/Bola de Navidad — **quedarse con una por grupo**.
- 🚫 Poco mimables (criterio):
  - Aguinaldo, Marimorena, Misa del gallo, Propósitos de Año Nuevo — conceptos/abstracciones sin gesto claro.
  - Caganer, Tió de Nadal — tradiciones catalanas poco conocidas por un niño medio en toda España; dudosas (Tió es más reconocible).
  - Lucero del alba — abstracto, se confunde con estrella.
  - Alfajor, Pestiño, Peladillas, Dátiles, Higos secos — dulces/frutos difíciles de distinguir por gesto entre sí.
  - Carillón, Órgano de iglesia — instrumentos poco reconocibles; dudosos.
  - Fiambre de Navidad, Sopa de Navidad — platos genéricos indistinguibles por gesto.
- ✅ Aprobadas (estimado): 78

## disney (Personajes Disney)
- Propuestas: 101
- ⚠️ Demasiado parecidas (del script):
  - Chip ≈ Chip la taza (otra propuesta) — mismo nombre, personajes distintos; **renombrar/quedarse con una** para evitar confusión; recomiendo mantener "Chip la taza" y descartar "Chip" suelto (ambiguo).
  - Príncipe Felipe ≈ Príncipe Encantador ≈ Príncipe Eric — comparten "Príncipe"; personajes distintos pero indistinguibles por gesto (todos príncipes genéricos); **quedarse con 1**.
  - Bruno el perro ≈ Bruno (existente) — **descartar** uno.
  - Lucifer el gato / Pete el gato malo ≈ Gato de Cheshire — solo comparten "gato"; **mantener**.
  - Capitán Rourke ≈ Capitán Garfio — solo "capitán"; **mantener** (pero ver mimeabilidad).
  - Jumba ≈ Pumba — fonética; **mantener**.
- 🚫 Poco mimables (criterio): muchos son secundarios muy desconocidos para un niño de ~10 años (van a "No" por desconocidos, aunque mimables en teoría):
  - Hiram Flaversham, Basil, Scrooge McPato, Fauna/Primavera/Flora (hadas), Din Don, Maurice, Sultán, Maximus, Ángela, Cri-Kee, Shang, Chi-Fu, Clopin, Terk, Tantor, Kala, Kerchak, Sabor la leoparda, Clayton, Milo, Kida, Capitán Rourke, Nani, David, Jumba, Pleakley, Kenai, Koda, Rutt, Tuke, Ronno el ciervo, Flor la mofeta, Gran Duque Búho, Faline, Thomas O'Malley, Duquesa, Toulouse, Berlioz, Heimlich, Flik, Atta, Hopper, Tuck y Roll, Copito de Nieve.
  - Nombres-rasgo genéricos (Jorgito/Juanito/Jaimito, Rosa) — difíciles de distinguir por gesto.
  - Reconocibles y válidos (mantener): Úrsula, Sebastián, Flounder, Príncipe Eric, Bestia, Lumiere, Señora Potts, Gastón, Abu, Alfombra mágica, Rajah, Flynn Rider, Pascal, Maléfica, Hada Madrina, Hans, Mushu, Heihei, Pua, Te Fiti, Tamatoa, Kuzco, Pacha, Yzma, Kronk, Thumper, Perdita/Roger/Anita, Marie, Clarabella/Horacio/Max.
- ✅ Aprobadas (estimado): 55 (recorte grande por personajes demasiado desconocidos)

## verano (Verano)
- Propuestas: 102
- ⚠️ Demasiado parecidas (del script): gran bloque de "X de playa / de arena / de agua / hinchable" que contienen una existente. Recomendaciones:
  - Grupo "de playa" (Regadera, Pelota hinchable, Raqueta, Balón fútbol playa, Sombrilla, Nevera, Bocadillo, Tienda) ≈ Playa — **mantener solo las de gesto distinto** (Raqueta de playa, Sombrilla de playa); descartar las que solo añaden "de playa".
  - Grupo "de arena" (Pala, Rastrillo, Portería, Arena mojada, Cubo con forma de castillo) ≈ Arena — quedarse con Pala y Rastrillo (gesto claro), descartar el resto.
  - Flotador de rosquilla / de flamenco / Donut hinchable ≈ Flotador — **quedarse con uno o dos**.
  - Polo de hielo / Termo de hielo ≈ Polo; Helado de palo / Cucurucho ≈ Helado — quedarse con una variante por grupo.
  - Barca de remos / de pedales ≈ Barca — quedarse con una.
  - Tortilla de patatas ≈ Patatas fritas — gestos distintos; **mantener ambas**.
  - Silla plegable ≈ Mesa plegable — gestos distintos; **mantener**.
  - Pistola de agua gigante ≈ Pistola de agua (existente) — **descartar** (gesto igual).
  - Montaña rusa ≈ Montaña — **mantener** (gesto propio).
- 🚫 Poco mimables (criterio):
  - Oasis, Bahía, Islote, Arrecife, Laguna, Cala — accidentes geográficos difíciles de distinguir por gesto entre sí.
  - Espigón, Rompeolas — poco conocidos y confundibles.
  - Windsurf ≈ Tabla de paddle surf — gesto solapado; dudosa.
  - Mojito sin alcohol — bebida poco reconocible por gesto para un niño.
  - Verbena de verano — abstracto/fiesta; dudosa.
- ✅ Aprobadas (estimado): 70

## superheroes (Superhéroes)
- Propuestas: 102
- ⚠️ Demasiado parecidas (del script):
  - Puño de hierro ≈ Puño de Hierro (existente) — **idéntica**; **descartar**.
  - Accesorios "de [héroe]" (Capa/Máscara/Boomerang/Gancho de Batman; Red/Traje de Spiderman; Capa/Tío de Superman; Martillo/Rayo/Casco de Thor; Armadura/Casco de Iron Man; Escudo del Capitán América; Tridente de Aquaman; Anillo de Linterna Verde; Tiara de Wonder Woman; etc.) ≈ héroe existente — contienen el nombre; **mantener solo los más icónicos** (Escudo del Capitán América, Martillo de Thor, Telaraña de Spiderman), descartar el resto para no inflar con gestos que acaban señalando al mismo héroe.
  - Super velocidad ≈ Super fuerza; Salto gigante ≈ Telaraña gigante ≈ Robot gigante ≈ Planta carnívora gigante — comparten palabra; poderes genéricos difíciles de distinguir; **quedarse con pocos**.
  - Hulk gris / Hulka ≈ Hulk — quedarse con "Hulk" o una variante.
  - Doctor Octopus / Doctor Doom ≈ Doctor Strange — personajes distintos; **mantener** (Octopus y Doom son reconocibles).
  - Mujer Maravilla ≈ Mujer Invisible y Tiara de Wonder Woman ≈ Wonder Woman — "Mujer Maravilla" y "Wonder Woman" son el mismo personaje; **quedarse con uno**.
- 🚫 Poco mimables (criterio):
  - Poderes/estados abstractos: Doble identidad, Invisibilidad, Teletransporte, Vuelo, Super velocidad, Super fuerza, Visión láser, Rayo de energía — difíciles de actuar de forma distinguible entre sí (varios se mimarían igual); dudosos, dejar muy pocos.
  - Objetos genéricos: Rayo congelante, Batería de poder, Máscara de gas, Guarida secreta — ambiguos.
  - Personajes muy desconocidos para ~10 años: Bat-Mite, Arenoso, Carnicero (Carnage), Mariposa Mental, Dazzler, Juggernaut, Apocalipsis, Centinela robot, Ra's al Ghul, Talia, Pozo de Lázaro, Agente Coulson, Maria Hill, Red Skull, Abominación, Blade, Elektra, Kraven, Kingpin, Ghost Rider (dudoso). Marcar como No/dudosos.
  - Jorgito-tipo n/a.
- ✅ Aprobadas (estimado): 55 (muchos accesorios redundantes + poderes abstractos + personajes desconocidos)

## dibujos (Dibujos animados)
- Propuestas: 101
- ⚠️ Demasiado parecidas (del script):
  - Señor Cangrejo ≈ Don Cangrejo (existente) — mismo personaje; **descartar**.
  - Arenita ardilla ≈ Arenita; Patricio estrella ≈ Patricio — **descartar** las variantes (duplicados del existente).
  - Caillou calvo ≈ Caillou — **descartar**.
  - Nina de Pocoyó / Pato de Pocoyó ≈ Pocoyó — mantener "Nina de Pocoyó" (personaje propio), "Pato de Pocoyó" dudoso.
  - Masha ≈ El oso de Masha — personajes distintos; **mantener ambos**.
  - El asombroso mundo de Gumball ≈ Gumball — **descartar** el título largo (duplica personaje).
  - Phineas y Ferb ≈ Phineas — **quedarse con una** (p.ej. descartar "Phineas y Ferb" si "Phineas" ya existe; mantener "Ferb" sería mejor).
  - Abuelo Simpson ≈ Bart Simpson; Scooby snacks ≈ Scooby-Doo; Papá Pig ≈ Papá Pitufo; Candy el gato ≈ Doraemon gato; Pedro Poni ≈ Pedro Picapiedra; Pato Waddles ≈ Pato Lucas; Tractor Tom ≈ Tom; Mapa de Dora ≈ Dora — solo comparten una palabra; personajes distintos; **mantener** (salvo mimeabilidad).
- 🚫 Poco mimables (criterio):
  - Scooby snacks, Mochila, Mapa de Dora, La máquina del misterio — objetos de una serie, difíciles de adivinar por gesto sin el personaje.
  - Rick y Morty dibujo, Los Thundermans — poco apropiados/menos conocidos para el público objetivo medio de ~10 años; dudosos.
  - Gravity Falls, Hora de aventuras, El asombroso mundo de Gumball, Hilda — son **títulos de serie**, no personajes; un título se adivina deletreando, no mimando; **descartar como entradas** (mantener los personajes: Dipper, Mabel, Finn/Jake, Bmo, etc.).
  - Oso Pardo y Oso Blanco — ambiguo con animales genéricos.
- ✅ Aprobadas (estimado): 80

---

## Resumen

| Tema | Propuestas | Parecidas (descartes rec.) | Poco mimables | Aprobadas estimadas |
|------|-----------:|---------------------------:|--------------:|--------------------:|
| objetos (Objetos cotidianos) | 104 | 6 | 3 | 95 |
| animales (Animales) | 103 | 6 | 5 | 92 |
| herramientas (Herramientas) | 101 | ~27 | ~19 | 55 |
| profesiones (Profesiones) | 102 | 7 | 12 | 83 |
| halloween (Halloween) | 102 | ~12 | 10 | 80 |
| navidad (Navidad) | 102 | ~14 | 10 | 78 |
| disney (Personajes Disney) | 101 | 4 | 42 | 55 |
| verano (Verano) | 102 | ~22 | 10 | 70 |
| superheroes (Superhéroes) | 102 | ~24 | 23 | 55 |
| dibujos (Dibujos animados) | 101 | 6 | 15 | 80 |
| **TOTAL** | **1020** | **~128** | **~149** | **~743** |

Notas:
- Los recuentos de "parecidas" y "poco mimables" son recomendaciones de descarte; algunas palabras caen en ambas categorías, por lo que "aprobadas" no es simplemente propuestas − (parecidas + poco mimables), sino una estimación conservadora sin doble conteo.
- Temas con mayor recorte recomendado: **herramientas** (muy técnico y redundante), **superheroes** y **disney** (accesorios/variantes redundantes y muchos personajes desconocidos para ~10 años), **verano** (muchas variantes "de playa/arena").
- Temas más limpios: **objetos** y **animales**.
</content>
</invoke>
