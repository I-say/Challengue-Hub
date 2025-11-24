import React, { useEffect, useState, useCallback } from 'react';
import { StorageService } from '../services/storage';
import { Project, Criterion } from '../types';
import { RefreshCw, Trophy, Medal, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';

interface RankingRow {
  position: number;
  project: Project;
  scores: { [criterionId: string]: number };
  total: number;
}

export const Ranking: React.FC = () => {
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const calculateRankings = useCallback(async () => {
    setIsLoading(true);
    try {
      const projects = await StorageService.getProjects();
      const ratings = await StorageService.getRatings();
      const currentCriteria = await StorageService.getCriteria();

      setCriteria(currentCriteria);

      // Group ratings by project
      const projectStats = projects.map(proj => {
        const projRatings = ratings.filter(r => r.projectId === proj.id);
        
        const criteriaScores: { [key: string]: { sum: number, count: number } } = {};
        
        currentCriteria.forEach(c => {
          criteriaScores[c.id] = { sum: 0, count: 0 };
        });

        projRatings.forEach(r => {
          if (criteriaScores[r.criterionId]) {
            criteriaScores[r.criterionId].sum += r.score;
            criteriaScores[r.criterionId].count += 1;
          }
        });

        const finalScores: { [key: string]: number } = {};
        let totalSum = 0;

        Object.keys(criteriaScores).forEach(cId => {
          const { sum, count } = criteriaScores[cId];
          const avg = count > 0 ? sum / count : 0;
          finalScores[cId] = avg;
          totalSum += avg; 
        });

        return {
          project: proj,
          scores: finalScores,
          total: totalSum
        };
      });

      // Sort by Total Descending
      projectStats.sort((a, b) => b.total - a.total);

      const rankedRows = projectStats.map((stat, index) => ({
        position: index + 1,
        project: stat.project,
        scores: stat.scores,
        total: stat.total
      }));

      setRows(rankedRows);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error calculating rankings", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateRankings();
    const interval = setInterval(calculateRankings, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, [calculateRankings]);

  const getRowStyle = (pos: number) => {
    if (pos === 1) return "border-2 border-yellow-500 bg-yellow-500/10";
    if (pos === 2) return "border-2 border-slate-300 bg-slate-300/10";
    if (pos === 3) return "border-2 border-amber-700 bg-amber-700/10";
    return "border-b border-slate-700 hover:bg-slate-800/50";
  };

  const getIcon = (pos: number) => {
    if (pos === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (pos === 2) return <Medal className="w-6 h-6 text-slate-300" />;
    if (pos === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-slate-500 font-mono w-6 text-center">{pos}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 no-print">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Ranking en Vivo
            </h1>
            <p className="text-slate-400 mt-2">Resultados de evaluación en tiempo real</p>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm text-slate-500">
              Actualizado: {lastUpdate.toLocaleTimeString()}
            </span>
            <Button onClick={calculateRankings} variant="primary" className="gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} 
              Actualizar
            </Button>
          </div>
        </header>

        <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-2xl bg-slate-900/50 backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="p-4 font-bold text-slate-400 w-16">#</th>
                <th className="p-4 font-bold text-slate-300 min-w-[200px]">Proyecto</th>
                {criteria.map(c => (
                  <th key={c.id} className="p-4 font-semibold text-slate-400 text-center text-sm md:text-base hidden sm:table-cell">
                    {c.name}
                  </th>
                ))}
                <th className="p-4 font-bold text-blue-400 text-right text-lg">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.project.id} className={`transition-all ${getRowStyle(row.position)}`}>
                  <td className="p-4">
                    <div className="flex justify-center">
                      {getIcon(row.position)}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-lg md:text-xl tracking-wide">{row.project.name}</span>
                  </td>
                  {criteria.map(c => (
                    <td key={c.id} className="p-4 text-center text-slate-300 hidden sm:table-cell font-mono">
                      {row.scores[c.id] ? row.scores[c.id].toFixed(1) : '-'}
                    </td>
                  ))}
                  <td className="p-4 text-right">
                    <span className="text-2xl font-bold text-blue-400 font-mono">
                      {row.total.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={criteria.length + 3} className="p-12 text-center text-slate-500">
                    Esperando datos... asegúrate de haber creado proyectos y criterios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};