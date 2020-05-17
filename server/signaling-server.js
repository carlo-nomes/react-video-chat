const PORT = process.env.PORT || 80;

const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io").listen(http);

const randomUsername = require("./random-username");

http.listen(PORT, () => console.log(`listening on port ${PORT}`));

const msgList = [];
// helper log function:
const logStatus = (msg) => {
  console.clear();
  console.log(`Server Listening on port ${PORT}`);
  console.table(io.sockets.clients().connected, ["nickname"]);

  if (msg) msgList.push({ ts: new Date(), msg });
  msgList
    .slice(-10)
    .forEach(({ ts, msg }) =>
      console.log(`${ts.toLocaleTimeString()}: "${msg}"`)
    );
};

io.sockets.on("connection", (socket) => {
  // Get a list of currently connected users
  const getActiveUsers = () =>
    Object.entries(
      io.sockets.clients().connected
    ).map(([id, { nickname }]) => ({ id, nickname }));

  // Generate a random username on initial connection
  socket.nickname = randomUsername();
  // Emit new user list to all connected sockets
  io.emit("active users", getActiveUsers());
  logStatus(`${socket.client.id} connected`);

  // Send list of active users to requesting socket
  socket.on("get active users", () => {
    socket.emit("active users", getActiveUsers());
  });

  // Forward RTC offer to specified user
  socket.on("offer", (id, msg) => {
    const from = socket.client.id;
    logStatus(`Offer received from ${from} forwarding to ${id}`);
    socket.to(id).emit("offer", from, msg);
  });

  // Forward RTC answer to specified user
  socket.on("answer", (id, msg) => {
    const from = socket.client.id;
    logStatus(`Answer received from ${from} forwarding to ${id}`);
    socket.to(id).emit("answer", from, msg);
  });

  // Forward ICE Candidate to specified user
  socket.on("iceCandidate", (id, msg) => {
    const from = socket.client.id;
    logStatus(`ICE Candidate received from ${from} forwarding to ${id}`);
    socket.to(id).emit("iceCandidate", from, msg);
  });

  //TODO: Consider Changing RTC interactions to generic {id, type, payload} API

  // Emit new user list all connected sockets
  socket.on("disconnect", () => {
    io.emit("active users", getActiveUsers());
    logStatus(`${socket.client.id} disconnected`);
  });
});
