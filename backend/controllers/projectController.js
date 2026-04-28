import { getSupabase } from '../utils/supabaseHelper.js';
import { validateProject } from '../utils/validators.js';

export const getProjects = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('profile_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const createProject = async (req, res) => {
  const supabase = getSupabase();

  const { error: validationError, data: projectData } = validateProject(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...projectData, profile_id: req.user.id }])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    console.error('[createProject]', err);
    return res.status(400).json({ error: err.message });
  }
};

export const updateProject = async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();

  const { error: validationError, data: projectData } = validateProject(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .eq('profile_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (err) {
    console.error('[updateProject]', err);
    return res.status(400).json({ error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('profile_id', req.user.id);

    if (error) throw error;
    return res.json({ message: 'Project deleted.' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
