import express, { Express, Request, Response } from "express";
import cors from "cors";
import { GetWeatherData } from "./Apis/GetWeatherData";
import { GetSelectOptions } from "./Apis/GetSelectOptions";

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json()); // Add this line to parse JSON bodies

const corsOptions = {
    origin: true, // Allow all origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  };

app.use(cors(corsOptions));

// Start the HTTP server
const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.post("/nui-event", async (req: Request, res: Response) => {
    if (req?.body) {
        const clientData = req.body;
        console.log("Received Client Data:", clientData);
        if (!clientData) {
            res.json({
                success: false,
                message: "ERROR 402 NO DATA RECIEVED",
            })
        };

        if (clientData?.event === "GetSelectOptions") {
            const apiData = await GetSelectOptions(clientData?.data)
            res.json({
                success: true,
                message: apiData
            })
        } else if (clientData?.event === "GetWeatherData") {
            const apiData = await GetWeatherData(clientData?.data?.location?.lat, clientData?.data?.location?.lon, clientData?.data?.keyMap, clientData?.data?.temp || "c")
            res.json({
                success: true,
                message: apiData
            })
        } else {
            res.json({
                success: false,
                message: "ERROR 403 NO EVENT",
            })
        }
    } else {
        console.error("ERROR, NO BODY")
    }
});