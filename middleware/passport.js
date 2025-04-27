import passport from 'passport';
import LocalStrategy from 'passport-local';
import User from '../models/users.js';

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'Email non trovata' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return done(null, false, { message: 'Password errata' });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
