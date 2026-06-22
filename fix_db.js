import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function fixDB() {
    console.log("Conectando a la base de datos...");
    const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: true
        }
    });

    try {
        console.log("Intentando añadir la columna 'updated_at'...");
        try {
            await pool.query(`
                ALTER TABLE user_generations 
                ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
            `);
            console.log("✅ Columna 'updated_at' añadida exitosamente.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("⚠️ La columna 'updated_at' ya existe.");
            } else {
                throw e;
            }
        }

        console.log("Reabasteciendo peticiones para la IP: 189.138.36.45...");
        const [result] = await pool.query(`
            UPDATE user_generations 
            SET generation_count = 0, updated_at = CURRENT_TIMESTAMP 
            WHERE ip_address = '189.138.36.45';
        `);
        
        if (result.affectedRows > 0) {
            console.log("✅ Peticiones reabastecidas (Límite reseteado a 0 generaciones) para tu IP.");
        } else {
            console.log("⚠️ No se encontró la IP en la base de datos. Se insertará un registro limpio.");
            await pool.query(`
                INSERT INTO user_generations (ip_address, generation_count) 
                VALUES ('189.138.36.45', 0);
            `);
            console.log("✅ IP registrada y reabastecida con 0 generaciones.");
        }

    } catch (error) {
        console.error("❌ Error durante la ejecución:", error);
    } finally {
        await pool.end();
        console.log("Conexión cerrada.");
    }
}

fixDB();
