import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.NODE_ENV === "development" ? false : true,
});

async function query(queryObject) {
  try {
    const res = await pool.query(queryObject);
    return res;
  } catch (err) {
    console.error("Error to consult database: ", err);
    throw err;
  }
}

export default {
  query: query,
};
