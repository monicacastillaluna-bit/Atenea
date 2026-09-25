/**
 * SERVICIO DE API - ANALÍTICA ACADÉMICA (Producción 2026)
 * Ensamblaje PDF, Generador Web con Tailwind y Descarga de Archivo Plano.
 */

import { marked } from 'marked';
import html2pdf from 'html2pdf.js';

const SKILL_MAP = {
    'SMART-SESSION': 'Skill para Crear PDFs y Guías de Estudio Docentes.txt',
    'PLANNER OA': 'Skill para Crear PDFs y Guías de Estudio Docentes.txt',
    'CURADURÍA VIP': 'Skill para Crear Workbooks Docentes.txt',
    'GENERADOR VIP': 'Skill para Crear Webinars Docentes (Presentación y N...txt',
    'RÚBRICAS TBL': 'Skill para Evaluación y Feedback Docente.txt',
    'RUBRIC-MAKER': 'Skill para Evaluación y Feedback Docente.txt',
    'PROYECTOS ABP': 'Skill para Crear Talleres Prácticos Docentes.txt',
    'INFOGRAFÍA HTML': 'Skill para Crear Infografías Docentes.txt',
    'CÓDIGO WEB': 'Skill para Crear Aplicaciones Web y Herramientas Inte...txt',
    'GOOGLE DOC': 'Skill para Guiones para Videos y Audios Educativos.txt'
};

// Modos de salida: 'descarga' (PDF/HTML) o 'texto' (Archivo plano .txt)
export async function generarProductoConSkill(nombreSolucion, region, normativa, modoSalida = 'descarga') {
    const nombreNormalizado = nombreSolucion.toUpperCase();
    const nombreArchivoSkill = SKILL_MAP[nombreNormalizado] || SKILL_MAP[nombreSolucion];

    let skillText = "";

    try {
        if (nombreArchivoSkill) {
            const responseLocal = await fetch(`/skills/${nombreArchivoSkill}`);
            skillText = await responseLocal.text();
        } else {
            console.warn(`Creando comodín dinámico para la nueva solución: ${nombreSolucion}`);
            skillText = `Eres un experto en marketing educativo y diseño instruccional para Iberoamérica.
            Debes crear un contenido estructurado y altamente persuasivo llamado "${nombreSolucion}".
            Usa un tono profesional pero empático. Organiza la información con claridad, usando títulos, viñetas o emojis si es para redes sociales.`;
        }

        const esWeb = nombreSolucion.toUpperCase().includes("HTML") || nombreSolucion.toUpperCase().includes("WEB");

        let systemPrompt = `Actúa como el Agente 6 de Analítica Académica.
        Genera el contenido para ${region} (Normativa: ${normativa}). 
        Instrucciones de formato y estructura: ${skillText}. 
        Producto a crear: ${nombreSolucion}.`;

        if (esWeb && modoSalida === 'descarga') {
            systemPrompt += `
            REGLA DE DISEÑO ESTRICTA: Eres un Desarrollador Frontend Senior. 
            Maqueta este contenido usando HTML5 y Tailwind CSS (inyecta <script src="https://cdn.tailwindcss.com"></script> en el <head>).
            Fondo: bg-slate-50. Tarjetas: bg-white rounded-3xl shadow-xl p-8 mb-8.
            DEVUELVE SOLO EL CÓDIGO HTML CRUDO. SIN EXPLICACIONES.`;
        }
        else if (modoSalida === 'texto') {
            systemPrompt += `
            REGLA ESTRICTA: Devuelve SOLO el texto final listo para usarse. Usa formato de texto plano limpio. No uses etiquetas HTML ni formato Markdown complejo. Usa MAYÚSCULAS para los títulos y emojis adecuados. No incluyas saludos ni despedidas tuyas, solo el contenido.`;
        }

        const rawKey = import.meta.env.VITE_AI_API_KEY || "";
        const CLEAN_API_KEY = rawKey.replace(/['"\s]/g, '');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CLEAN_API_KEY}`;

        console.log(`🚀 Fabricando ${nombreSolucion} para ${region}... (Modo: ${modoSalida})`);

        const respuesta = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
        });

        if (!respuesta.ok) {
            throw new Error(`Fallo de conexión: ${await respuesta.text()}`);
        }

        const data = await respuesta.json();
        const textoOriginal = data.candidates[0].content.parts[0].text;
        const textoLimpio = textoOriginal.replace(/```html/g, '').replace(/```markdown/g, '').replace(/```/g, '').trim();

        console.log("✅ IA terminó de redactar. Iniciando empaquetado...");

        // LÓGICA DE DESCARGA PARA ARCHIVO PLANO (.txt)
        if (modoSalida === 'texto') {
            const blob = new Blob([textoLimpio], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${nombreSolucion.replace(/\s+/g, '_')}_${region}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log("📝 Archivo de texto plano descargado.");
            return { status: 'success' };
        }

        // LÓGICA DE DESCARGA (HTML o PDF)
        if (esWeb) {
            const blob = new Blob([textoLimpio], { type: 'text/html;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${nombreSolucion.replace(/\s+/g, '_')}_${region}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const contenidoHtml = marked.parse(textoLimpio);
            const elementoPdf = document.createElement('div');
            elementoPdf.innerHTML = `
                <div style="font-family: 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6;">
                    <div style="border-bottom: 3px solid #6366f1; padding-bottom: 15px; margin-bottom: 30px;">
                        <h1 style="color: #0f172a; margin: 0; font-size: 28px;">${nombreSolucion}</h1>
                        <p style="color: #64748b; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                            <strong>Región:</strong> ${region} | <strong>Normativa:</strong> ${normativa}
                        </p>
                    </div>
                    <div style="font-size: 15px;">${contenidoHtml}</div>
                </div>
            `;
            document.body.appendChild(elementoPdf);

            const opcionesPdf = {
                margin: [10, 10, 15, 10],
                filename: `${nombreSolucion.replace(/\s+/g, '_')}_${region}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opcionesPdf).from(elementoPdf).save();
            document.body.removeChild(elementoPdf);
        }

        return { status: 'success' };

    } catch (error) {
        console.error("Error final en apiService:", error);
        alert(`Hubo un problema al generar el archivo "${nombreSolucion}".`);
    }
}

export const apiService = {
    async getMarketMetrics() {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            dailySales: [4900, 7800, 5200, 11000, 9200, 6700, 9800],
            roas: 4.8,
            topRegion: "Perú",
            growth: "+15.2%",
            alerts: [{ id: 1, type: 'critical', title: 'Perú', detail: 'Alta demanda.' }]
        };
    },
    async syncHotmartProduct(productId) {
        return { status: 'success', timestamp: new Date().toISOString() };
    }
};