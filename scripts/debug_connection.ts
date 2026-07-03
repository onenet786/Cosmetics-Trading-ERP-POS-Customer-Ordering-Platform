import { getDatabaseUrl } from '../prisma/prisma.config.ts';
import pg from 'pg';

async function testConnection() {
  let url = '';
  try {
    url = getDatabaseUrl();
  } catch (err: any) {
    console.error('❌ Failed to get database URL:', err.message);
    return;
  }

  // Obscure password for safety
  const safeUrl = url.replace(/:([^:@]+)@/, ':****@');
  console.log('Resolved Database URL:', safeUrl);

  try {
    const urlObj = new URL(url);
    console.log('Parsed Connection Info:');
    console.log('  Protocol:', urlObj.protocol);
    console.log('  Host:', urlObj.host);
    console.log('  Hostname:', urlObj.hostname);
    console.log('  Port:', urlObj.port);
    console.log('  Pathname (DB Name):', urlObj.pathname);
  } catch (e: any) {
    console.error('❌ URL Parsing failed:', e.message);
  }

  console.log('Testing direct connection via pg...');
  const pool = new pg.Pool({ connectionString: url });
  
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful! DB Time:', res.rows[0].now);
  } catch (err: any) {
    console.error('❌ Connection failed:', err.message || err);
  } finally {
    await pool.end();
  }
}

testConnection();
