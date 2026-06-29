import { User } from "../../models/User.js";
import GoogleStrategy from "passport-google-oauth2";
import passport from "passport";
export async function socialLogin(req, res, next) {
  try {    
    const findUser = await User.findOne({ email: req.user.email });
    if (findUser) {
      return res.status(200).json({
        status: 200,
        message: "google user get",
        data: findUser,
      });
    } else {
      const user = await new User({
        name: req.user.displayName,
        email: req.user.email,
        image: req.user.photos[0].value,
        provider: req.user.provider,
        isVerified: req.user.verified,
      }).save();
      return res.status(200).json({
        status: 200,
        message: "google user create",
        data: user,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: error.message,
    });
  }
}
