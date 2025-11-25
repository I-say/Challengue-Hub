import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Project, Rating, Criterion, ProjectComment } from '../types';
import { Button } from '../components/Button';
import { Printer, Loader2 } from 'lucide-react';

export const PrintView: React.FC = () => {
  const [data, setData] = useState<{
    project: Project;
    criteria: Criterion[];
    ratings: Rating[];
    comments: ProjectComment[];
    average: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportData = async () => {
        try {
            const [projects, allRatings, allComments, criteria] = await Promise.all([
                StorageService.getProjects(),
                StorageService.getRatings(),
                StorageService.getComments(),
                StorageService.getCriteria()
            ]);

            const reportData = projects.map(p => {
            const pRatings = allRatings.filter(r => r.projectId === p.id);
            const pComments = allComments.filter(c => c.projectId === p.id);
            
            const sum = pRatings.reduce((acc, curr) => acc + curr.score, 0);
            const count = pRatings.length;
            // Average of all ratings (simple sum / count)
            const average = count > 0 ? sum / count : 0;

            return {
                project: p,
                criteria,
                ratings: pRatings,
                comments: pComments,
                average
            };
            });

            setData(reportData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    loadReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-black"><Loader2 className="animate-spin w-8 h-8 mr-2"/> Generando reporte...</div>;

  return (
    <div className="bg-white min-h-screen text-black p-8">
      <div className="no-print fixed top-4 right-4 z-50">
        <Button onClick={handlePrint} className="shadow-xl flex items-center gap-2">
            <Printer size={18} /> Imprimir Reportes (Guardar como PDF)
        </Button>
      </div>

      <div className="max-w-[210mm] mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12 border-b-2 border-black pb-4 no-print">
            Vista Previa de Reportes
        </h1>

        {data.map((item, idx) => (
          <div key={item.project.id} className="page-break mb-12 last:mb-0">
            <div className="border-2 border-black p-8 min-h-[297mm] relative">
              <header className="text-center border-b-2 border-gray-300 pb-6 mb-8">
                <h2 className="text-4xl font-bold mb-2">{item.project.name}</h2>
                <p className="text-gray-500 uppercase tracking-widest text-sm">Reporte de Retroalimentación - Challenge Hub</p>
              </header>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-700">Desglose de Puntajes</h3>
                    <div className="space-y-3">
                        {item.criteria.map(c => {
                            const cRatings = item.ratings.filter(r => r.criterionId === c.id);
                            const cAvg = cRatings.length ? cRatings.reduce((a,b) => a+b.score,0) / cRatings.length : 0;
                            return (
                                <div key={c.id} className="flex justify-between items-center border-b border-gray-200 pb-1">
                                    <span>{c.name}</span>
                                    <span className="font-mono font-bold">{cAvg.toFixed(1)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="bg-gray-900 text-white p-6 rounded-lg flex flex-col items-center justify-center text-center">
                    <span className="text-gray-400 text-sm uppercase tracking-wider mb-2">Puntaje Total</span>
                    <span className="text-6xl font-bold">{item.average.toFixed(2)}</span>
                    <span className="text-gray-400 text-sm mt-2">de 10.00</span>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-bold text-xl mb-6 border-l-4 border-blue-600 pl-3">Comentarios de los Jueces</h3>
                {item.comments.length > 0 ? (
                    <div className="space-y-4">
                        {item.comments.map((comment, cIdx) => (
                            <div key={cIdx} className="bg-gray-50 p-4 rounded-lg border-l-2 border-gray-300 italic text-gray-700">
                                "{comment.text}"
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 italic">Sin comentarios.</p>
                )}
              </div>

              <footer className="absolute bottom-8 left-8 right-8 text-center text-gray-400 text-xs border-t pt-4">
                Generado por Challenge Hub by Isay de los Cientificos • {new Date().toLocaleDateString()}
              </footer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
