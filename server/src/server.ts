import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Middleware to parse JSON
app.use(express.json());

// Map to store client subscriptions (a client can subscribe to multiple events)
const clients: Map<WebSocket, Set<string>> = new Map();

// Handle WebSocket connections
wss.on("connection", (ws: WebSocket) => {
  console.log("New WebSocket connection");

  // Initialize subscriptions for the client
  clients.set(ws, new Set());

  // Handle incoming messages
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.event === "subscribe" && data.subscription) {
        // Add subscription(s) for the client
        const subscriptions = clients.get(ws);
        if (subscriptions) {
          subscriptions.add(data.subscription);
          console.log(`Client subscribed to: ${data.subscription}`);
        }
      } else if (data.event === "unsubscribe" && data.subscription) {
        // Remove subscription(s) for the client
        const subscriptions = clients.get(ws);
        if (subscriptions) {
          subscriptions.delete(data.subscription);
          console.log(`Client unsubscribed from: ${data.subscription}`);
        }
      }
    } catch (err) {
      console.error("Invalid message received:", message);
    }
  });

  // Handle disconnection
  ws.on("close", () => {
    console.log("WebSocket connection closed");
    clients.delete(ws);
  });
});

// Single endpoint for handling multiple event types
app.post("/data", (req, res) => {
  const { name, gpsData } = req.body;

  // Broadcast data to clients subscribed to the specified name
  clients.forEach((subscriptions, ws) => {
    if (subscriptions.has(name) && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: name, data: gpsData }));
    }
  });

  console.log(`Broadcasted data to "${name}" subscribers:`, gpsData);
  res
    .status(200)
    .json({ message: `Data broadcasted to "${name}" subscribers` });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
