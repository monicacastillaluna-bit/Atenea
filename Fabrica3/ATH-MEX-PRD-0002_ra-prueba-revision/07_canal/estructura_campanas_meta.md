# Estructura de campañas en Meta · México

**Producto:** ATH-MEX-PRD-0002 · Resultados de Aprendizaje a Prueba de Revisión
**Fecha:** 2026-07-28 · **Ejecuta:** Ana María · **Aprueba presupuesto:** Mónica
**Alcance:** solo México. Colombia requiere su propia versión (ver §10).

---

## 1. La precondición que no se puede saltar

**No enciendas la pauta hasta que el píxel tenga entre 20 y 30 compras reales.**

Meta optimiza aprendiendo de eventos de compra. Con el píxel en cero, el algoritmo reparte
presupuesto a ciegas y se gasta el piloto en la fase de aprendizaje sin entregar un dato utilizable.

De ahí salen esas compras, sin costo de pauta:

| Fase | Origen | Días |
|---|---|---|
| 1 | Reventa a los compradores previos (correo + WhatsApp) | 1-8 |
| 2 | Orgánico: los 600 docentes formados, grupos, coordinadores | 6-18 |

Si esas dos fases no producen al menos 20 compras, **el problema no es de pauta**: es de oferta o de
precio, y encender anuncios solo lo amplifica.

---

## 2. La aritmética real, sin optimismo

Punto de partida: CPM real de México **USD 3,92**.

| | |
|---|---|
| CTR estimado | 1,2 % |
| Costo por clic | ≈ USD 0,33 |
| Conversión de la página en frío (oferta de ~USD 11) | 2,5 % |
| **Costo por compra (CPA)** | **≈ USD 13** · ~$244 MXN |

Ingreso por comprador, con tasas conservadoras de audiencia fría:

| Concepto | Toma | Aporte |
|---|---|---|
| Kit | 100 % | $199 |
| Bump A · Banco de 100 RA | 22 % | $33 |
| Bump B · Kit del coordinador | 8 % | $20 |
| **Subtotal front-end** | | **$252 MXN** |
| Upsell · Curso RA ($1.090) | 6 % | $65 |
| **Total por comprador** | | **$317 MXN** |

| Lectura | ROAS |
|---|---|
| **Solo front-end** (lo que ves el mismo día) | **≈ 1,03x** — empatas |
| **Con el upsell** (llega con días de retraso) | **≈ 1,30x** |

**Léelo así y no de otra forma:** en el frente **no ganas dinero, compras compradores a costo cero**.
La ganancia está en el upsell y, sobre todo, en la lista de compradores que queda — que es con la que
después vendes el curso, el kit NEM y todo lo demás sin volver a pagar por el clic.

⚠️ **El error que mata embudos que sí funcionan** es apagar la campaña por ver ROAS de 1,0x en el
panel de Meta. Meta no ve el upsell. Mide el retorno completo en Hotmart, no en el administrador de
anuncios.

---

## 3. El problema de volumen — y por qué NO hay que segmentar

Meta necesita **~50 conversiones por semana y por conjunto de anuncios** para salir de la fase de
aprendizaje.

Con USD 250 y un CPA de USD 13, el piloto entero produce **unas 19 compras**. Muy por debajo de 50.

**Consecuencia práctica:** si divides el presupuesto en cuatro conjuntos por audiencia, cada uno
recibe 5 compras y ninguno aprende nada. Es el error más común y el más caro.

> ✅ **Regla del piloto: UNA campaña, UN conjunto de anuncios, varios creativos.**
> Todo el presupuesto y todos los eventos en un solo lugar. La segmentación la hace el algoritmo,
> no tú.

Y sé honesta sobre qué responde este piloto:

- **Sí responde:** ¿convierte en frío y a qué costo?
- **No responde:** ¿qué audiencia es mejor? Para eso hace falta 5-10 veces más presupuesto.

---

## 4. La estructura

```
CAMPAÑA 1 · Adquisición — MX
│  Objetivo: Ventas · Optimización: Compra
│  Presupuesto de campaña (CBO): USD 21/día · 12 días = USD 250
│
└── Conjunto único · «MX — amplio»
    ├── Creativo 1 · Antes/después
    ├── Creativo 2 · La fecha del DOF
    ├── Creativo 3 · Los 5 verbos
    ├── Creativo 4 · El error de nivel
    └── Creativo 5 · El coordinador

CAMPAÑA 2 · Retargeting — MX
│  Objetivo: Ventas · Optimización: Compra
│  Presupuesto: USD 4/día · 12 días = USD 48
│
└── Conjunto único · «Visitó y no compró — 7 días»
    ├── Creativo R1 · Objeción de precio
    └── Creativo R2 · Objeción de tiempo
```

**Presupuesto total del piloto: USD 298** (≈ $5.500 MXN).

---

## 5. Configuración exacta

### Campaña 1 · Adquisición

| Campo | Valor |
|---|---|
| Objetivo | **Ventas** |
| Presupuesto | Advantage (CBO), **USD 21/día** |
| Evento de optimización | **Compra** |
| Atribución | 7 días clic / 1 día visualización |
| Países | México |
| Edad | 25-60 |
| Público | **Advantage+ con sugerencias**, no restricciones duras |
| Sugerencias de interés | Docencia, educación superior, universidad, planeación didáctica, SEP |
| Ubicaciones | **Advantage+ (todas)** — no las limites manualmente |
| Exclusión | Compradores (público personalizado desde Hotmart) |

### Campaña 2 · Retargeting

| Campo | Valor |
|---|---|
| Público | Visitantes de la página de venta, últimos **7 días** |
| Exclusión | Quienes compraron |
| Presupuesto | USD 4/día |
| Frecuencia | Vigilar que no pase de **3**; si sube, bajar presupuesto |

**Esto sustituye a la secuencia de correos.** Sin lead magnet, el retargeting es lo que recupera a
quien vio la página y no compró — y cuesta una fracción del frío.

---

## 6. Medición · lo que hay que dejar montado ANTES

Sin esto, la campaña es una apuesta a ciegas.

| # | Qué | Dónde |
|---|---|---|
| 1 | **Píxel de Meta conectado a Hotmart** — Hotmart tiene integración nativa; hay que pegar el ID del píxel en la configuración del producto | Hotmart → Herramientas → Píxeles |
| 2 | **API de Conversiones activada.** En 2026, sin ella se pierde entre 20 % y 30 % de los eventos por bloqueo de navegador | Hotmart la ofrece en la misma pantalla |
| 3 | Eventos verificados: **ViewContent · InitiateCheckout · Purchase** | Probar con una compra real de $1 o con el probador de eventos |
| 4 | **Dominio verificado** en el Administrador Comercial | Meta Business Suite |
| 5 | **UTM en todos los enlaces**, para cruzar Meta contra Hotmart | `?utm_source=meta&utm_campaign=mx_adq&utm_content=creativo1` |

⚠️ **Verifica el paso 3 con una compra de prueba real antes de gastar un peso.** Un píxel mal
configurado no se nota hasta que ya se gastó el presupuesto.

---

## 7. Los creativos

Cinco ángulos, cada uno atacando una objeción distinta. Todos salen de argumentos que ya están en la
página de venta — no hay que inventar nada.

| # | Ángulo | Gancho | Formato |
|---|---|---|---|
| **1** | **Antes/después** | El resultado tachado en rojo y su versión reescrita, con verbo, objeto y contexto en colores. *Es el producto en una imagen* | Imagen estática |
| **2** | **La fecha** | «El 1 de marzo de 2024 cambió la regla de todo el sistema educativo. A usted nadie le avisó.» | Imagen con la portada del DOF |
| **3** | **Los verbos** | «Estos 5 verbos arruinan más programas que cualquier otro error: conocer, comprender, saber, apreciar, interiorizar.» | Imagen tipográfica |
| **4** | **El error de nivel** | «Su resultado de aprendizaje está bien escrito. Y aun así le van a hacer observación.» | Imagen o video corto |
| **5** | **El coordinador** | «40 programas. Una visita de evaluación encima. Una tarde.» | Imagen |

**Retargeting:**

| # | Objeción | Gancho |
|---|---|---|
| **R1** | Precio | «$199 pesos. Menos que la comida de mañana. Y le resuelve el semestre.» |
| **R2** | Tiempo | «No son 40 horas de curso. Son 90 minutos y su programa queda listo.» |

**Reglas de creativo:**
- El texto principal (arriba) debe funcionar **sin ver la imagen** — mucha gente lee y no mira.
- Nada de fórmulas que insinúen aval de la SEP. La directriz legal aplica igual en anuncios.
- Cero fotos de banco de imágenes con gente sonriendo frente a una laptop. Este público las
  reconoce como publicidad al instante.
- El creativo 1 es el favorito de la casa: **muestra el producto, no lo describe.**

---

## 8. Reglas de decisión

Escritas antes de empezar, para no decidir con el bolsillo caliente.

### Diario (2 minutos)

| Métrica | Bien | Alerta |
|---|---|---|
| CPA | < $260 MXN | > $350 MXN |
| CTR | > 1,0 % | < 0,7 % |
| Frecuencia | < 2,0 | > 3,0 |

### 🚦 Día 4 · primera compuerta

| Situación | Qué hacer |
|---|---|
| Hay compras y CPA < $350 | Seguir sin tocar nada |
| Hay clics pero **cero compras** | El problema es la **página**, no el anuncio. Pausar y revisar la página |
| CTR < 0,7 % | El problema es el **creativo**. Apagar los dos peores, subir presupuesto a los que quedan |

### 🚦 Día 8 · segunda compuerta

| ROAS front-end | Decisión |
|---|---|
| ≥ 1,3x | ✅ Escalar: subir 20 % cada 3 días, nunca más |
| 0,8x – 1,3x | 🟡 Sostener y trabajar el ticket promedio (los bumps), no el costo |
| < 0,8x | 🔴 Parar. Rehacer creativos o página antes de volver a gastar |

**Regla de oro:** no toques nada durante las primeras **72 horas**. Cada edición reinicia el
aprendizaje del algoritmo. La ansiedad del día 2 es la que arruina más campañas que el mal creativo.

---

## 9. Calendario

| Día | Qué | Costo |
|---|---|---|
| −18 a −11 | Fase 1 · reventa a compradores | $0 |
| −13 a −1 | Fase 2 · orgánico | $0 |
| −2 | Montar píxel, API de Conversiones, UTM y **compra de prueba** | $0 |
| −1 | 🚦 Verificar: ¿el píxel tiene ≥20 compras? Si no, **no encender** | — |
| 1 a 12 | Campaña de adquisición | USD 250 |
| 3 a 12 | Campaña de retargeting (arranca al día 3, cuando ya hay visitantes) | USD 48 |
| 13 | Lectura de resultados y decisión de escalar | — |

---

## 10. Colombia — no está resuelto

La página y el kit están anclados al **Marco Nacional de Cualificaciones de México** y al DOF. Para
un docente colombiano ese gancho normativo **no aplica**, y el argumento central se cae.

Colombia tiene su propio Marco Nacional de Cualificaciones. Hacer la versión colombiana es una
corrida corta de Fábrica: mismo método, mismos instrumentos, **cambia el corpus normativo y los
ejemplos**. Es el mismo patrón de replicación que ya hiciste con PlanifiKIA de Colombia a Perú.

**Hasta que exista esa versión, no pautes este producto en Colombia.** Lo que sí sirve para tu lista
colombiana universitaria hoy es el **curso de Resultados de Aprendizaje**, que es agnóstico de país.

---

## 11. Lo que NO hay que hacer

1. **No mezclar países en una campaña.** Meta promedia las señales y no aprende ninguna.
2. **No dividir en cuatro conjuntos** con este presupuesto (§3).
3. **No editar durante las primeras 72 horas.**
4. **No subir el presupuesto más de 20 % cada 3 días.** Un salto brusco reinicia el aprendizaje.
5. **No juzgar el ROAS en el panel de Meta.** No ve el upsell. Mide en Hotmart.
6. **No encender sin la compra de prueba** que confirme que el evento Purchase llega.
7. **No usar fórmulas que insinúen aval oficial** en ningún anuncio. La directriz legal no distingue
   entre página y anuncio.
