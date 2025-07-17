import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    throw UnsupportedError("Platform not supported");
  }

  static const FirebaseOptions web = FirebaseOptions(
   apiKey: "AIzaSyABbKJhHhjJ17vqKJyCiUAIvXInt0Q9HG0",
   appId: "1:809693265377:web:a1951c1c0c2c9fc04f26a0",
   messagingSenderId: "809693265377",
   projectId: "vms-db-cb72b",
   authDomain: "vms-db-cb72b.firebaseapp.com",
   storageBucket: "vms-db-cb72b.firebasestorage.app",
   measurementId: "G-V78KNTLYB0"

  );
}