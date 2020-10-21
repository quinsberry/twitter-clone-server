import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { UserDocumentModelInterface } from "models/UserModel";

import { TweetModel, TweetModelInterface } from "../models/TweetModel";

class TweetsController {
  async index(req: Request, res: Response): Promise<void> {
    try {
      TweetModel.find({}, (err, tweets) => {
        if (err) {
          res.status(500).json({
            status: "error",
            errors: err,
          });
          return;
        }
        res.status(200).json({
          status: "success",
          data: tweets,
        });
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        errors: error,
      });
    }
  }

  async show(req: Request, res: Response): Promise<void> {
    try {
      const tweetId = req.params.id;

      TweetModel.findOne({ _id: tweetId }, (err, tweet) => {
        if (err || !tweet) {
          res.status(404).json({
            status: "error",
            errors: "Tweet has not found",
          });
          return;
        }
        res.status(200).json({
          status: "success",
          data: tweet,
        });
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        errors: error,
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as UserDocumentModelInterface;

      if (!user) {
        res.status(403).json({
          status: "error",
          errors: "Unauthorized",
        });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          status: "error",
          errors: errors.array(),
        });
        return;
      }

      const data: TweetModelInterface = {
        text: req.body.text,
        user: user._id,
      };

      TweetModel.create<TweetModelInterface>(data, (err, tweet) => {
        if (err) {
          res.status(404).json({
            status: "error",
            errors: "Tweet has not found",
          });
          return;
        }

        res.status(200).json({
          status: "success",
          data: tweet,
        });
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        errors: error,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const user = req.user as UserDocumentModelInterface;

    try {
      if (user) {
        const tweetId = req.params.id;
        const existedTweet = await TweetModel.findById(tweetId).exec();

        if (!existedTweet) {
          res.status(404).json({
            status: "error",
            errors: "Tweet has not found",
          });
          return;
        }

        if (String(existedTweet.user) !== String(user._id)) {
          res.status(403).json({
            status: "error",
            errors: "Cannot delete tweet created by other person",
          });
          return;
        }

        TweetModel.deleteOne({ _id: tweetId }, (err) => {
          if (err) {
            res.status(404).json({
              status: "error",
              errors: "Tweet has not found",
            });
            return;
          }

          res.status(200).json({
            status: "success",
          });
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        errors: error,
      });
    }
  }
}

export const TweetsCtrl = new TweetsController();
