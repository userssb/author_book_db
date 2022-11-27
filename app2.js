const express = require("express");
const path = require("path");
const app = express();
const { open } = require("sqlite");
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
const sqlite3 = require("sqlite3");

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get API /players/
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team order by player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  const res = convertDbObjectToResponseObject(playersArray);
  //   response.send(res);
  response.send(playersArray.player_name);
});

//Post API /player/
app.post("/player/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const insertPlayerQuery = `
    insert into cricket_team(player_name,jersey_number,role) 
    values('${playerName}',${jerseyNumber},'${role}');`;
  const result = await db.run(insertPlayerQuery);
  //   console.log(result);
  const playerId = result.lastID;
  response.send({ playerId: playerId });
});

//Get API players/:playerId/
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from cricket_team where player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

//Put API player/:playerId/
app.put("/player/:playerId/", async (request, response) => {
  const players = request.body;
  const { playerName, jerseyNumber, role } = players;
  const { playerId } = request.params;
  const updateQuery = `update cricket_team set
      player_name='${playerName}', jersey_number=${jerseyNumber}, role='${role}' where player_id=${playerId};`;
  const result = await db.run(updateQuery);
  response.send("Player Details Updated");
});

//Delete API players/:playerId/
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `delete from cricket_team where player_id=${playerId};`;
  const res = await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
