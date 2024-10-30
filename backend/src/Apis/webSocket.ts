import express, { Express, Request, Response } from "express";
import cors from "cors";
import { WebSocketServer } from "ws"; 

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json()); // Add this line to parse JSON bodies

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

// Start the HTTP server
const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    // Handle incoming messages here

    // Example: Echo the message back
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  // You can send initial data to the client if needed
  ws.send(JSON.stringify(
    { 
      action: "SET_MINIGAME", 
      data: { 
        currentMinigame: {
          gameType: "pipe",
          TileWidth: 8,
          TileHeight: 4,
          Timer: 30,
          readyTimer: 3
        },
      } 
    }
  ));
});

app.post("/nui-event", (req: Request, res: Response) => {
  console.log("Received data:", req.body);

  // Check if the request body contains `data: true`
  if (req.body && req.body.data === true) {
    // Respond with the game data if condition is met
    return res.json({ 
      success: true,
      currentMinigame: {
        gameType: "needle",
        GreenWidth: 50,
        Timer: 10,
        Difficulty: 5,
      },
    });
  }

  // Respond with a generic success message otherwise
  res.json({ success: true, message: "Event received, but no data returned." });
});