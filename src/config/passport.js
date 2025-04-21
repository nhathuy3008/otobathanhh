require('dotenv').config(); // nếu chưa có
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const passport = require('passport');
const Account = require('../models/Account');

passport.use(new GoogleTokenStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
}, async (accessToken, refreshToken, profile, done) => {
  try {
      const email = profile.emails?.[0]?.value || null;
      const fullName = profile.displayName || 'Google User';
      const avatar = profile.photos?.[0]?.value || null;

      if (!email) return done(new Error('Không lấy được email từ Google'));

      let user = await Account.findOne({ email });

      if (!user) {
          user = await Account.create({
              email,
              fullName,
              image: avatar,
              enabled: true,
              type: 'google'
          });
      }

      return done(null, user);
  } catch (err) {
      return done(err, false);
  }
}));
passport.use(new FacebookTokenStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log("Profile:", profile);
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;

    if (!email && !profile.id) {
      return done(new Error('Không lấy được thông tin người dùng từ Facebook'));
    }

    let account = await Account.findOne({ email });

    if (!account) {
      account = new Account({
        fullName: name,
        email: email || null,
        type: 'facebook',
        enabled: true,
        image: profile.photos?.[0]?.value || null
      });
      await account.save();
    }

    return done(null, account);
  } catch (err) {
    console.error("Lỗi khi xử lý Facebook login:", err);
    return done(err);
  }
}));
  






