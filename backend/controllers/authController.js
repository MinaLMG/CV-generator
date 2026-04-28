import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getSupabase } from '../utils/supabaseHelper.js';
import { validateSignup, validateLogin } from '../utils/validators.js';


export const signup = async (req, res) => {
  const { email, password, fullName } = req.body;

  const validationError = validateSignup({ email, password, fullName });
  if (validationError) return res.status(400).json({ error: validationError });

  const supabase = getSupabase();

  try {
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{ email, password_hash: hashedPassword }])
      .select()
      .single();

    if (userError) {
      // Handle specific Postgres error for Unique Constraint violation (Code 23505)
      if (userError.code === '23505') {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }
      throw userError;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: userData.id, full_name: fullName }]);

    if (profileError) throw profileError;

    const token = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userData.id, email: userData.email, fullName, role: userData.role }
    });
  } catch (err) {
    console.error('[signup]', err);
    return res.status(500).json({ error: 'Server error during signup.' });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  const validationError = validateLogin({ email, password });
  if (validationError) return res.status(400).json({ error: validationError });

  const supabase = getSupabase();

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*, profiles(full_name)')
      .eq('email', email)
      .maybeSingle(); // Use maybeSingle to avoid errors when no user is found

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, fullName: user.profiles?.full_name, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error during login.' });
  }
};

