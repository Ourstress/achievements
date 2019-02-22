/**
 * This module processes profile refreshment requests
 */
const admin = require("firebase-admin");
const axios = require("axios");
const Queue = require("firebase-queue");

function updateProfile(data, resolve) {
  switch (data.service) {
    case "CodeCombat": {
     return  Promise.all([
        admin
        .database()
        .ref("/config/codeCombatProfileURL")
        .once("value")
        .then(snapshot => snapshot.val()),
        admin
        .database()
        .ref(`/userAchievements/${data.uid}/${data.service}/achievements`)
        .once("value")
        .then(existing => existing.val() || {})
      ])
      .then(([codeCombatProfileURL]) =>
        axios
          .get(
            `${codeCombatProfileURL}?username=` +
              data.serviceId
                .toLowerCase()
                .replace(/[ _]/g, "-")
                .replace(/[!@#$%^&*()]/g, "")
          )
          .then(response => {
            return admin
              .database()
              .ref(`/userAchievements/${data.uid}/${data.service}`)
              .set(
                Object.assign(
                  {
                    lastUpdate: new Date().getTime()
                  },
                  response.data
                )
              );
          })
      )
      .catch(err => console.error(data.uid, err.message))
      .then(() => resolve());
    }
    default:
      return Promise.resolve().then(() => resolve());
  }
}

exports.handler = updateProfile;

exports.queueHandler = () => {
  const queue = new Queue(
    admin.database().ref("/updateProfileQueue"),
    (data, progress, resolve) => {
      return updateProfile(data, resolve);
    }
  );

  queue.addWorker();
};
