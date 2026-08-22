import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Zels <zlszlszls19@gmail.com>",
      to: "teste@curso.dev",
      subject: "Teste de assunto",
      text: "Teste de corpo.",
    });

    await email.send({
      from: "Zels <zlszlszls19@gmail.com>",
      to: "teste@curso.dev",
      subject: "Último email enviado",
      text: "Corpo do último Email.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<zlszlszls19@gmail.com>");
    expect(lastEmail.recipients[0]).toBe("<teste@curso.dev>");
    expect(lastEmail.subject).toBe("Último email enviado");
    expect(lastEmail.text).toBe("Corpo do último Email.\r\n");
  });
});
