import { createClient } from '@supabase/supabase-js';
import { Judge, Project, Criterion, Rating, ProjectComment } from '../types';

// NOTA: Estas variables deben configurarse en Vercel (Environment Variables)
// Si estás probando en local sin build step, tendrás que hardcodearlas temporalmente o usar un .env
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Prevent crash if env vars are missing by providing placeholders
// The isConnected check in App.tsx will still prevent usage if keys are invalid
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);

export const StorageService = {
  // Check connection
  isConnected: () => !!supabaseUrl && !!supabaseKey,

  // Judges
  getJudges: async (): Promise<Judge[]> => {
    const { data, error } = await supabase.from('judges').select('*');
    if (error) console.error('Error fetching judges:', error);
    return data || [];
  },
  
  addJudge: async (judge: Partial<Judge>) => {
    // Let Supabase handle ID generation if not provided
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
    // Map snake_case from DB to camelCase if necessary, but we will assume DB cols match types or use 'as'
    return data?.map(r => ({
      projectId: r.project_id,
      judgeId: r.judge_id,
      criterionId: r.criterion_id,
      score: r.score
    })) || [];
  },

  saveRating: async (rating: Rating) => {
    // Upsert logic: Delete existing first or use upsert if constraint exists
    // Simple approach: Delete match then insert
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
    const { error: e1 } = await supabase.from('ratings').delete().neq('score', -1); // Delete all
    const { error: e2 } = await supabase.from('comments').delete().neq('text', ''); // Delete all
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