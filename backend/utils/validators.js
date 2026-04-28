// ── Primitives ────────────────────────────────────────────────────────────────

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

export const isValidUrl = (url) =>
  /^https?:\/\/.{2,}/i.test(String(url).trim());

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Validates signup payload.
 * Returns an error string on failure, or null on success.
 */
export const validateSignup = ({ email, password, fullName }) => {
  if (!email?.trim() || !password || !fullName?.trim()) {
    return 'Email, password, and full name are required.';
  }
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (fullName.trim().length < 2) {
    return 'Full name must be at least 2 characters long.';
  }
  return null;
};

/**
 * Validates login payload.
 * Returns an error string on failure, or null on success.
 */
export const validateLogin = ({ email, password }) => {
  if (!email?.trim() || !password) {
    return 'Email and password are required.';
  }
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address.';
  }
  return null;
};

// ── Profile ───────────────────────────────────────────────────────────────────

/**
 * Validates profile update payload.
 * Returns an error string on failure, or null on success.
 */
export const validateProfileUpdate = ({ experience_years, github_url, linkedin_url, phone, current_email }) => {
  if (experience_years !== undefined && experience_years !== null && experience_years !== '') {
    const years = Number(experience_years);
    if (isNaN(years) || years < 0 || years > 60) {
      return 'Experience years must be a number between 0 and 60.';
    }
  }
  if (github_url?.trim() && !isValidUrl(github_url)) {
    return 'GitHub URL must start with http:// or https://';
  }
  if (linkedin_url?.trim() && !isValidUrl(linkedin_url)) {
    return 'LinkedIn URL must start with http:// or https://';
  }
  if (current_email?.trim() && !isValidEmail(current_email)) {
    return 'Contact email address is invalid.';
  }
  if (phone?.trim() && !/^[+\d\s\-().]{7,20}$/.test(phone.trim())) {
    return 'Phone number format is invalid.';
  }
  return null;
};

// ── Project ───────────────────────────────────────────────────────────────────

/** Allowed columns that can be written to the projects table */
export const PROJECT_ALLOWED_FIELDS = [
  'name', 'client', 'location', 'role',
  'description', 'contributions',
  'start_date', 'end_date', 'technologies_used',
];

/**
 * Validates and sanitises a project payload.
 * Returns { error: string } on failure, or { data: object } on success.
 */
export const validateProject = (body) => {
  const { name, role, start_date, end_date, technologies_used } = body;

  if (!name?.trim()) return { error: 'Project name is required.' };
  if (!role?.trim()) return { error: 'Your role on the project is required.' };

  if (start_date && end_date) {
    if (new Date(start_date) > new Date(end_date)) {
      return { error: 'Start date must be before end date.' };
    }
  }

  if (technologies_used !== undefined && !Array.isArray(technologies_used)) {
    return { error: 'technologies_used must be an array.' };
  }

  // Build a whitelisted data object — no extra fields can sneak through
  const data = {};
  for (const field of PROJECT_ALLOWED_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  return { data };
};
