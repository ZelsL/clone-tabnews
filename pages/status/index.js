import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1> Status</h1>
      <DatabaseInfo />
    </>
  );
}

function DatabaseInfo() {
  const { isLoading, data } = useSWR("api/v1/status", fetchApi, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";
  let postgresVersion = "Carregando...";
  let maxConnection = "Carregando...";
  let openedConnections = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-br");
    postgresVersion = data.dependencies.database.version;
    maxConnection = data.dependencies.database.max_connections;
    openedConnections = data.dependencies.database.opened_connections;
  }

  return (
    <>
      <div> Última atualização: {updatedAtText}</div>
      <div>
        <h2>
          <strong>Banco de Dados</strong>
        </h2>
        <hr></hr>
        <p>Versão do Postgres: {postgresVersion}</p>
        <p>Conexões disponíveis: {maxConnection}</p>
        <p>Conexões abertas: {openedConnections}</p>
      </div>
    </>
  );
}
