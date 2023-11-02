import express, {Application} from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import routes from './routes/routes';
import morgan from 'morgan';
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use('/api/', routes)


app.listen(port, (): void => {
  if (typeof port === "undefined")
    throw new Error("Your server is not connected");
  console.info("Server is listening on port ::", port);
});
