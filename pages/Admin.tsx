import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Judge, Project, Criterion } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Trash2, Plus, Users, Beaker, ClipboardList, AlertTriangle, Database, Loader2 } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'judges' | 'projects' | 'criteria'>('judges');
  const [judges, setJudges] = useState<Judge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const refreshData = async () => {
    setLoading(true);
    try {
        const [j, p, c] = await Promise.all([
            StorageService.getJudges(),
            StorageService.getProjects(),
            StorageService.getCriteria()
        ]);
        setJudges(j);
        setProjects(p);
        setCriteria(c);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setActionLoading(true);

    try {
        if (activeTab === 'judges') {
            if (!newPassword.trim()) return alert("Se requiere contraseña para el juez");
            // Updated to use password_hash
            await StorageService.addJudge({ name: newName, password_hash: newPassword } as any);
            setNewPassword('');
        } else if (activeTab === 'projects') {
            await StorageService.addProject({ name: newName });
        } else {
            await StorageService.addCriterion({ name: newName });
        }
        setNewName('');
        await refreshData();
    } catch (e) {
        alert('Error al agregar elemento');
    } finally {
        setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro?')) return;
    setActionLoading(true);
    try {
        if (activeTab === 'judges') await StorageService.deleteJudge(id);
        if (activeTab === 'projects') await StorageService.deleteProject(id);
        if (activeTab === 'criteria') await StorageService.deleteCriterion(id);
        await refreshData();
    } catch(e) {
        alert('Error al eliminar');
    } finally {
        setActionLoading(false);
    }
  };

  const handleResetAll = async () => {
    if (confirm('PELIGRO: Esto borrará TODAS las calificaciones y comentarios de la base de datos. No se puede deshacer. ¿Continuar?')) {
        setActionLoading(true);
        try {
            await StorageService.resetRatings();
            alert('Evaluaciones reiniciadas.');
        } catch(e) {
            alert('Error al reiniciar');
        } finally {
            setActionLoading(false);
        }
    }
  };

  const handleSeed = async () => {
    if(confirm("¿Cargar datos de ejemplo? Esto agregará jueces, proyectos y criterios.")){
        setActionLoading(true);
        try {
            await StorageService.seedData();
            await refreshData();
            alert("Datos cargados.");
        } catch (e) {
            alert("Error cargando datos. Revisa la consola.");
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-white">Panel de Administración</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
            <button
                onClick={() => setActiveTab('judges')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'judges' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
                <Users size={20} /> Jueces
            </button>
            <button
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
                <Beaker size={20} /> Proyectos
            </button>
            <button
                onClick={() => setActiveTab('criteria')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'criteria' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
                <ClipboardList size={20} /> Criterios
            </button>
            
            <div className="pt-8 space-y-2">
                <button
                    onClick={handleSeed}
                    disabled={actionLoading}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 transition-colors"
                >
                    <Database size={20} /> Cargar Ejemplo
                </button>
                <button
                    onClick={handleResetAll}
                    disabled={actionLoading}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-900/50 text-red-400 hover:bg-red-900 border border-red-800 transition-colors"
                >
                    <AlertTriangle size={20} /> Reiniciar Evaluaciones
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 capitalize flex items-center gap-2">
                Gestionar {activeTab === 'judges' ? 'Jueces' : activeTab === 'projects' ? 'Proyectos' : 'Criterios'}
                {loading && <Loader2 className="animate-spin w-4 h-4 ml-2"/>}
            </h3>

            {/* Add Form */}
            <div className="bg-slate-900/50 p-4 rounded-lg mb-6 border border-slate-700">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <Input 
                        label={`Nombre de Nuevo ${activeTab === 'judges' ? 'Juez' : activeTab === 'projects' ? 'Proyecto' : 'Criterio'}`} 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ingresar nombre..."
                    />
                    {activeTab === 'judges' && (
                        <Input 
                            label="Contraseña" 
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Código secreto"
                        />
                    )}
                    <Button onClick={handleAdd} className="mb-[1px]" disabled={actionLoading}>
                        {actionLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <><Plus size={18} className="mr-2" /> Agregar</>}
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-2">
                {(activeTab === 'judges' ? judges : activeTab === 'projects' ? projects : criteria).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-4">
                            {activeTab === 'judges' && <span className="text-xs text-slate-500 font-mono">Clave: {item.password_hash}</span>}
                            <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-400 transition-colors" disabled={actionLoading}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {(!loading && (activeTab === 'judges' ? judges : activeTab === 'projects' ? projects : criteria).length === 0) && (
                    <p className="text-center text-slate-500 py-8">No se encontraron elementos.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};