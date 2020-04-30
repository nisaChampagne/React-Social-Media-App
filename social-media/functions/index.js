const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express')
const app = express()

admin.initializeApp();

var firebaseConfig = {
    apiKey: "AIzaSyCeIe5gD5_XuIVILvITsj6lrNOLSBngdHw",
    authDomain: "socialmediaapp-9cf68.firebaseapp.com",
    databaseURL: "https://socialmediaapp-9cf68.firebaseio.com",
    projectId: "socialmediaapp-9cf68",
    storageBucket: "socialmediaapp-9cf68.appspot.com",
    messagingSenderId: "212491639725",
    appId: "1:212491639725:web:450a260b6f73eeb50f1f24",
    measurementId: "G-6RQQJR7NME"
  };

const firebase = require('firebase')
firebase.initializeApp(firebaseConfig);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const db = admin.firestore();


app.get('/getscreams', (req, res)=> {
    if(req.method !== 'GET'){
        return res.status(400).json({error: 'Method not allowed'})
    }

    db.firestore()
          .collection('screams')
          .orderBy('createdAt', 'desc')
          .get()
        .then(data => {
            let screams = [];
            data.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                })
            })
            return res.json(screams);
        })
        .catch(err => {
            console.error(err)
        })
})

app.post('/createscreams', (req,res)=> {
    // if(req.method !== 'POST'){
    //     return res.status(400).json({error: 'Method not allowed'})
    // }
    // express takes care of above!

    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    }

    db.firestore().collection('screams').add(newScream)
        .then((doc) => {
            res.json({message: `document ${doc.id} created successfully` })
            return res.json(newScream)
        })
        .catch((err) => {
            res.status(500).json({ error: 'something went wrong'});
            console.error(err)
        })

})

//signup route
app.post('/signup', (req,res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }

    // validate data
    let userToken;
    let userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if ( doc.exists){
                return res.status(400).json({ handle: " this handle is already taken"})
            } else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)

            }
        })
        .then(data => {// user created
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((token) => {
            userToken = token;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
           return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(()=> {
            return res.status(201).json({ userToken })
        })
        .catch(err =>{
            console.error(err);
            if ( err.code === 'auth/email-already-in-use'){
                return res.status(400).json({Email: "Email in use! Try another email."})
            } else {
                return res.status(500).json({error: err.code});
            }
        })
})

exports.api = functions.https.onRequest(app);