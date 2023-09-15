const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const account = require('./routes/account.js');
const event = require('./routes/event.js');

app.use(account); // account.js 모듈 호출
app.use(event); // event.js 모듈 호출

// const swaggerUi = require('swagger-ui-express');
// const swaggerFile = require('./swagger-output.json')

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile, { explorer: true }));

app.listen(app.get('port'), () => {
  console.log('3000 Port : Server Started...');
});
