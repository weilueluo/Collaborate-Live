const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.addAdminRole = functions.https.onCall((data, context) => {
  // Check if request if made by an admin
  if ( contect.auth.token.admin !== true) {
    return { error: 'LOOOOOOL! NICE TRY FOOL!' }
  }

  // Get user and add custom claim (admin)
  return admin.auth().getUserByEmail(data.email).then(user => {
    return admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    });
  }).then(() => {
    return {
      message: `Success! ${data.email} has been made an admin`
    }
  }).catch(err => {
    return err;
  });
});
