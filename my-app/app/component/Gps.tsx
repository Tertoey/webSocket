"use client";

import { useEffect, useState } from "react";

interface GpsData {
  latitude: number;
  longitude: number;
}

export default function Home() {
  const [car1Data, setCar1Data] = useState<GpsData | null>(null);
  const [car2Data, setCar2Data] = useState<GpsData | null>(null);

  useEffect(() => {
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
        case "car1":
          setCar1Data(message.data);
          break;
        case "car2":
          setCar2Data(message.data);
          break;
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

    // Cleanup WebSocket connection on unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      <h1>GPS Data</h1>

      <div>
        <h2>Car 1</h2>
        {car1Data ? (
          <p>
            Latitude: {car1Data.latitude}, Longitude: {car1Data.longitude}
          </p>
        ) : (
          <p>No data for Car 1</p>
        )}
      </div>

      <div>
        <h2>Car 2</h2>
        {car2Data ? (
          <p>
            Latitude: {car2Data.latitude}, Longitude: {car2Data.longitude}
          </p>
        ) : (
          <p>No data for Car 2</p>
        )}
      </div>
    </div>
  );
}
