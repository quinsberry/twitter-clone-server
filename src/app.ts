import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { UserCtrl } from "./controllers";
import { registerValidations } from "./validations";

import "./core/db";

const app = express();

app.use(express.json());

app.get("/users", UserCtrl.index);
app.post("/users", registerValidations, UserCtrl.create);
app.get("/users/verify", UserCtrl.verify);
// app.patch("/users", UserCtrl.update);
// app.delete("/users", UserCtrl.delete);

const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3001;

async function start() {
  try {
    app.listen(PORT, (): void => {
      console.log(`Server has been started on port ${PORT}..`);
    });
  } catch (e) {
    console.log(`Server Error: ${e.message}`);
    process.exit(1);
  }
}

start();
