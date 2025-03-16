import { Request, Response } from "express";
import { Pool } from "pg";

const pool = new Pool({
    user: 'postgres.lvnxpkrrjhzljnlbipfn',
    host: 'aws-0-us-west-1.pooler.supabase.com',
    database: 'postgres',
    password: 'Floqui*0312',
    port: 5432,
  });

export class MonedaController {
    async getMonedaByArchivo(req: Request, res: Response): Promise<void> {
        try {
          const resultado = await pool.query(
            "SELECT valor FROM moneda WHERE nombre = $1",
            ["USD"]
          );
          if (resultado.rows.length === 0) {
            throw new Error(`Moneda no encontrada`);
          }
          res.status(200).json(resultado.rows[0].valor);
        } catch (error) {
          res.status(404).json({ error: "Moneda no encontrada" });
        }
      }

  async updateMonedaByArchivo(req: Request, res: Response): Promise<void> {
    try {
      const valor = parseInt(req.params.valor);
      const resultado = await pool.query(
        "UPDATE moneda SET valor = $1 WHERE nombre = $2",
        [valor, "USD"]
      );
      if (resultado.rowCount === 0) {
        throw new Error(`Moneda no encontrada`);
      }
      res.status(200).json({ message: "Moneda actualizada" });
    } catch (error) {
      res.status(404).json({ error: "Moneda no encontrada" });
    }
  }
}
