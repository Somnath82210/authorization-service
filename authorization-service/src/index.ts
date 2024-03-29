import express, { Application } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/routes";
import morgan from "morgan";
import fs from "fs";
import path from "path";
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8080;

// let writeStream = fs.createWriteStream(path.join(__dirname, "server.log"), {
//   flags: "a",
// });
//{ stream: writeStream }
app.use(express.static("public/uploads"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.use("/api/", routes);

app.listen(port, (): void => {
  if (typeof port === "undefined")
    throw new Error("Your server is not connected");
  console.info("Server is listening on port ::", port);
});
