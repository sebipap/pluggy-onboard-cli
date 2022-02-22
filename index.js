const pluggy = require("pluggy-sdk");

const client = new pluggy.PluggyClient({
  clientId: "5dd8585c-f271-475c-bd01-4dabfdee1a9e",
  clientSecret: "f31bb8e4-d89e-450c-9291-e412385cacd1",
});

const newItemId = async (user, connectorId) => {
  const itemId = client
    .createItem(connectorId, user)
    .then((res) => res.id)
    .catch((e) => console.log(e));

  return itemId;
};

const logData = (id, field) => {
  switch (field) {
    case "accounts":
      client.fetchAccounts(id).then((res) => {
        console.log(field, res.results);
      });
      break;

    case "identity":
      client.fetchIdentityByItemId(id).then((res) => console.log(res));
      break;

    case "investments":
      client.fetchInvestments(id).then((res) => console.log(res));
      break;

    default:
      break;
  }
};

const displayItemData = (id, field) =>
  client.fetchItem(id).then((res) => {
    switch (res.status) {
      case "UPDATED":
        console.clear();
        logData(id, field);
        break;

      case "OUTDATED":
        console.clear();
        console.log(
         res.executionStatus, "there was an error with the sync process."
        );
        break;

      case "LOGIN_ERROR":
        console.clear();
        console.log(res.executionStatus, "login error");
        break;

      default:
        setTimeout(() => {
          console.clear();
          console.log(res.status, "   -   ", res.executionStatus);
          displayItemData(id, field);
        }, 1000);
        break;
    }
  });

const getData = async (user, field, connectorId) =>
  displayItemData(await newItemId(user, connectorId), field);

const displayConnectors = () => {
  client
    .fetchConnectors({ sandbox: true })
    .then((res) =>
      res.results.forEach((connector) =>
        console.log(connector.id, connector.name)
      )
    );
};

require("yargs")
  .scriptName("pirate-parser")
  .usage("$0 <cmd> [args]")
  .command(
    "connectors",
    "List all connectors",
    () => {},
    displayConnectors
  )
  .command(
    "get [field] [user] [password] [connectorId]",
    "Log user account",
    (yargs) => {},
    function (argv) {
      console.log(
        `Attempting loggin to ${argv.user} ${argv.password} ${argv.field}`
      );
      getData({ user: argv.user, password: argv.password }, argv.field, argv.connectorId);
    }
  )
  .help().argv;
