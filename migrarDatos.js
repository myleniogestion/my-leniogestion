const { Pool } = require('pg');

// Configuración de las conexiones a las bases de datos
const supabaseConfig = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.lvnxpkrrjhzljnlbipfn',
  password: 'Floqui*0312',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
};

const localConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'pg',
  database: 'Migrate_MyLenio'
};

// Crear pools de conexión
const supabasePool = new Pool(supabaseConfig);
const localPool = new Pool(localConfig);

// Tablas en el orden correcto para respetar relaciones de clave foránea
const tablesInOrder = [
  'tienda',
  'rol',
  'permiso',
  'rol_permiso',
  'Rol_permiso',
  'usuario',
  'proveedor',
  'producto',
  'entrada',
  'producto_tienda',
  'Producto_tienda',
  'salida',
  'cliente',
  'tipo_servicio',
  'moneda',
  'servicio',
  'venta',
  'deuda',
  'pago_deuda',
  'accion',
  'tipo_accion'
];

// Función para obtener la estructura de una tabla
async function getTableStructure(tableName) {
  const query = `
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = $1 OR table_name = $2
    ORDER BY ordinal_position
  `;
  
  // Buscar tanto en mayúsculas como en minúsculas
  const { rows } = await supabasePool.query(query, [tableName.toLowerCase(), tableName]);
  return rows;
}

// Función para transferir datos de una tabla
async function transferTableData(tableName) {
  try {
    console.log(`\nProcesando tabla: ${tableName}`);
    
    // Obtener estructura de la tabla
    const structure = await getTableStructure(tableName);
    
    if (structure.length === 0) {
      console.log(`No se encontró la tabla ${tableName} en Supabase, omitiendo...`);
      return;
    }
    
    // Crear tabla en la base de datos local si no existe
    await createLocalTable(tableName, structure);
    
    // Obtener datos de Supabase
    console.log(`Obteniendo datos de ${tableName} desde Supabase...`);
    const { rows } = await supabasePool.query(`SELECT * FROM "${tableName}"`);
    
    if (rows.length === 0) {
      console.log(`La tabla ${tableName} está vacía, omitiendo...`);
      return;
    }
    
    // Insertar datos en la base de datos local
    console.log(`Insertando ${rows.length} registros en ${tableName}...`);
    await insertDataIntoLocalTable(tableName, rows, structure);
    
    console.log(`Tabla ${tableName} transferida exitosamente!`);
  } catch (error) {
    console.error(`Error al transferir la tabla ${tableName}:`, error.message);
  }
}

// Función para crear la tabla en la base de datos local
async function createLocalTable(tableName, columns) {
  const columnDefinitions = columns.map(col => {
    let definition = `"${col.column_name}" ${col.data_type.toUpperCase()}`;
    
    // Manejar tipos especiales
    if (col.data_type === 'character varying') {
      definition = `"${col.column_name}" VARCHAR`;
    } else if (col.data_type === 'timestamp with time zone') {
      definition = `"${col.column_name}" TIMESTAMP WITH TIME ZONE`;
    } else if (col.data_type === 'timestamp without time zone') {
      definition = `"${col.column_name}" TIMESTAMP`;
    } else if (col.data_type === 'integer') {
      definition = `"${col.column_name}" INTEGER`;
    } else if (col.data_type === 'bigint') {
      definition = `"${col.column_name}" BIGINT`;
    } else if (col.data_type === 'numeric') {
      definition = `"${col.column_name}" NUMERIC`;
    } else if (col.data_type === 'boolean') {
      definition = `"${col.column_name}" BOOLEAN`;
    }
    
    if (col.is_nullable === 'NO') {
      definition += ' NOT NULL';
    }
    
    if (col.column_default) {
      definition += ` DEFAULT ${col.column_default}`;
    }
    
    return definition;
  });
  
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS "${tableName}" (
      ${columnDefinitions.join(',\n')}
    )
  `;
  
  try {
    await localPool.query(createTableQuery);
  } catch (error) {
    console.error(`Error al crear la tabla ${tableName}:`, error.message);
    throw error;
  }
}

// Función para insertar datos en la tabla local
async function insertDataIntoLocalTable(tableName, rows, columns) {
  const columnNames = columns.map(col => `"${col.column_name}"`).join(', ');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  
  const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`;
  
  const client = await localPool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Truncar la tabla solo si existe (opcional)
    await client.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
    
    // Insertar filas en lotes para mejor rendimiento
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const batchPromises = batch.map(row => {
        const values = columns.map(col => {
          // Manejar valores NULL explícitos
          if (row[col.column_name] === null) return null;
          return row[col.column_name];
        });
        return client.query(insertQuery, values);
      });
      
      await Promise.all(batchPromises);
      console.log(`  Lote ${Math.floor(i / batchSize) + 1} insertado (${Math.min(i + batchSize, rows.length)}/${rows.length})`);
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Función principal
async function main() {
  try {
    console.log('Iniciando transferencia de datos...');
    
    // Transferir datos de cada tabla en el orden especificado
    for (const table of tablesInOrder) {
      await transferTableData(table);
    }
    
    console.log('\n¡Transferencia de datos completada con éxito!');
  } catch (error) {
    console.error('Error en la transferencia:', error);
  } finally {
    // Cerrar conexiones
    await supabasePool.end();
    await localPool.end();
    process.exit();
  }
}

// Ejecutar el script
main();