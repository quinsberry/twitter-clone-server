import dotenv from 'dotenv'
dotenv.config()

import express from 'express'

import { UsersCtrl } from '@controllers/UsersController'
import { TweetsCtrl } from '@controllers/TweetsController'
import { registerValidations } from '@validations/register'
import { tweetsValidations } from '@validations/tweets'

import '@core/db'
import { passport } from '@core/passport'

export const app = express()

/*
  TODO:
  - Add authorization by JWT + Passport
  - Add opportunity to create new tweets by authorized user
  - Create custom middleware for checking authorization, validation _id and inject it to request.
*/

app.use(express.json())
app.use(passport.initialize())

app.get('/users', UsersCtrl.index)
app.get('/users/me', passport.authenticate('jwt', { session: false }), UsersCtrl.getUserInfo)
app.get('/users/:id', UsersCtrl.show)

app.post('/auth/signup', registerValidations, UsersCtrl.create)
app.get('/auth/verify', UsersCtrl.verify)
app.post('/auth/signin', passport.authenticate('local'), UsersCtrl.afterLogin)

app.get('/tweets', TweetsCtrl.index)
app.get('/tweets/:id', TweetsCtrl.show)
app.patch('/tweets/:id', passport.authenticate('jwt'), tweetsValidations, TweetsCtrl.update)
app.delete('/tweets/:id', passport.authenticate('jwt'), TweetsCtrl.delete)
app.post('/tweets', passport.authenticate('jwt'), tweetsValidations, TweetsCtrl.create)

const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3001

async function start() {
  try {
    app.listen(PORT, (): void => {
      console.log(`Server has been started on port ${PORT}..`)
    })
  } catch (e) {
    console.log(`Server Error: ${e.message}`)
    process.exit(1)
  }
}

start()
