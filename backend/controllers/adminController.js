import { getSupabase } from '../utils/supabaseHelper.js';

// ── User Stats ──────────────────────────────────────────────────────────────
export const getStats = async (req, res) => {
  const supabase = getSupabase();
  try {
    // Total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (usersError) throw usersError;

    // Users with at least 1 skill AND 1 project (complete profiles)
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id');
    if (profilesError) throw profilesError;

    let completeCount = 0;
    for (const profile of profilesData) {
      const [{ count: sc }, { count: pc }] = await Promise.all([
        supabase.from('profile_skills').select('*', { count: 'exact', head: true }).eq('profile_id', profile.id),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('profile_id', profile.id)
      ]);
      if (sc > 0 && pc > 0) completeCount++;
    }

    // Total skills
    const { count: totalSkills, error: skillsError } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true });
    if (skillsError) throw skillsError;

    // Total projects
    const { count: totalProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
    if (projectsError) throw projectsError;

    res.json({
      totalUsers,
      completeProfiles: completeCount,
      incompleteProfiles: totalUsers - completeCount,
      totalSkills,
      totalProjects
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};

// ── Get All Users (with profile info) ───────────────────────────────────────
export const getAllUsers = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at, profiles(full_name, job_title)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

// ── Skills CRUD ──────────────────────────────────────────────────────────────
export const adminGetAllSkills = async (req, res) => {
  const supabase = getSupabase();
  try {
    // Get skills with count of how many profiles use them
    const { data, error } = await supabase
      .from('skills')
      .select('id, name, profile_skills(count)')
      .order('name', { ascending: true });

    if (error) throw error;

    const formatted = data.map(s => ({
      id: s.id,
      name: s.name,
      usedBy: s.profile_skills?.[0]?.count || 0
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch skills.' });
  }
};

export const adminCreateSkill = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Skill name is required.' });

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from('skills')
      .insert([{ name: name.trim() }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'A skill with this name already exists.' });
      }
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create skill.' });
  }
};

export const adminUpdateSkill = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Skill name is required.' });

  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from('skills')
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'A skill with this name already exists.' });
      }
      throw error;
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update skill.' });
  }
};

export const adminDeleteSkill = async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();
  try {
    // profile_skills rows are auto-deleted via ON DELETE CASCADE in the DB
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Skill deleted. All profile references removed automatically.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete skill.' });
  }
};
