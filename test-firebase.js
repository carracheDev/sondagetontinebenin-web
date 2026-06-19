
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push } = require('firebase/database');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

console.log('Testing connection to:', firebaseConfig.databaseURL);

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function test() {
  try {
    console.log('Attempting to push data to "test_connection"...');
    await push(ref(db, 'test_connection'), {
      timestamp: Date.now(),
      status: 'testing'
    });
    console.log('✅ Success! Connection working.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to connect or write:');
    console.error(err.message);
    if (err.code) console.error('Error Code:', err.code);
    process.exit(1);
  }
}

test();
