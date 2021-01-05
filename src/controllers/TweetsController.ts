import { Request, Response } from 'express'
import { validationResult } from 'express-validator'

import { UserDocumentModelInterface } from '@models/UserModel'
import { TweetModel, TweetModelInterface } from '@models/TweetModel'

class TweetsController {
  async index(req: Request, res: Response): Promise<void> {
    try {
      const tweets = await TweetModel.find({}).populate('user').sort({ createdAt: '-1' }).exec()

      res.status(200).json({
        status: 'success',
        data: tweets,
      })
    } catch (error) {
      res.status(500).json({
        status: 'error',
        errors: error,
      })
    }
  }

  async show(req: Request, res: Response): Promise<void> {
    try {
      const tweetId = req.params.id

      const tweet = await TweetModel.findOne({ _id: tweetId }).populate('user').exec()

      if (!tweet) {
        res.status(404).json({
          status: 'error',
          errors: 'Tweet has not found',
        })
        return
      }

      res.status(200).json({
        status: 'success',
        data: tweet,
      })
    } catch (error) {
      res.status(500).json({
        status: 'error',
        errors: error,
      })
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as UserDocumentModelInterface

      if (!user) {
        res.status(403).json({
          status: 'error',
          errors: 'Unauthorized',
        })
        return
      }

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({
          status: 'error',
          errors: errors.array(),
        })
        return
      }

      const data: TweetModelInterface = {
        text: req.body.text,
        user: user._id,
      }

      const tweet = await TweetModel.create<TweetModelInterface>(data)

      res.status(200).json({
        status: 'success',
        data: await tweet.populate('user').execPopulate(),
      })
    } catch (error) {
      res.status(500).json({
        status: 'error',
        errors: error,
      })
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const user = req.user as UserDocumentModelInterface

    try {
      if (user) {
        const tweetId = req.params.id
        const existedTweet = await TweetModel.findById(tweetId).exec()

        if (!existedTweet) {
          res.status(404).json({
            status: 'error',
            errors: 'Tweet has not found',
          })
          return
        }

        if (String(existedTweet.user) !== String(user._id)) {
          res.status(403).json({
            status: 'error',
            errors: 'Cannot delete tweet created by other person',
          })
          return
        }

        TweetModel.deleteOne({ _id: tweetId }, (err) => {
          if (err) {
            res.status(404).json({
              status: 'error',
              errors: 'Tweet has not found',
            })
            return
          }

          res.status(200).json({
            status: 'success',
          })
        })
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        errors: error,
      })
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const user = req.user as UserDocumentModelInterface

    try {
      if (user) {
        const tweetId = req.params.id
        const newText = req.body.text

        const tweet = await TweetModel.findById(tweetId).exec()

        if (!tweet) {
          res.status(404).json({
            status: 'error',
            errors: 'Tweet has not found',
          })
          return
        }

        if (String(tweet.user) !== String(user._id)) {
          res.status(403).json({
            status: 'error',
            errors: 'Cannot edit tweet created by other person',
          })
          return
        }

        tweet.text = newText
        tweet.save()

        res.status(200).json({
          status: 'success',
        })
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        errors: error,
      })
    }
  }
}

export const TweetsCtrl = new TweetsController()
