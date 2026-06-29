dotenv.config();
import dotenv from "dotenv";
import passport from "passport";
import passportFacebook from "passport-facebook";

const FacebookStrategy = passportFacebook.Strategy;
export const facebookPassport = passport.use(
  new FacebookStrategy(
    {
      clientID: "866492805044644",
      clientSecret: "271a8855879b222a12eeeb6515812ff2",
      callbackURL: "http://localhost:3035/api/auth/facebook/callback",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
  
      return done(null, profile);
      // const email = googleUser.emails[0].value;
      // const firstName = googleUser.name.givenName;
      // const lastName = googleUser.name.familyName;
      // const isAccountVerified = googleUser.email_verified == true ? 1 : 0;
      // const id = googleUser.id;
      // const source = "google";

      // const currentUser = await User.findOne({ email });

      // if (!currentUser) {
      //   const newUser = await new User({
      //     email,
      //     firstName,
      //     lastName,
      //     source,
      //     isAccountVerified,
      //     id,
      //     accessToken,
      //   }).save();
      //   let payload = { userId: newUser._id };
      //   let token = await createJwtToken(payload);
      //   return done(null, token);
      // }

      // if (currentUser.source != "google") {
      //   //return error
      //   return done(null, false, {
      //     message: `You have previously signed up with a different signin method`,
      //   });
      // }
      // let payload = { userId: currentUser._id };
      // let token = await createJwtToken(payload);
      // return done(null, token);
    }
  )
);
