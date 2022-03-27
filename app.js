const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//get all players
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    select * from cricket_team order by player_id;
    `;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

//get single player
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    select * from cricket_team where player_id=${playerId};
    `;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

//insert player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const postPlayerQuery = `
    insert into cricket_team (player_name, jersey_number, role)
    values('${player_name}',${jersey_number},'${role}');
    `;
  const result = await db.run(postPlayerQuery);
  const lastId = result.lastID;
  response.send("Player Added to Team");
});

//update player
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `
  update cricket_team set player_name='${playerName}',
  jersey_number=${jerseyNumber},role='${role}'
  where player_id=${playerId};
  `;
  const result = await db.run(updateQuery);
  response.send("Player Details Updated");
});

//delete a player
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
  delete from cricket_team
  where player_id=${playerId};
  `;
  const result = await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;
