dotenv.config();
import dotenv from "dotenv";
import passport from "passport";
import passportGoogle from "passport-google-oauth2";
import { User } from "../models/User.js";
import { createJwtToken } from "../services/CommanService.js";
const GoogleStrategy = passportGoogle.Strategy;

passport.serializeUser(async (user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  done(null, user);
});

// export default passport.use(
//     new GoogleStrategy(
//         {
//             clientID: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//             callbackURL: process.env.CALL_BACK_URL,
//             passReqToCallback: true
//         },
//         async function (request, accessToken, refreshToken, googleUser, done) {
//             const user = googleUser;
//             return done(null, user);
//         }
//     )
// );

export const googlePassport = passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://ticketing.theconnplex.com/",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, googleUser, done) {
      const email = googleUser.emails[0].value;
      const firstName = googleUser.name.givenName;
      const lastName = googleUser.name.familyName;
      const isAccountVerified = googleUser.email_verified == true ? 1 : 0;
      const id = googleUser.id;
      const source = "google";

      const currentUser = await User.findOne({ email });

      if (!currentUser) {
        const newUser = await new User({
          email,
          firstName,
          lastName,
          source,
          isAccountVerified,
          id,
          accessToken,
        }).save();
        let payload = { userId: newUser._id };
        let token = await createJwtToken(payload);
        return done(null, token);
      }

      if (currentUser.source != "google") {
        //return error
        return done(null, false, {
          message: `You have previously signed up with a different signin method`,
        });
      }
      let payload = { userId: currentUser._id };
      let token = await createJwtToken(payload);
      return done(null, token);
    }
  )
);
