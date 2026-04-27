import { getSupabase } from '../utils/supabaseHelper.js';

export const getProfileStatus = async (req, res) => {
  const supabase = getSupabase();
  try {
    // 1. Check for skills
    const { count: skillCount, error: skillError } = await supabase
      .from('profile_skills')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', req.user.id);

    if (skillError) throw skillError;

    // 2. Check for projects
    const { count: projectCount, error: projectError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', req.user.id);

    if (projectError) throw projectError;

    const isComplete = (skillCount > 0 && projectCount > 0);

    res.json({
      isComplete,
      stats: {
        skills: skillCount,
        projects: projectCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile status.' });
  }
};
