// Responde como la API de Claude en modo streaming (Server-Sent Events) con un mensaje ya armado.
export function responderStream(res, mensaje, cabeceras = {}) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', ...cabeceras });
  const evento = (tipo, datos) => res.write(`event: ${tipo}\ndata: ${JSON.stringify({ type: tipo, ...datos })}\n\n`);
  const { content = [], stop_reason: stop, usage, ...resto } = mensaje;
  evento('message_start', { message: { ...resto, content: [], stop_reason: null, usage: { input_tokens: usage?.input_tokens ?? 1, output_tokens: 0 } } });
  content.forEach((b, index) => {
    evento('content_block_start', { index, content_block: { type: 'text', text: '' } });
    evento('content_block_delta', { index, delta: { type: 'text_delta', text: b.text } });
    evento('content_block_stop', { index });
  });
  evento('message_delta', { delta: { stop_reason: stop, stop_sequence: null }, usage: { output_tokens: usage?.output_tokens ?? 1 } });
  evento('message_stop', {});
  res.end();
}
