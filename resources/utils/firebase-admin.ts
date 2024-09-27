import { PrismaClient } from '@prisma/client';
import bodyParser from 'body-parser';
import express from 'express';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

import serviceAccount from '../../firebase/flight-logger-278103-firebase-adminsdk-dqbg3-3aa25906ed.json';

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (JWT_SECRET == null) {
  throw new Error('Missing JWT_SECRET environment variable.');
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

app.use(bodyParser.json());

// Function to get the proper column based on provider
const getProviderIdColumn = (provider: 'google' | 'github' | 'twitter') => {
  switch (provider) {
    case 'google':
      return 'googleId';
    case 'github':
      return 'githubId';
    case 'twitter':
      return 'twitterId';
    default:
      throw new Error('Unsupported provider');
  }
};

// Generic route for handling OAuth for multiple providers
app.post('/api/auth/:provider', async (req, res) => {
  const { provider } = req.params as {
    provider: 'google' | 'github' | 'twitter';
  };
  const { authorization } = req.headers;

  if (authorization == null) {
    return res.status(401).send('Unauthorized');
  }

  const token = authorization.split(' ')[1];

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid: firebaseUid, email } = decodedToken;

    const providerIdColumn = getProviderIdColumn(provider);

    // Use Prisma to find or create the user in your database
    let user;
    if (providerIdColumn === 'googleId') {
      user = await prisma.user.findUnique({
        where: { googleId: firebaseUid },
      });
    } else if (providerIdColumn === 'githubId') {
      user = await prisma.user.findUnique({
        where: { githubId: firebaseUid },
      });
    } else if (providerIdColumn === 'twitterId') {
      user = await prisma.user.findUnique({
        where: { twitterId: firebaseUid },
      });
    }

    if (user == null) {
      // Create a new user if not found
      user = await prisma.user.create({
        data: {
          [providerIdColumn]: firebaseUid,
          email,
        },
      });
    }

    // Generate JWT for your application
    const appToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Send the token to the client
    res.status(200).json({ token: appToken });
  } catch (error) {
    console.error(error);
    res.status(401).send('Unauthorized');
  }
});

const PORT = process.env.PORT != null ? parseInt(process.env.PORT) : 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
