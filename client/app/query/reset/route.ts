import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

async function resetDatabase() {
   const data = await sql`
        DROP TABLE IF EXISTS invoices, customers, users, revenue;
  `;
   return data;
}
export async function GET() {
   try {
      await resetDatabase();
   } catch (error) {
      return Response.json({ error }, { status: 500 });
   }
}
