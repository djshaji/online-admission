const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin');
admin.initializeApp();

exports.setCredentials = functions.firestore.document("/users/{semester}/{stream}/{uid}").onWrite( async (snapshot, context) => {
    // if (context.eventType == 'providers/firebase.auth/eventTypes/ref.create'
    //     || context.eventType == 'providers/firebase.auth/eventTypes/ref.update'
    //     || context.eventType == 'google.firestore.document.write'
    //     || context.eventType == 'google.firestore.document.create'
    //     ) {
        await admin.auth().getUser(context.params.uid).then(async function (userRecord) {
          claims = userRecord.customClaims
          console.log('uid:', context.params.uid, 'current claims:', context.params.claims);
          
          if (typeof (userRecord.customClaims) == 'undefined') {
            console.log('no existing claims for', context.params. uid);
            claims = {}
          }
          claims ['semester'] = context.params.semester
          claims ['stream'] = context.params.stream
          await admin.auth().setCustomUserClaims(context.params.uid, claims)
            .then(async function (cl) {
              console.log('claims set to', cl, 'by', claims);
              // await admin.auth().getUser(context.params.uid).then((userRecord) => {
              //   console.log('new claims are', userRecord.customClaims);
                
              // })
            })
        })
                    
        // console.log('claims set to', {role: context.params.role });
          
    return null    
})

