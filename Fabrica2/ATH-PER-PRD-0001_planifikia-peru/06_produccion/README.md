# 06 · Producción — ATH-PER-PRD-0001 · PlanifiKIA Perú (CNEB)

**Estado (2026-07-19): PRODUCCIÓN COMPLETA — pendiente 🚪 Compuerta 3.** Compuertas 1 y 2
aprobadas (ver `../bitacora.md`). Molde: kit PlanifiKIA Colombia.

## Entregable
- **15 piezas maquetadas a Word** con marca Atenea en `final/` (~1,7 MB) + `Kit_PlanifiKIA_Peru_v1.zip`.
- Fuentes editables `.md` de cada pieza en esta carpeta.

## El banco P2.2 (activo central)
- `banco_definitivo_bruto.json` — 916 desempeños extraídos y verificados por doble extracción
  (referencia interna de fidelidad, no se publica textual).
- `banco_parafraseado_v1.json` — **90 celdas** (15 competencias × 6 grados, 4 áreas troncales),
  **modalidad híbrida** aprobada en Compuerta 2: síntesis fiel + capacidades + cita de página +
  leyenda legal. Cotejo de fidelidad: 90/90 sin divergencias, ~0 fragmentos literales largos.
- `gen_docs_peru.py` — maquetador (python-docx) de las 15 piezas + banco. Assets en `assets/`.
- `hoja_muestreo_compuerta3.md` — 4 muestras (paráfrasis vs. texto oficial) para el muestreo de Mónica.

## Cómo regenerar
```
python gen_docs_peru.py     # regenera final/*.docx desde los .md y el banco JSON
```

## Alcance y pendientes
- v1: primaria 1.º-6.º, 4 áreas troncales (Matemática, Comunicación, Personal Social,
  Ciencia y Tecnología). Áreas restantes del bruto (Arte y Cultura, Ed. Física, Ed. Religiosa,
  Inglés, Castellano 2.ª lengua) → v1.1 con el mismo pipeline.
- Tras Compuerta 3: etapa 7 (realimentación al Cerebro: `producto_destino` en ATH-PER-NOR-0001/0002,
  Firestore) y traspaso al Canal (video del mini-curso, CTA del lead magnet, precio PEN).
