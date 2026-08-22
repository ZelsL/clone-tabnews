import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";

const EXPIRATION_IN_MILISSECONDS = 60 * 15 * 1000; // 15 minutes

async function findOneByUserId(userId) {
  const results = await database.query({
    text: `
      SELECT
        *
      FROM
        user_activation_tokens
      WHERE
        user_id = $1
      LIMIT
        1
    `,
    values: [userId],
  });

  return results.rows[0];
}

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISSECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
         ($1, $2)
        RETURNING
          *
      `,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Clone Curso.dev <contato@clone-curso.dev>",
    to: user.email,
    subject: "Ative seu cadastro no clone curso.dev!",
    text: `${user.username}, clique no link abaixo para ativar o seu cadastro no Clone Curso.dev:
    
${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Equipe Clone Curso.dev`,
  });
}
const activation = {
  create,
  findOneByUserId,
  sendEmailToUser,
};

export default activation;
