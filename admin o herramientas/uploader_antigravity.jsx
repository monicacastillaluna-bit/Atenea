import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import { Database, UploadCloud, CheckCircle2, AlertCircle, ListChecks, ShieldCheck } from 'lucide-react';

// Datos maestros definidos previamente para el inventario
const SKILLS_DATA = [
  { id: "SKL-GEN-001", name: "Definición de Voz y Estilo Pedagógico", category: "Identidad", description: "Configuración de la identidad y tono de asistentes virtuales.", level: "Básico" },
  { id: "SKL-PRO-001", name: "Diseño de Infografías Educativas", category: "Producción", description: "Sintetizar conceptos complejos en apoyos visuales.", level: "Básico" },
  { id: "SKL-PRO-002", name: "Creación de Guías de Estudio (PDF)", category: "Producción", description: "Estructuración de documentos técnicos y pedagógicos.", level: "Intermedio" },
  { id: "SKL-PRO-003", name: "Diseño de Presentaciones Dinámicas", category: "Producción", description: "Recursos visuales para soporte de clases.", level: "Básico" },
  { id: "SKL-PRO-004", name: "Elaboración de Workbooks Interactivos", category: "Producción", description: "Diseño de cuadernos de ejercicios prácticos.", level: "Intermedio" },
  { id: "SKL-PRO-005", name: "Guionismo Multimedia", category: "Producción", description: "Escritura de guiones para video y audio educativo.", level: "Intermedio" },
  { id: "SKL-DIS-001", name: "Diseño Instruccional de Cursos", category: "Diseño", description: "Planificación macro de trayectorias formativas.", level: "Avanzado" },
  { id: "SKL-DIS-002", name: "Diseño de Talleres Prácticos", category: "Diseño", description: "Experiencias de aprendizaje basadas en el hacer.", level: "Intermedio" },
  { id: "SKL-DIS-003", name: "Integración de Herramientas Web 3.0", category: "Diseño", description: "Integración de micro-aplicaciones educativas.", level: "Avanzado" },
  { id: "SKL-EVAL-001", name: "Sistemas de Evaluación y Feedback", category: "Evaluación", description: "Diseño de rúbricas y estrategias de retroalimentación.", level: "Avanzado" },
  { id: "SKL-EVAL-002", name: "Gestión de Clínicas de Dudas", category: "Evaluación", description: "Facilitación de espacios para resolución de problemas.", level: "Intermedio" },
  { id: "SKL-EXT-001", name: "Facilitación de Webinars", category: "Extensión", description: "Gestión y comunicación en seminarios web masivos.", level: "Intermedio" },
  { id: "SKL-IA-001", name: "Ingeniería de Prompts Pedagógicos", category: "IA Aplicada", description: "Diseño de instrucciones para generar recursos con IA.", level: "Intermedio" },
  { id: "SKL-IA-002", name: "Ética y Curaduría con IA", category: "IA Aplicada", description: "Evaluación crítica de veracidad y sesgo en IA.", level: "Avanzado" },
  { id: "SKL-IA-003", name: "Personalización con IA", category: "IA Aplicada", description: "Adaptación de contenidos según necesidades individuales.", level: "Avanzado" }
];

const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'antigravity-prod';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [progress, setProgress] = useState(0);
  const [errorLog, setErrorLog] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleUpload = async () => {
    if (!user) return;
    setLoading(true);
    setStatus('processing');
    setProgress(0);
    
    let completedCount = 0;
    
    try {
      for (const skill of SKILLS_DATA) {
        // RULE 1: Strict Paths
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'skills', skill.id);
        await setDoc(docRef, {
          ...skill,
          updatedAt: new Date().toISOString(),
          createdBy: user.uid
        });
        
        completedCount++;
        setProgress(Math.round((completedCount / SKILLS_DATA.length) * 100));
      }
      setStatus('success');
    } catch (err) {
      console.error("Upload error:", err);
      setStatus('error');
      setErrorLog(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center font-sans">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-700 p-6 text-white text-center">
          <Database className="w-12 h-12 mx-auto mb-2 opacity-90" />
          <h1 className="text-2xl font-bold">Consola de Producción Antigravity</h1>
          <p className="text-indigo-100 mt-1 opacity-80">Gestión y Carga de Inventario Maestro de Skills</p>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-blue-600 w-6 h-6" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Estado del Sistema</p>
                <p className="text-xs text-blue-700">Conexión Segura Autenticada</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {user ? 'CONECTADO' : 'CONECTANDO...'}
            </span>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
              <h2 className="flex items-center gap-2 font-bold text-slate-800 mb-3">
                <ListChecks className="w-5 h-5 text-indigo-600" />
                Resumen del Inventario a Cargar
              </h2>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex justify-between"><span>Total de Habilidades:</span> <span className="font-mono font-bold text-indigo-600">15</span></li>
                <li className="flex justify-between"><span>Categorías Mapeadas:</span> <span className="font-mono font-bold text-indigo-600">5</span></li>
                <li className="flex justify-between"><span>Destino de Base de Datos:</span> <span className="font-mono font-bold text-indigo-600">Antigravity/Skills</span></li>
              </ul>
            </div>

            {/* Progress Area */}
            {status !== 'idle' && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-700">Progreso de Sincronización</span>
                  <span className="text-indigo-600 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Messages */}
            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-800">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm">¡Carga exitosa! Las 15 habilidades ya están disponibles en el motor de Antigravity.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-2 text-red-800">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <p className="text-sm font-bold">Error en la carga</p>
                </div>
                <p className="text-xs font-mono bg-white p-2 rounded border border-red-100">{errorLog}</p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleUpload}
              disabled={loading || !user || status === 'success'}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg ${
                status === 'success' 
                  ? 'bg-slate-400 cursor-not-allowed text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Procesando Migración...
                </>
              ) : (
                <>
                  <UploadCloud className="w-6 h-6" />
                  Iniciar Carga de Inventario
                </>
              )}
            </button>
            
            {status === 'success' && (
              <p className="text-center text-xs text-slate-500 italic">
                El inventario está sincronizado. Ya puedes cerrar esta ventana.
              </p>
            )}
          </div>
        </div>

        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest px-8">
          <span>ID Proyecto: {appId}</span>
          <span>Versión 1.0.0</span>
        </div>
      </div>
    </div>
  );
}