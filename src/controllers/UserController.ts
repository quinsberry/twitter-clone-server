import { Request, Response } from "express";
import { validationResult } from "express-validator";

import { generateMD5 } from "../utils/generate-hash";
import { sendEmail } from "../utils/sendEmail";

import { UserModel } from "../models";
import { UserModelInterface } from "models/UserModel";

class UserController {
  async index(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserModel.find({}).exec();

      res.status(200).json({
        status: "success",
        data: users,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        errors: err,
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          status: "error",
          errors: errors.array(),
        });
      }

      const data: UserModelInterface = {
        fullname: req.body.fullname,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        confirmHash: generateMD5(
          process.env.SECRET_KEY || Math.random().toString()
        ),
      };

      const user = await UserModel.create(data);

      sendEmail(
        {
          emailFrom: "registration@twitterclone.com",
          emailTo: data.email,
          subject: "Email confirmation from Twitter Clone",
          html: `Click the <a href="http:localhost:${
            process.env.PORT || 3001
          }/users/verify?hash=${
            data.confirmHash
          }">link</a> to confirm your email.`,
        },
        (err: Error | null) => {
          if (err) {
            res.status(500).json({
              status: "error",
              message: err,
            });
          }
        }
      );

      res.status(201).json({
        status: "success",
        data: user,
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        errors: err,
      });
    }
  }

  async verify(req: Request, res: Response): Promise<void> {
    try {
      const hash = req.query.hash as string;

      if (!hash) {
        res.status(400).send();
        return;
      }
      const user = await UserModel.findOne({ confirmHash: hash }).exec();

      if (!user) {
        res.status(404).send();
        return;
      }

      user.confirmed = true;
      user.save();

      res.status(200).json({
        status: "success",
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        errors: err,
      });
    }
  }
}

export const UserCtrl = new UserController();
