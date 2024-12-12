import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:3000");

ws.onopen = () => {
  console.log("Connected to WebSocket server");

  // Subscribe to "car1"
  ws.send(JSON.stringify({ event: "subscribe", subscription: "car1" }));

  // Subscribe to "car2"
  ws.send(JSON.stringify({ event: "subscribe", subscription: "car2" }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.event) {
    case "car1": {
      const { latitude, longitude } = message.data;
      console.log(
        `Received GPS data car 1: Latitude: ${latitude}, Longitude: ${longitude}`
      );
      break;
    }
    case "car2": {
      const { latitude, longitude } = message.data;
      console.log(
        `Received GPS data car 2: Latitude: ${latitude}, Longitude: ${longitude}`
      );
      break;
    }
    default:
      console.log("Unknown event:", message);
  }
};

ws.onclose = () => {
  console.log("WebSocket connection closed");
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};
