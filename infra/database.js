import { Client } from "pg";

const databaseCredentials = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.NODE_ENV === "production" ? true : false,
};

async function query(queryObject) {
  let client;
  try {
    client = new Client(databaseCredentials);
    await client.connect();
    const res = await client.query(queryObject);
    return res;
  } catch (err) {
    console.error("Error to consult database: ", err);
    throw err;
  } finally {
    await client.end();
  }
}

async function getNewClient() {
  const client = new Client(databaseCredentials);
  await client.connect();
  return client;
}

export default {
  query,
  getNewClient,
};
