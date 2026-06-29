import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then((e) => {
      console.log("connected to database.",e.connection.db.namespace);
      console.log("connected to database URL.",process.env.MONGO_URL);
	  
    })
    .catch((e) => {
      console.log(e);
    });
};
