import { getSupabase } from '../utils/supabaseHelper.js';

export const getProjects = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('profile_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
};

export const createProject = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...req.body, profile_id: req.user.id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProject = async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(req.body)
      .eq('id', id)
      .eq('profile_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
