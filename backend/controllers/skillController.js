import { getSupabase } from '../utils/supabaseHelper.js';

// Get all skills available in the system
export const getAllSkills = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch skills.' });
  }
};

// Create a new skill in the global skills table
export const createSkill = async (req, res) => {
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
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create skill.' });
  }
};

// Get skills for a specific profile (includes proficiency)
export const getProfileSkills = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from('profile_skills')
      .select('skill_id, proficiency, skills(name)')
      .eq('profile_id', req.user.id);

    if (error) throw error;

    const formatted = data.map(item => ({
      id: item.skill_id,
      name: item.skills.name,
      proficiency: item.proficiency
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch profile skills.' });
  }
};

// Add a skill to a profile by skillId with optional proficiency
export const addSkillToProfile = async (req, res) => {
  const { skillId, proficiency } = req.body;

  if (!skillId) return res.status(400).json({ error: 'skillId is required.' });

  const supabase = getSupabase();
  try {
    // 1. Verify the skill exists
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('id')
      .eq('id', skillId)
      .single();

    if (skillError || !skill) {
      return res.status(404).json({ error: 'Skill not found.' });
    }

    // 2. Validate proficiency if provided
    const prof = proficiency !== undefined ? parseInt(proficiency) : null;
    if (prof !== null && (prof < 1 || prof > 100)) {
      return res.status(400).json({ error: 'Proficiency must be between 1 and 100.' });
    }

    // 3. Link skill to profile
    const { error: linkError } = await supabase
      .from('profile_skills')
      .insert([{ profile_id: req.user.id, skill_id: skillId, proficiency: prof }]);

    if (linkError) {
      if (linkError.code === '23505') {
        return res.status(400).json({ error: 'This skill is already in your profile.' });
      }
      throw linkError;
    }

    return res.status(201).json({ message: 'Skill added to profile.' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Failed to add skill to profile.' });
  }
};

// Update proficiency for an existing profile skill
export const updateSkillProficiency = async (req, res) => {
  const { id } = req.params; // skill_id
  const { proficiency } = req.body;

  const prof = parseInt(proficiency);
  if (isNaN(prof) || prof < 1 || prof > 100) {
    return res.status(400).json({ error: 'Proficiency must be between 1 and 100.' });
  }

  const supabase = getSupabase();
  try {
    const { error } = await supabase
      .from('profile_skills')
      .update({ proficiency: prof })
      .eq('profile_id', req.user.id)
      .eq('skill_id', id);

    if (error) throw error;
    return res.json({ message: 'Proficiency updated.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update proficiency.' });
  }
};

// Remove a skill from a profile
export const removeSkillFromProfile = async (req, res) => {
  const { id } = req.params; // skill_id
  const supabase = getSupabase();
  try {
    const { error } = await supabase
      .from('profile_skills')
      .delete()
      .eq('profile_id', req.user.id)
      .eq('skill_id', id);

    if (error) throw error;
    return res.json({ message: 'Skill removed from profile.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove skill.' });
  }
};
