import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

const corsHandler = cors({
  origin: ['http://localhost:4200', 'https://devas.io'],
  allowedHeaders: 'idToken'
});

admin.initializeApp(functions.config().firebase);

export const renderFooter = functions.https.onRequest(async (request, response) => {
  corsHandler(request, response, async () => {
    response.contentType('text/plain');
    const idToken = request.query.idToken
      ? request.query.idToken
      : (request.header('idToken') as string);

    let decodedIdToken: any;
    try {
      decodedIdToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      response.status(400).send('idToken inválido');
    }

    if (decodedIdToken) {
      const docSnapshot = await admin
        .firestore()
        .collection('usuarios')
        .doc(decodedIdToken.uid)
        .get();

      const usuario = docSnapshot.data() as any;
      // <img src="${usuario.picture}" >
      const html = `

        <h1>Olá ${usuario.name}</h1>`;
      response.send(html);
    } else {
      response.status(400).send('Usuário inválido');
    }
  });
});
