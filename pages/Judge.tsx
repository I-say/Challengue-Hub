import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Project, Criterion, Rating, ProjectComment, Judge as JudgeType } from '../types';
import { Button } from '../components/Button';
import { CheckCircle2, Circle, Save, Loader2 } from 'lucide-react';

interface JudgeProps {
  judge: JudgeType;
}

export const JudgePanel: React.FC<JudgeProps> = ({ judge }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [currentScores, setCurrentScores] = useState<{[key: string]: number}>({});
  const [currentComment, setCurrentComment] = useState<string>('');
  const [savedMessage, setSavedMessage] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
        const [p, c, r, com] = await Promise.all([
            StorageService.getProjects(),
            StorageService.getCriteria(),
            StorageService.getRatings(),
            StorageService.getComments()
        ]);
        setProjects(p);
        setCriteria(c);
        setRatings(r);
        setComments(com);
    } catch (error) {
        console.error("Error loading judge data", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProjectProgress = (pid: string) => {
    const projectRatings = ratings.filter(r => r.projectId === pid && r.judgeId === judge.id);
    const hasComment = comments.some(c => c.projectId === pid && c.judgeId === judge.id);
    const criteriaCount = criteria.length;
    const ratingCount = projectRatings.length;
    const isComplete = criteriaCount > 0 && ratingCount === criteriaCount && hasComment;
    
    return { count: ratingCount, total: criteriaCount, isComplete, hasComment };
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setSavedMessage('');
    
    const existingRatings = ratings.filter(r => r.projectId === project.id && r.judgeId === judge.id);
    const existingComment = comments.find(c => c.projectId === project.id && c.judgeId === judge.id);

    const newScores: {[key: string]: number} = {};
    existingRatings.forEach(r => newScores[r.criterionId] = r.score);
    setCurrentScores(newScores);
    setCurrentComment(existingComment?.text || '');
  };

  const handleSave = async () => {
    if (!selectedProject) return;
    setSaving(true);

    try {
        // Save Ratings
        for (const [cId, score] of Object.entries(currentScores)) {
            await StorageService.saveRating({
                projectId: selectedProject.id,
                judgeId: judge.id,
                criterionId: cId,
                score: Number(score)
            });
        }

        // Save Comment
        if (currentComment.trim()) {
            await StorageService.saveComment({
                projectId: selectedProject.id,
                judgeId: judge.id,
                text: currentComment
            });
        }

        // Refresh local state to confirm save visually
        await loadData();
        
        setSavedMessage('Evaluación guardada con éxito!');
        setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
        setSavedMessage('Error al guardar. Intente nuevamente.');
    } finally {
        setSaving(false);
    }
  };

  if (loading && !selectedProject) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2"/> Cargando datos...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Panel de Juez</h2>
          <p className="text-slate-400">Bienvenido, {judge.name}</p>
        </div>
        <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Progreso</p>
            <p className="font-mono text-xl">{projects.filter(p => getProjectProgress(p.id).isComplete).length} / {projects.length}</p>
        </div>
      </header>

      {!selectedProject ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map(p => {
            const progress = getProjectProgress(p.id);
            return (
              <button
                key={p.id}
                onClick={() => handleSelectProject(p)}
                className={`p-6 rounded-xl border text-left transition-all group ${
                  progress.isComplete 
                    ? 'bg-slate-800/50 border-green-900 hover:border-green-700' 
                    : 'bg-slate-800 border-slate-700 hover:border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{p.name}</h3>
                    {progress.isComplete ? <CheckCircle2 className="text-green-500 w-6 h-6"/> : <Circle className="text-slate-600 w-6 h-6" />}
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${progress.isComplete ? 'bg-green-500' : 'bg-blue-500'}`} 
                        style={{width: `${(progress.count / progress.total) * 100}%`}}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    {progress.count}/{progress.total} criterios • {progress.hasComment ? 'Comentado' : 'Sin Comentario'}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => setSelectedProject(null)}>← Volver a la Lista</Button>
            <h2 className="text-xl font-bold text-blue-400 truncate max-w-md">{selectedProject.name}</h2>
          </div>

          <div className="space-y-6">
            {criteria.map(c => (
              <div key={c.id} className="space-y-2">
                <div className="flex justify-between">
                    <label className="font-medium text-slate-200">{c.name}</label>
                    <span className="font-mono text-blue-400 font-bold">{currentScores[c.id] || '-'} / 10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="0.5"
                  value={currentScores[c.id] || 5} 
                  onChange={(e) => setCurrentScores(prev => ({...prev, [c.id]: parseFloat(e.target.value)}))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-500 px-1">
                    <span>1 (Pobre)</span>
                    <span>10 (Excelente)</span>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-700">
                <label className="font-medium text-slate-200 mb-2 block">
                    Comentarios / Feedback (Obligatorio)
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                    placeholder="Escriba comentarios constructivos para el estudiante..."
                    value={currentComment}
                    onChange={(e) => setCurrentComment(e.target.value)}
                />
            </div>

            <div className="flex items-center justify-between pt-4">
                <p className={`text-sm font-medium ${savedMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                    {savedMessage}
                </p>
                <Button 
                    onClick={handleSave} 
                    disabled={saving || !currentComment.trim() || Object.keys(currentScores).length !== criteria.length}
                    className="gap-2"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} 
                    Guardar Evaluación
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};