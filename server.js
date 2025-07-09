const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('colors');

const PORT = 5000;

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

//set up morgan
app.use(
  morgan('dev', {
    skip: function (req, res) {
      return req.url == '/favicon.ico';
    },
  })
);

app.use('/api', require('./routes'));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/build/index.html'));
// });

app.listen(PORT, () => {
  console.log(`listening on port `.blue + `${PORT}`.yellow);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
