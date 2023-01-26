import admin from "firebase-admin";

// https://firebase.google.com/docs/storage/admin/start
var serviceAccount = {
    "type": "service_account",
    "project_id": "storage-bucket-for-twitt-c9704",
    "private_key_id": "6129063db4bf6b9950f2fee9510b6deee9a4594f",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3P1EjmMWD7uLK\nGxORPw6dEv78vPaTACxne3UO9h6P4LfbyT2+RGPoSUZ9nffdHvncWXX9hNGC1TRG\nBD7dlPb2vld7ZYv7WjNgk2FueCbys+js/1Py3ckXLHOFse1cNoAiCas2aNM1Bzy7\ndXzyGNbsqXFauQZHg8zDapwVrBTWyBirmysBInxj0THGmBqe8DcXNU0sRcTwMYMa\nUWuxHzpf1TIA5GWUdAz+RvD012Dh6tTNMkOMWba0VcKmfj7bVS3ozWmYjuK4HXFU\nRR4aX5H4RUEdzeoUu19rstg4irI1nCERBpLmJPDKqOop/76p9WRfrwsUEuOSYtuG\n8GmjGufJAgMBAAECggEAAOUOQF4+mKZR9SqsrcjhCWNOW22Qxqb5kIfJyojpHUq7\nmxcgdg1fb4LsFTDwROQh1DGboeFEJJ9l4fGjXPGdQxcq1i9ov5FxLseJckCj8Atw\n17dncYgjszlEVyLHRev+NCxX6awZW+jtIv0v3v7ADefF5euBXFgIZ+vdVz2/3Eyb\nrp6oX9Bfs0wYRq+m6RmEaXDRnWP8QLrBPF4HINrl/iGPKYd9Gg3b9OJYY+gwc+78\np6hTHP9r6lH1FrJ44OWSg73T+vK62q4VyDt/8lIoem4bMFQau+lQVc7PZfotWfvl\nMAQpjzU4tz0Dl5AN2BAS07og4a9V/yGmxTNlCfG1AQKBgQD7vS866eXH4usJTPsW\ncwg3sNHbNJFFWbhTjN+RXH1G21l6+bnyzTKKkMPT2ZzqOM4JSlSraMvGKMOIM+RV\nA4gx78R5HcstRbz4TFkCfYVVZbmaC9W3evCB36XBJaEUksekBgSdk35fZp/peq5u\nPiBrsimnXFEXE+dssqQ1mfd4ywKBgQC6WVmK6daxkRAZc0VWxSn9CJqZzNMvBBE2\np6JBn8+sSz3hW3Hxi0mAO6uxtF1gKY+GMhT6R+01jUXmuVpAv3CnuMLDDv8RHmzn\nLUv29MTMGhP1H1W/Y1qrDLwgC0CNgdUmtrpMOgahBdnwOTNjhxkPPMGz3funUfa2\nJcQC9vETOwKBgQCt8ZcE+kFP0LffAVYtuOZgtMkM0lHevZPkB18jrejSYRZ/JrcZ\n0jeuD0GAzMjj/sQ/HyFKH2tOTTRulIydQYeGGcqEddXCPoHIf9ixI9JRo6yPiMXv\ntf8hfkumHj4jXRideZsO1q9ndB3i0mZcvojgYYbuoZdWfuZV8UoNz4lz6QKBgF+N\nk1mkwD762FuEfQiaPwaNk+DLY3qXRlBVMuEdljqNtmRJJKsrtfu4HTkY+Exn4z13\njsQrf5nXIAHIB1xuDdEi71Nf7DCV/leoJWyzY/oYYSVu9OQXiRVuiUSRIH+vFGIu\njmap1l5ZBsCkRBKD4riqedTGPdU1NSF/SfwPLdyjAoGBAJqAjppyTPLUTF3jyy7d\nG+IBcuB/1JQzzBc5mre+VUIazBZwPaCEmYvOH3KBSd5J0784TcJ5cJ0jHtZxBMda\nz8V3Dg0wW7Fv524wU4m47l0IJZDOdvW43n972QFyd5TOmgStYRmGxEhD6Lh6rkUd\nfiTXbOG2hpTcs8yrqb6R0ef/\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-58vb7@storage-bucket-for-twitt-c9704.iam.gserviceaccount.com",
    "client_id": "116531815247889129266",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-58vb7%40storage-bucket-for-twitt-c9704.iam.gserviceaccount.com"
}
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://storage-bucket-for-twitt-c9704.firebaseio.com"
});
const bucket = admin.storage().bucket("gs://storage-bucket-for-twitt-c9704.appspot.com");

export default bucket;