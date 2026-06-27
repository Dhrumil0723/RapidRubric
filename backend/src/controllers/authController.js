const bcrypt = require("bcryptjs");
const { supabase, supabaseAuth } = require("../config/supabase");

const ALLOWED_ROLES = ["student", "ta", "instructor"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res, next) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password, role } = req.body;
    const name = req.body.name?.trim();

    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: "email, password, name, and role are required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (name.length === 0) {
      return res.status(400).json({ message: "name cannot be blank" });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${ALLOWED_ROLES.join(", ")}` });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const {
      data: { user },
      error: createError,
    } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, role },
    });

    if (createError) {
      return res.status(400).json({ message: createError.message });
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ password_hash: passwordHash })
      .eq("id", user.id);

    if (updateError) {
      await supabase.auth.admin.deleteUser(user.id);
      return res.status(500).json({ message: "Failed to save user profile" });
    }

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, email, full_name: name, role },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Fetch profile by email using service role (bypasses RLS)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, password_hash, deleted_at")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (profile.deleted_at) {
      return res.status(401).json({ message: "Account has been deactivated" });
    }

    // Verify bcrypt hash when present (users registered via backend endpoint)
    if (profile.password_hash) {
      const valid = await bcrypt.compare(password, profile.password_hash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    // Get Supabase session (JWT) — required for all subsequent API calls.
    // Uses the dedicated stateless anon client so sign-ins never interfere.
    const { data, error: signInError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return res.status(401).json({ message: signInError.message });
    }

    return res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: {
        id: profile.id,
        email,
        full_name: profile.full_name,
        role: profile.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Invalidates the current session server-side so the token cannot be reused.
async function logout(req, res, next) {
  try {
    const token = req.headers.authorization?.slice(7);
    if (token) {
      await supabase.auth.admin.signOut(token, "local");
    }
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout };
