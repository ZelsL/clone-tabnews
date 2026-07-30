import pg, { Client } from "pg";

const { Pool } = pg;

const databaseCredentials = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.NODE_ENV === "production" ? true : false,
};

const pool = new Pool(databaseCredentials);

async function query(queryObject) {
  try {
    const res = await pool.query(queryObject);
    return res;
  } catch (err) {
    console.error("Error to consult database: ", err);
    throw err;
  }
}

async function end() {
  await pool.end();
}

async function getNewClient() {
  const client = new Client(databaseCredentials);
  await client.connect();
  return client;
}

export default {
  query,
  end,
  getNewClient,
};
