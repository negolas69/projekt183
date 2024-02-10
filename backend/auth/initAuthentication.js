import passport from 'passport';
import LocalStrategy from 'passport-local';
import expressSession from 'express-session';
import { compare } from 'bcrypt';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import { model as User } from '../models/user.model.js';

function init(app) {
  // Authentisierungs-Methode, die von Passport bei Login aufgerufen wird
  // - Überprüft, ob Username (hier Email) und Passwort übereinstimmen
  // - Neben Username (hier Email) und Passwort übergibt Passport der Methode
  //   die Callback-Methode done. Dieser können drei Parameter übergeben
  //   werden:
  //   - Error: Falls bei der Authentisierungs Logik ein Fehler auftritt
  //   - User: User Objekt, falls die Authentisierung erfolgreich ist,
  //     false, wenn die Authentisieurng nicht erfolgreich ist
  //   - Message: Nachricht, die Grund für das Fehlschlagen der Authentisierung
  //     beschreibt
  async function verify(email, password, done) {
    try {
      const foundUser = await User.findOne({ username: email }).exec();
      if (!foundUser) {
        return done(null, false, { message: `No user with email ${email}` });
      }
      // User gefunden => überprüfen, ob Passwort korrekt ist
      if (await compare(password, foundUser.password)) {
        // Passwort korrekt => user zurückliefern
        return done(null, foundUser);
      } else {
        // Passwort nicht korrekt
        return done(null, false, {
          message: `Password of user with email ${email} incorrect`,
        });
      }
    } catch (error) {
      // Fehler bei der Verifikation
      return done(error);
    }
  }

  // Definieren wie die Authentisierung abläuft
  // - LocalStrategy bedeutet, dass die Authentisierung über einen Username
  //   und ein Passwort erfolgt.
  // - Passport erwartet standardmässig, den Usernamen und das Passwort beim
  //   Login in den Properties username und password zu finden. Das Frontend
  //   sendet den Username aber im property email. Dies muss im options-Objekt,
  //   das der LocalStrategy als Parameter übergeben wird, im Property
  //   usernameField definiert werden.
  // - Die LocalStrategy erhält zudem eine Callback Methode, die beim Login
  //   verifiziert, ob Username und Passwort übereinstimmen => Authentisierung
  //   des Users.
  passport.use(new LocalStrategy({ usernameField: 'email' }, verify));

  // Methode, welche Passport verwendet, um beim Login die nötigen
  // Informationen über den User in die Session zu schreiben (Id in der User
  // Collection in der DB). Wird benötigt, dass beim Call eines eingeloggten
  // Users festzustellen, um welchen User es sich handelt.
  passport.serializeUser((user, done) => done(null, user._id));
  // Methode, welche Passport bei jedem Call eines eingeloggten Users
  // verwendet, um den User des Calls zu ermitteln und an das Request Objekt
  // (Property user) zu hängen. Dies gelingt mit Hilfe der Session Id im Cookie,
  // das der Client mit jedem Call mitliefert und der zur Session Id gespeicherten
  // Information zum User (Id der User Collection).
  passport.deserializeUser(async (id, done) => {
    try {
      const foundUser = await User.findById(id).exec();
      if (!foundUser) {
        done('User not found');
      }
      return done(null, foundUser);
    } catch (error) {
      return done(error);
    }
  });

  // Initialisierung der Library express-session:
  // - Beim Login wird eine Session erstellt
  // - Die Session wird mit Hilfe der Library mongo-connect (MongoStore)
  //   in der MongoDB gespeichert und enthält neben der Session Id die
  //   Information, welcher User zur Session gehört
  // - Dem Client wird die Session Id in einem Cookie gesendet,
  //   das signiert ist (secret) => Integrität sicherstellen, wenn
  //   Cookie von Client zurückgeliefert wird
  // - Ist ein User eingeloggt, liefert der Client bei jedem Call das Cookie
  //   mit der Session Id, über die der Server weiss, zu welchem User der
  //   Call gehört
  app.use(
    expressSession({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoose.connection.getClient(),
      }),
      cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60, // one hour
      },
    })
  );
  app.use(passport.initialize());
  // Aufsetzen des Zusammenspiels von Passport und express-session
  // - Passport verwendet die an serializeUser übergebene Methode,
  //   um die Informationen des Users, der sich eingeloggt hat,
  //   in die Session zu schreiben
  // - Passport verwendet die an deserializeUser übergebene Methode,
  //   um die Informationen des eingeloggten Users aus der Session
  //   zu lesen
  app.use(passport.session());
}

export { init };
