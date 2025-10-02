import admin from "firebase-admin";


export async function validateFirebaseIdToken(req, res, next) {
    
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(403).send("Unauthorized: No Bearer token");
  }

  const idToken = authorization.split("Bearer ")[1];

  try {

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next(); // continue to the next route handler

  } catch (err) {

    console.error("Error verifying token:", err);
    return res.status(403).send("Unauthorized: Invalid token");

  }
}
