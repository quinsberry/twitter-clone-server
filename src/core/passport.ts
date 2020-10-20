import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";

import { UserModel } from "../models";
import { generateMD5 } from "../utils/generate-hash";
import { UserDocumentModalInterface } from "../models/UserModel";

passport.use(
  new LocalStrategy(function (username, password, done) {
    UserModel.findOne({ $or: [{ email: username }, { username }] }, function (
      err,
      user
    ) {
      if (err) {
        return done(err, false);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      if (
        user.password !==
        generateMD5(password + process.env.SECRET_KEY || "123")
      ) {
        return done(null, false, { message: "Incorrect username or password" });
      }
      return done(null, user);
    });
  })
);

passport.use(
  new JWTStrategy(
    {
      secretOrKey: process.env.SECRET_KEY || "123",
      jwtFromRequest: ExtractJwt.fromHeader("token"),
    },
    async (payload: { id: string }, done) => {
      try {
        UserModel.findOne({ _id: payload.id }, (err, user) => {
          if (err) {
            return done(null, false);
          }
          if (!user) {
            return done(null, false);
          }

          return done(null, user);
        });
      } catch (err) {
        done(err, false);
      }
    }
  )
);

passport.serializeUser<UserDocumentModalInterface, string>(function (
  user,
  done
) {
  done(null, user._id);
});

passport.deserializeUser<UserDocumentModalInterface, string>(function (
  id,
  done
) {
  UserModel.findById(id, function (err, user) {
    done(err, user!);
  });
});

export { passport };
