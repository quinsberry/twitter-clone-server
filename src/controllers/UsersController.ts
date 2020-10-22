import { Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

import { generateMD5 } from "../utils/generate-hash";
import { sendEmail } from "../utils/sendEmail";

import {
  UserModel,
  UserModelInterface,
  UserDocumentModelInterface,
} from "../models/UserModel";

class UsersController {
  async index(req: Request, res: Response): Promise<void> {
    try {
      UserModel.find({}, (err, users) => {
        if (err) {
          res.status(500).json({
            status: "error",
            errors: err,
          });
          return;
        }

        res.status(200).json({
          status: "success",
          data: users,
        });
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        errors: err,
      });
    }
  }

  async show(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;

      UserModel.findOne({ _id: userId }, (err, user) => {
        if (err) {
          res.status(404).json({
            status: "error",
            errors: "User has not found",
          });
          return;
        }

        res.status(200).json({
          status: "success",
          data: user,
        });
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
        return;
      }

      const data: UserModelInterface = {
        fullname: req.body.fullname,
        username: req.body.username,
        email: req.body.email,
        password: generateMD5(
          req.body.password + process.env.SECRET_KEY || "123"
        ),
        confirmHash: generateMD5(
          process.env.SECRET_KEY || Math.random().toString()
        ),
      };

      UserModel.create<UserModelInterface>(data, (err, user) => {
        if (err) {
          res.status(500).json({
            status: "error",
            errors: err,
          });
          return;
        }

        sendEmail(
          {
            emailFrom: "registration@twitterclone.com",
            emailTo: data.email,
            subject: "Email confirmation from Twitter Clone",
            html: `Click the <a href="http:localhost:${
              process.env.PORT || 3001
            }/auth/verify?hash=${
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

  async getUserInfo(req: Request, res: Response): Promise<void> {
    try {
      const user = (req.user as UserDocumentModelInterface)?.toJSON();
      res.status(200).json({
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

  async afterLogin(req: Request, res: Response): Promise<void> {
    try {
      const user = (req.user as UserDocumentModelInterface)?.toJSON();
      res.status(200).json({
        status: "success",
        data: {
          ...user,
          token: jwt.sign({ id: user._id }, process.env.SECRET_KEY || "123", {
            expiresIn: "30 days",
          }),
        },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        errors: err,
      });
    }
  }
}

export const UsersCtrl = new UsersController();
