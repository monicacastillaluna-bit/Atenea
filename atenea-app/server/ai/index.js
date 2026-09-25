// Motor de IA intercambiable: Claude o Gemini según Ajustes. Las claves viven
// en el archivo .env del servidor, nunca en el navegador.
// Toda llamada pide JSON con un esquema y devuelve el objeto ya parseado.
import Anthropic from '@anthropic-ai/sdk';
import { leerAjuste } from '../lib/db.js';

export class ErrorIA extends Error {}

export function estadoIA(db) {
  const proveedor = leerAjuste(db, 'ia_proveedor', 'claude');
  const claves = {
    claude: Boolean(process.env.ANTHROPIC_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY),
  };
  const modelo = leerAjuste(db, proveedor === 'gemini' ? 'ia_modelo_gemini' : 'ia_modelo_claude', '');
  return { proveedor, modelo, claves, disponible: claves[proveedor] ?? false };
}

let clienteClaude = null;
function claude() {
  clienteClaude ??= new Anthropic();
  return clienteClaude;
}

async function llamarClaude({ modelo, sistema, usuario, esquema, maxTokens, esfuerzo }) {
  const pedido = {
    model: modelo,
    max_tokens: maxTokens,
    system: sistema,
    messages: [{ role: 'user', content: usuario }],
    output_config: { format: { type: 'json_schema', schema: esquema }, effort: esfuerzo },
    // Si un clasificador de seguridad rechaza el pedido, la API lo reintenta con
    // el modelo de respaldo recomendado en vez de devolver el rechazo.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  };
  let r;
  try {
    r = await claude().beta.messages.create(pedido);
  } catch (e) {
    // Algunos modelos no aceptan fallbacks: se reintenta una vez sin ellos.
    if (e instanceof Anthropic.BadRequestError && /credit balance/i.test(e.message)) {
      throw new ErrorIA('Tu cuenta de Anthropic no tiene saldo: carga créditos en console.anthropic.com → Billing.');
    } else if (e instanceof Anthropic.NotFoundError) {
      throw new ErrorIA(`El modelo «${modelo}» no existe o tu cuenta no tiene acceso; cámbialo en Ajustes → Motor de IA.`);
    } else if (e instanceof Anthropic.BadRequestError && /fallback/i.test(e.message)) {
      delete pedido.betas;
      delete pedido.fallbacks;
      r = await claude().beta.messages.create(pedido);
    } else if (e instanceof Anthropic.AuthenticationError) {
      throw new ErrorIA('La clave de Claude (ANTHROPIC_API_KEY) no es válida.');
    } else if (e instanceof Anthropic.RateLimitError) {
      throw new ErrorIA('Claude está limitando las solicitudes; inténtalo de nuevo en unos minutos.');
    } else if (e instanceof Anthropic.APIError) {
      throw new ErrorIA(`Error de la API de Claude: ${e.message}`);
    } else {
      throw e;
    }
  }
  if (r.stop_reason === 'refusal') throw new ErrorIA('Claude declinó procesar este contenido.');
  if (r.stop_reason === 'max_tokens') throw new ErrorIA('La respuesta de Claude se cortó por longitud.');
  const txt = r.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return JSON.parse(txt);
}

async function llamarGemini({ modelo, sistema, usuario, esquema, maxTokens }) {
  const base = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com';
  const url = `${base}/v1beta/models/${encodeURIComponent(modelo)}:generateContent`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sistema }] },
      contents: [{
        role: 'user',
        parts: [{ text: `${usuario}\n\nResponde SOLO con un JSON válido que cumpla este esquema:\n${JSON.stringify(esquema)}` }],
      }],
      generationConfig: { responseMimeType: 'application/json', maxOutputTokens: maxTokens },
    }),
  });
  if (!r.ok) {
    const txt = await r.text();
    if (/API key not valid|API_KEY_INVALID/i.test(txt)) throw new ErrorIA('La clave de Gemini (GEMINI_API_KEY) no es válida.');
    if (r.status === 404) throw new ErrorIA(`El modelo «${modelo}» no existe en Gemini; cámbialo en Ajustes → Motor de IA.`);
    if (r.status === 429) throw new ErrorIA('Gemini está limitando las solicitudes (cuota agotada); inténtalo más tarde.');
    throw new ErrorIA(`Error de la API de Gemini (HTTP ${r.status}): ${txt.slice(0, 300)}`);
  }
  const data = await r.json();
  const txt = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  if (!txt) throw new ErrorIA('Gemini no devolvió contenido (posible bloqueo de seguridad).');
  return JSON.parse(txt.replace(/^```(?:json)?\s*|\s*```$/g, ''));
}

// Llamada mínima para comprobar clave y modelo desde Ajustes.
export async function probarIA(db) {
  const inicio = Date.now();
  const r = await generarJson(db, {
    sistema: 'Responde en español.',
    usuario: 'Prueba de conexión: devuelve ok=true y un saludo breve para la fundadora de Atenea.',
    esquema: {
      type: 'object', additionalProperties: false, required: ['ok', 'saludo'],
      properties: { ok: { type: 'boolean' }, saludo: { type: 'string' } },
    },
    maxTokens: 2000,
    esfuerzo: 'low',
  });
  const est = estadoIA(db);
  return { ...r, proveedor: est.proveedor, modelo: est.modelo, milisegundos: Date.now() - inicio };
}

// esfuerzo: 'low' para tareas masivas (clasificar), 'high' para redactar fichas.
export async function generarJson(db, { sistema, usuario, esquema, maxTokens = 16000, esfuerzo = 'high' }) {
  const est = estadoIA(db);
  if (!est.disponible) {
    throw new ErrorIA(`No hay clave configurada para ${est.proveedor}. Agrégala en el archivo .env de tu carpeta de datos (Ajustes → Abrir carpeta de datos).`);
  }
  const args = { modelo: est.modelo, sistema, usuario, esquema, maxTokens, esfuerzo };
  try {
    return est.proveedor === 'gemini' ? await llamarGemini(args) : await llamarClaude(args);
  } catch (e) {
    if (e instanceof SyntaxError) throw new ErrorIA('La IA devolvió un JSON inválido.');
    throw e;
  }
}
