import { model as User } from '../models/user.model.js';
import { hash } from 'bcrypt';
import passport from 'passport';
import { handleError } from './controllerUtil.js';

async function registerUser(request, response) {
  const username = request.body.email;
  // Gibt es Username schon?
  await User.findOne({ username: username })
    .exec()
    .then(async (user) => {
      if (user) {
        // User existiert bereits => Conflict (409)
        return Promise.reject({
          message: `User with username ${username} already exists.`,
          status: 409,
        });
      }
      // Passwort hashen und salzen
      const hashedPwd = await hash(request.body.password, 10);
      // Neuen User anlegen
      return User.create({
        username: username,
        nickname: request.body.nickname,
        password: hashedPwd,
      }).then((user) => {
        response.json({
          _id: user._id,
          username: user.username,
          nickname: user.nickname,
        });
      });
    })
    .catch((error) => {
      handleError(error, response);
    });
}

function getUser(request, response) {
  const user = request.user;
  if (!user) {
    return response.json();
  }
  response.json({
    _id: user._id,
    username: user.username,
    nickname: user.nickname,
  });
}

function loginUser(request, response, next) {
  // User Authentisierung durchführen
  // - Aufruf der bei der Initialisierung von Passport definierten
  //   Authentisierungs-Methode (verify)
  // - Bei erfolgreicher Authentisierung wird Session erstellt
  //   und in DB gespeichert.
  passport.authenticate('local', function (error, user, info) {
    if (error) {
      // Fehler während Authentisierung
      // => Fehler weiterleiten
      return next(error);
    }
    if (!user) {
      // User konnte nicht authentisiert werden
      console.log(info);
      // Code Uauthorized (401) in Response zurückliefern
      return response.status(401).json({ message: 'Authentication failed' });
    }
    // Authentisierung erfolgreich
    // User Session einrichten, damit Response Session Cookie
    // hinzugefügt wird. Dies geschieht über die Methode logIn,
    // welche Passport request Objekt hinzufügt.
    request.logIn(user, () => {
      response.json({
        _id: user._id,
        username: user.username,
        nickname: user.nickname,
      });
    });
  })(request, response, next);
}

function logoutUser(request, response, next) {
  // User von User Session lösen. Dies geschieht über die Methode logOut,
  // das Passport request Objekt für eingeloggte User hinzufügt.
  request.logOut((error) => {
    // Fehler bei Logout
    // => Fehler weiterleiten
    if (error) {
      console.log('Failed to logout');
      return next(error);
    }
    // Session löschen. Dies geschieht über das Property session, das
    // express-session request Objekt für eingeloggte User hinzufügt.
    // Das Property session ist ein Objekt, das für das löschen der
    // Session eine Methode destroy anbietet.
    request.session.destroy((error) => {
      if (error) {
        console.log('Failed to destroy session');
        return next(error);
      }
      // Sicherstellen, dass Cookie im Client gelöscht wird.
      response.clearCookie('connect.sid');
      response.json({ message: 'Successfully logged out' });
    });
  });
}

export { registerUser, getUser, loginUser, logoutUser };
