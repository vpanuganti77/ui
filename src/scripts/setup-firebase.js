const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔥 Firebase Setup for HostelPro\n');

const questions = [
  'Firebase API Key: ',
  'Firebase Auth Domain (project-id.firebaseapp.com): ',
  'Firebase Project ID: ',
  'Firebase Storage Bucket (project-id.appspot.com): ',
  'Firebase Messaging Sender ID: ',
  'Firebase App ID: ',
  'Firebase VAPID Key: '
];

const envKeys = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
  'REACT_APP_FIREBASE_VAPID_KEY'
];

let answers = [];
let currentQuestion = 0;

function askQuestion() {
  if (currentQuestion < questions.length) {
    rl.question(questions[currentQuestion], (answer) => {
      answers.push(answer.trim());
      currentQuestion++;
      askQuestion();
    });
  } else {
    setupFirebase();
  }
}

function setupFirebase() {
  let envContent = '';
  for (let i = 0; i < envKeys.length; i++) {
    envContent += `${envKeys[i]}=${answers[i]}\n`;
  }
  
  fs.writeFileSync(path.join(__dirname, '../../.env'), envContent);
  console.log('✅ Updated .env file');

  const swPath = path.join(__dirname, '../../public/firebase-messaging-sw.js');
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  swContent = swContent.replace(
    /firebase\.initializeApp\({[\s\S]*?}\);/,
    `firebase.initializeApp({
  apiKey: "${answers[0]}",
  authDomain: "${answers[1]}",
  projectId: "${answers[2]}",
  storageBucket: "${answers[3]}",
  messagingSenderId: "${answers[4]}",
  appId: "${answers[5]}"
});`
  );
  
  fs.writeFileSync(swPath, swContent);
  console.log('✅ Updated firebase-messaging-sw.js');
  
  console.log('\n🎉 Firebase setup complete!');
  console.log('📱 Your notification system is ready for Android!');
  
  rl.close();
}

console.log('Please enter your Firebase configuration values:\n');
askQuestion();