import { getSupabase } from '../utils/supabaseHelper.js';
import { validateProfileUpdate } from '../utils/validators.js';

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

export const getCompleteProfile = async (req, res) => {
  const supabase = getSupabase();
  try {
    // Fetch profile details
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileErr) throw profileErr;

    // Fetch user details (email)
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', req.user.id)
        .single();
    if(userError) throw userError;

    // Fetch skills
    const { data: skills, error: skillsErr } = await supabase
      .from('profile_skills')
      .select('proficiency, skills(id, name)')
      .eq('profile_id', req.user.id);

    if (skillsErr) throw skillsErr;

    // Fetch projects
    const { data: projects, error: projectsErr } = await supabase
      .from('projects')
      .select('*')
      .eq('profile_id', req.user.id)
      .order('end_date', { ascending: false });

    if (projectsErr) throw projectsErr;

    res.json({
      ...profile,
      account_email: user.email,
      skills: skills.map(s => ({
        id: s.skills.id,
        name: s.skills.name,
        proficiency: s.proficiency
      })),
      projects
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complete profile.' });
  }
};

export const updateProfileDetails = async (req, res) => {
  const supabase = getSupabase();
  const {
    full_name, job_title, experience_summary,
    experience_years, phone, current_email,
    github_url, linkedin_url
  } = req.body;

  const validationError = validateProfileUpdate({ experience_years, github_url, linkedin_url, phone, current_email });
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        job_title,
        experience_summary,
        experience_years,
        phone,
        current_email,
        github_url,
        linkedin_url,
        updated_at: new Date()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
};
