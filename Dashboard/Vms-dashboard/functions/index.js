const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.registerSecurity = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const {
      name,
      email,
      password,
      gate,
      location,
      joinedDate,
      address,
      age
    } = req.body;

    try {
      // 1. Create Firebase Auth user
      const userRecord = await admin.auth().createUser({
        email,
        password
      });

      // 2. Add user data to Firestore
      await admin.firestore().collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        name,
        email,
        role: "security",
        gate,
        location,
        joinedDate,
        address,
        age: parseInt(age),
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(201).json({ success: true, uid: userRecord.uid });
    } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ error: err.message });
    }
  });
});

exports.registerApartmentHolder = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }
  
      const {
        name,
        email,
        password,
        apartmentNo,
        location,
        membershipStart,
        membershipEnd,
        address,
        age
      } = req.body;
  
      try {
        const userRecord = await admin.auth().createUser({
          email,
          password
        });
  
        await admin.firestore().collection("users").doc(userRecord.uid).set({
          uid: userRecord.uid,
          name,
          email,
          role: "apartment_holder",
          apartmentNo,
          location,
          membershipStart,
          membershipEnd,
          address,
          age: parseInt(age),
          active: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
  
        return res.status(201).json({ success: true, uid: userRecord.uid });
      } catch (err) {
        console.error("Error creating apartment holder:", err);
        return res.status(500).json({ error: err.message });
      }
    });
  });