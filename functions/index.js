const functions = require('firebase-functions');
// const json2csv = require("json2csv").parse;

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin');
admin.initializeApp();
let db = admin.firestore();

exports.setCredentials = functions.firestore.document("/users/{semester}/{stream}/{uid}").onWrite( async (snapshot, context) => {
    // if (context.eventType == 'providers/firebase.auth/eventTypes/ref.create'
    //     || context.eventType == 'providers/firebase.auth/eventTypes/ref.update'
    //     || context.eventType == 'google.firestore.document.write'
    //     || context.eventType == 'google.firestore.document.create'
    //     ) {
      var data = {}  
      if (snapshot.data != null)
          data = snapshot.data ()
        await admin.auth().getUser(context.params.uid).then(async function (userRecord) {
          claims = userRecord.customClaims
          console.log('uid:', context.params.uid, 'current claims:', context.params.claims);
          
          if (typeof (userRecord.customClaims) == 'undefined') {
            console.log('no existing claims for', context.params. uid);
            claims = {}
          }
          claims ['semester'] = context.params.semester
          claims ['stream'] = context.params.stream
          if (data["final-submit"] === true) {
            claims ['submit'] = true
          }
  
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

exports.downloadCSV = functions.https.onRequest(async (request, response) => {
  console.log (request.body)
  // console.log (request, response)
  //   const tokenId = request.get('Authorization').split('Bearer ')[1];

  //   await admin.auth().verifyIdToken(tokenId)
  //     .then((decoded) => userRecord = decoded)
  //     .catch((err) => response.status(401).send(err));

  // if (userRecord.customClaims.admin != true)  {
  //   console.log ("user is not admin")
  //   return
  // }

  let docs = []
  db.collection ("users").doc (request.body.semester).collection (request.body.stream)
    .get ()
    .then(snapshot => {
      snapshot.forEach(doc => {
        // console.log(doc.id, '=>', doc.data());
        data = doc.data ()
        data ["ApplicationID"] = doc.id
        docs.push (data)
      });
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
  
  const csv = json2csv.parse(docs)
  response.setHeader(
    "Content-disposition",
    "attachment; filename=report.csv"
  )
  response.set("Content-Type", "text/csv")
  response.status(200).send(csv)
  
})

'use strict';

const { Readable } = require('stream');
const JSON2CSVParser = require('./JSON2CSVParser');
const JSON2CSVAsyncParser = require('./JSON2CSVAsyncParser');
const JSON2CSVTransform = require('./JSON2CSVTransform');
const flatten = require('./transforms/flatten');
const unwind = require('./transforms/unwind');

module.exports.Parser = JSON2CSVParser;
module.exports.AsyncParser = JSON2CSVAsyncParser;
module.exports.Transform = JSON2CSVTransform;

// Convenience method to keep the API similar to version 3.X
module.exports.parse = (data, opts) => new JSON2CSVParser(opts).parse(data);
module.exports.parseAsync = (data, opts, transformOpts) => {
  try {
    if (!(data instanceof Readable)) {
      transformOpts = Object.assign({}, transformOpts, { objectMode: true });
    }

    const asyncParser = new JSON2CSVAsyncParser(opts, transformOpts);
    const promise = asyncParser.promise();

    if (Array.isArray(data)) {
      data.forEach(item => asyncParser.input.push(item));
      asyncParser.input.push(null);
    } else if (data instanceof Readable) {
      asyncParser.fromInput(data);
    } else {
      asyncParser.input.push(data);
      asyncParser.input.push(null);
    }

    return promise;
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports.transforms = {
  flatten,
  unwind,
};