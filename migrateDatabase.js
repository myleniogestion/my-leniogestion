const { Pool } = require('pg');

// Configuración de la base de datos local
const localDbHost = 'localhost';
const localDbPort = 5432;
const localDbUsername = 'postgres';
const localDbPassword = 'pg';
const localDbName = 'Gestion_web_Milenio';

// Configuración de la base de datos de Supabase
const supabaseDbHost = 'aws-0-us-west-1.pooler.supabase.com';
const supabaseDbPort = 5432;
const supabaseDbUsername = 'postgres.lvnxpkrrjhzljnlbipfn';
const supabaseDbPassword = 'Floqui*0312';
const supabaseDbName = 'postgres';

// Conexión a la base de datos local
const localPool = new Pool({
  host: localDbHost,
  port: localDbPort,
  user: localDbUsername,
  password: localDbPassword,
  database: localDbName,
});

// Conexión a la base de datos de Supabase
const supabasePool = new Pool({
  host: supabaseDbHost,
  port: supabaseDbPort,
  user: supabaseDbUsername,
  password: supabaseDbPassword,
  database: supabaseDbName,
});

async function migrarDatos() {
  try {
    // Obtener los datos de la base de datos local
    const resultado = await localPool.query('SELECT * FROM mi_tabla');
    const datos = resultado.rows;

    // Insertar los datos en la base de datos de Supabase
    for (const dato of datos) {
      await supabasePool.query('INSERT INTO mi_tabla (columna1, columna2, ...) VALUES ($1, $2, ...)', [dato.columna1, dato.columna2, ...]);
    }

    console.log('Datos migrados con éxito');
  } catch (error) {
    console.error(error);
  } finally {
    await localPool.end();
    await supabasePool.end();
  }
}

migrarDatos();