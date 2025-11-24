import { createClient } from '@supabase/supabase-js';
import { Judge, Project, Criterion, Rating, ProjectComment } from '../types';

// Helper seguro para leer variables de entorno (evita crash si 'process' no existe)
const getEnv = (key: string) => {
  try {
    // Soporte para Vite (import.meta.env)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}

  try {
    // Soporte para Node/Webpack/CRA (process.env)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  return '';
};

// Prioridad: 1. Variables de Entorno (Vercel) -> 2. LocalStorage (Config manual en navegador)
const envUrl = getEnv('VITE_SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL');
const envKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('REACT_APP_SUPABASE_ANON_KEY');

const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('sfe_supabase_url') : '';
const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('sfe_supabase_key') : '';

const supabaseUrl = envUrl || storedUrl || '';
const supabaseKey = envKey || storedKey || '';

// Inicializar cliente de forma segura con placeholders si falta configuración
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);

export const StorageService = {
  // Check connection
  isConnected: () => !!supabaseUrl && !!supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co',

  // Permite guardar credenciales manualmente desde la UI si fallan las env vars
  saveCredentials: (url: string, key: string) => {
    localStorage.setItem('sfe_supabase_url', url);
    localStorage.setItem('sfe_supabase_key', key);
    window.location.reload(); // Recargar para aplicar cambios
  },

  clearCredentials: () => {
    localStorage.removeItem('sfe_supabase_url');
    localStorage.removeItem('sfe_supabase_key');
    window.location.reload();
  },

  // Judges
  getJudges: async (): Promise<Judge[]> => {
    const { data, error } = await supabase.from('judges').select('*');
    if (error) console.error('Error fetching judges:', error);
    return data || [];
  },
  
  addJudge: async (judge: Partial<Judge>) => {
    const { id, ...rest } = judge; 
    const { error } = await supabase.from('judges').insert([rest]);
    if (error) throw error;
  },

  deleteJudge: async (id: string) => {
    const { error } = await supabase.from('judges').delete().eq('id', id);
    if (error) throw error;
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const { data, error } = await supabase.from('projects').select('*').order('name');
    if (error) console.error('Error fetching projects:', error);
    return data || [];
  },

  addProject: async (project: Partial<Project>) => {
    const { id, ...rest } = project;
    const { error } = await supabase.from('projects').insert([rest]);
    if (error) throw error;
  },

  deleteProject: async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },

  // Criteria
  getCriteria: async (): Promise<Criterion[]> => {
    const { data, error } = await supabase.from('criteria').select('*').order('name');
    if (error) console.error('Error fetching criteria:', error);
    return data || [];
  },

  addCriterion: async (criterion: Partial<Criterion>) => {
    const { id, ...rest } = criterion;
    const { error } = await supabase.from('criteria').insert([rest]);
    if (error) throw error;
  },

  deleteCriterion: async (id: string) => {
    const { error } = await supabase.from('criteria').delete().eq('id', id);
    if (error) throw error;
  },

  // Ratings
  getRatings: async (): Promise<Rating[]> => {
    const { data, error } = await supabase.from('ratings').select('*');
    if (error) console.error('Error fetching ratings:', error);
    return data?.map(r => ({
      projectId: r.project_id,
      judgeId: r.judge_id,
      criterionId: r.criterion_id,
      score: r.score
    })) || [];
  },

  saveRating: async (rating: Rating) => {
    const { error: delError } = await supabase
      .from('ratings')
      .delete()
      .match({ 
        project_id: rating.projectId, 
        judge_id: rating.judgeId, 
        criterion_id: rating.criterionId 
      });
    
    if (delError) console.error('Error clearing old rating', delError);

    const { error } = await supabase.from('ratings').insert([{
      project_id: rating.projectId,
      judge_id: rating.judgeId,
      criterion_id: rating.criterionId,
      score: rating.score
    }]);

    if (error) throw error;
  },

  resetRatings: async () => {
    const { error: e1 } = await supabase.from('ratings').delete().neq('score', -1); 
    const { error: e2 } = await supabase.from('comments').delete().neq('text', ''); 
    if (e1 || e2) throw new Error('Error resetting data');
  },

  // Comments
  getComments: async (): Promise<ProjectComment[]> => {
    const { data, error } = await supabase.from('comments').select('*');
    if (error) console.error('Error fetching comments:', error);
    return data?.map(c => ({
      projectId: c.project_id,
      judgeId: c.judge_id,
      text: c.text
    })) || [];
  },

  saveComment: async (comment: ProjectComment) => {
    const { error: delError } = await supabase
      .from('comments')
      .delete()
      .match({ 
        project_id: comment.projectId, 
        judge_id: comment.judgeId 
      });

    const { error } = await supabase.from('comments').insert([{
      project_id: comment.projectId,
      judge_id: comment.judgeId,
      text: comment.text
    }]);

    if (error) throw error;
  },

  // Helper for init (Manual Seed)
  seedData: async () => {
    const initialJudges = [
      { name: 'Dr. Smith', password_hash: '1234' },
      { name: 'Prof. Johnson', password_hash: '1234' }
    ];
    const initialProjects = [
      { name: 'Levitación Cuántica en Ranas' },
      { name: 'IA para Reciclaje' },
      { name: 'Diseño de Hábitat en Marte' }
    ];
    const initialCriteria = [
      { name: 'Método Científico' },
      { name: 'Creatividad' },
      { name: 'Presentación' }
    ];

    await supabase.from('judges').insert(initialJudges);
    await supabase.from('projects').insert(initialProjects);
    await supabase.from('criteria').insert(initialCriteria);
  }
};