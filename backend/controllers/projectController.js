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
    if (req.body.start_date && req.body.end_date) {
      if (new Date(req.body.start_date) > new Date(req.body.end_date)) {
        return res.status(400).json({ error: 'Start date must be before end date.' });
      }
    }

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
    if (req.body.start_date && req.body.end_date) {
      if (new Date(req.body.start_date) > new Date(req.body.end_date)) {
        return res.status(400).json({ error: 'Start date must be before end date.' });
      }
    }

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
