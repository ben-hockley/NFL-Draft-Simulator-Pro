
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://ocstqtwtowhlrrwifgvc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_ZWLa-8B8AMRFqJI90jfSzA_oNHc6sPY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * API Endpoint: Fetch Prospects
 */
app.get('/api/prospects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('rank', { ascending: true });

    if (error) {
      console.error('Supabase Query Error:', error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }

    res.json(data);
  } catch (err) {
    console.error('Backend Fetch Logic Failed:', err.message);
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: err.message 
    });
  }
});

/**
 * Middleware to serve .tsx files with the correct MIME type.
 */
app.use((req, res, next) => {
  if (req.path.endsWith('.tsx') || req.path.endsWith('.ts')) {
    res.type('application/javascript');
  }
  next();
});

// Serve static files (CSS, JS, images)
app.use(express.static(__dirname));

/**
 * SPA Support: Serve index.html for ALL routes that are not API calls or static files.
 * This ensures that a browser refresh at any path (e.g. /draftsim) correctly loads the app shell.
 */
app.get('*', (req, res) => {
  // If it's a request for an API, don't serve index.html
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`NFL Draft Simulator backend running at http://localhost:${port}`);
});

export { app };
