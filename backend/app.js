import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from './utils/supabase/server.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('CV Generator Backend is running!');
});

// Example route using Supabase (simplified)
app.get('/test-supabase', async (req, res) => {
  try {
    // Note: This is a placeholder for how you might use the server client.
    // In a real app, you would pass an actual cookie store or use a service role key.
    const mockCookieStore = {
      getAll: () => [],
      set: () => {}
    };
    const supabase = createClient(mockCookieStore);
    
    // Test a simple query
    const { data, error } = await supabase.from('todos').select('*').limit(1);
    
    if (error) throw error;
    res.json({ message: 'Supabase connection successful', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
