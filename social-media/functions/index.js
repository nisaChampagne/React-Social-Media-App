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

// helper function to check if input is empty
const  isEmpty = (string)=>{
    if (string.trim() === ''){// white spaces
        return true;
    } else {
        return false
    }
}

// helper to check if email is valid
// const isEmail = (email) => {
//     const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     if (email.match(regEx)) return true;
//     else return false;
//   };

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

    let errors = {};

    // checking if input fields are empty
    if ( isEmpty(newUser.email)){
        errors.email = "Must not be empty"
    }

    if (isEmpty(newUser.password)){
        errors.password = "Must not be empty"
    }

    if (newUser.password !== newUser.confirmPassword){
        errors.confirmPassword = "Passwords must match!;"
    }

    if (isEmpty(newUser.handle)){
        errors.handle = "Must not be empty"
    }

    if(Object.keys(errors).length > 0){
        return res.status(400).json(errors)
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

// login route
// valid email and no empty email
// password and confirmPassword the same


exports.api = functions.https.onRequest(app);