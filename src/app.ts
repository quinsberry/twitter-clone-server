import dotenv from "dotenv";
dotenv.config();

import express from "express";

import { UserCtrl } from "./controllers";
import { registerValidations } from "./validations";

import "./core/db";
import { passport } from "./core/passport";
import { session } from "passport";

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.get("/users", UserCtrl.index);
app.get(
  "/users/me",
  passport.authenticate("jwt", { session: false }),
  UserCtrl.getUserInfo
);
app.get("/users/:id", UserCtrl.show);
app.post("/auth/signup", registerValidations, UserCtrl.create);
app.get("/auth/verify", UserCtrl.verify);
// app.patch("/users", UserCtrl.update);
// app.delete("/users", UserCtrl.delete);
app.post("/auth/signin", passport.authenticate("local"), UserCtrl.afterLogin);

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
