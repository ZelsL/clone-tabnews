import email from "infra/email.js";
import database from "infra/database.js";
import webserver from "infra/webserver.js";
import user from "models/user.js";
import { NotFoundError } from "infra/errors";

const EXPIRATION_IN_MILISSECONDS = 60 * 15 * 1000; // 15 minutes

async function findOneValidById(tokenId) {
  const activationTokenObject = await runSelectQuery(tokenId);

  return activationTokenObject;

  async function runSelectQuery(tokenId) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM
        user_activation_tokens
      WHERE
        id = $1
        AND expires_at > NOW()
        AND used_at IS NULL
      LIMIT
        1
      ;`,
      values: [tokenId],
    });
    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O token de ativação informado não foi encontrado ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }

    return results.rows[0];
  }
}

async function findOneValidByToken(activationToken) {
  const validToken = await runSelectQuery(activationToken);

  return validToken;

  async function runSelectQuery(activationToken) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM
        user_activation_tokens
      WHERE
        id = $1
        AND expires_at > NOW()
        AND used_at IS NULL
      LIMIT
        1
      ;`,
      values: [activationToken],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O token de ativação informado não foi encontrado ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }

    return results.rows[0];
  }
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

async function markTokenAsUsed(activationTokenId) {
  const usedActivationToken = await runUpdateQuery(activationTokenId);
  return usedActivationToken;

  async function runUpdateQuery(activationTokenId) {
    const results = await database.query({
      text: `
      UPDATE
        user_activation_tokens
      SET
        used_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
      ;`,
      values: [activationTokenId],
    });

    return results.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
  ]);
  return activatedUser;
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
  sendEmailToUser,
  findOneValidByToken,
  findOneValidById,
  markTokenAsUsed,
  activateUserByUserId,
};

export default activation;
