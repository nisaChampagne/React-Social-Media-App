const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express')
const app = express()

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});


app.get('/getscreams', (req, res)=> {
    if(req.method !== 'GET'){
        return res.status(400).json({error: 'Method not allowed'})
    }

    admin.firestore().collection('screams').get()
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

    admin.firestore().collection('screams').add(newScream)
        .then((doc) => {
            res.json({message: `document ${doc.id} created successfully` })
            return res.json(newScream)
        })
        .catch((err) => {
            res.status(500).json({ error: 'something went wrong'});
            console.error(err)
        })

})

exports.api = functions.https.onRequest(app);