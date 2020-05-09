const PORT = process.env.PORT || 80;

const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io").listen(http);

const randomUsername = require("./random-username");

http.listen(PORT, () => console.log(`listening on port ${PORT}`));

io.sockets.on("connection", (socket) => {
  // helper log function:
  const logStatus = () => {
    console.clear();
    console.log(`Server Listening on port ${PORT}`);
    console.table(io.sockets.clients().connected, ["nickname"]);
  };

  // Get a list of currently connected users
  const getActiveUsers = () =>
    Object.entries(
      io.sockets.clients().connected
    ).map(([id, { nickname }]) => ({ id, nickname }));

  // Generate a random username on initial connection
  socket.nickname = randomUsername();
  // Emit new user list to all connected sockets
  io.emit("active users", getActiveUsers());
  logStatus();

  // Send list of active users to requesting socket
  socket.on("get active users", () => {
    socket.emit("active users", getActiveUsers());
  });

  // Forward RTC offer to specified user
  socket.on("offer", (id, msg) => {
    const from = socket.client.id;
    socket.to(id).emit("offer", from, msg);
  });

  // Forward RTC answer to specified user
  socket.on("answer", (id, msg) => {
    const from = socket.client.id;
    socket.to(id).emit("answer", from, msg);
  });

  // Forward ICE Candidate to specified user
  socket.on("iceCandidate", (id, msg) => {
    const from = socket.client.id;
    socket.to(id).emit("iceCandidate", from, msg);
  });

  //TODO: Consider Changing RTC interactions to generic {id, type, payload} API

  // Emit new user list all connected sockets
  socket.on("disconnect", () => {
    io.emit("active users", getActiveUsers());
    logStatus();
  });
});
