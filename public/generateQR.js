// the is a QR code generator that requires npm install qrcode for Node.js

const QRCode = require('qrcode');
const fs = require('fs');

// Data you want to encode in the QR code
const businessData = {
  id: 'freds-cafe',
  name: 'Freds Cafe',
  email: 'info@fredscafe.nz',
  location: '163GD',
  lat: -36.87769,
  lng: 174.82965
};





// Convert to JSON string
const qrString = JSON.stringify(businessData);

// Generate PNG
QRCode.toFile('freds-cafe-qr.png', qrString, {
  color: {
    dark: '#000000', // QR code color
    light: '#FFFFFF' // background
  },
  width: 256
}, function (err) {
  if (err) throw err;
  console.log('QR code generated successfully!');
});

// JSON CONTENT (target)
//     "id": "johns-coffee",
//     "name": "Johns Coffee",
//     "email": "info@johnscoffee.nz",
//     "location": "19CF",
//     "lat": -36.88405,
//     "lng": 174.83155,
//     "img": "images/johns-coffee.jpg"