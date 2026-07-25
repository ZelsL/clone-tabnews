import pg from "pg";

function getSSLConfig() {
  if (process.env.POSTGRES_CA) {
    return {
      rejectUnauthorized: true,
      ca: process.env.POSTGRES_CA,
    };
  } else if (!process.env.POSTGRES_CA) {
    return false;
  }

  return { rejectUnauthorized: false };
}

const { Pool } = pg;
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  ssl: getSSLConfig(),
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
