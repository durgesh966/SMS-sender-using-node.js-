const dotenv = require('dotenv');
const colors = require('colors');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');
const app =  express();

// dotenv file setup 
dotenv.config();
const port = process.env.PORT;

// Init Nexmo
const nexmo = new Nexmo({
    apiKey: '74eeb1ed',
    apiSecret: '2oWmbAI0PgdXvqgP'
  }, { debug: true });
  

//templet engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// public folder setup
app.use(express.static(__dirname + '/public'));

// body parser middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routing
app.get('/', (req, res) => {
    res.render('index');
  });

  // Catch form submit
app.post('/', (req, res) => {
    // res.send(req.body);
    // console.log(req.body);
    const { number, text } = req.body;
  
    nexmo.message.sendSms(
      '919926785031', number, text, { type: 'unicode' },
      (err, responseData) => {
        if(err) {
          console.log(err);
        } else {
          const { messages } = responseData;
          const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
          console.dir(responseData);
          // Get data from response
          const data = {
            id,
            number,
            error
          };
  
          // Emit to the client
          io.emit('smsStatus', data);
        }
      }
    );
  });


const server = app.listen(port,()=>{
    console.log(`server listening on port no ${port}.....!`.bgYellow.black);
    console.log(`Welcome to ${process.env.DEV_DEPT} mode...!`.bgGreen.black);
});

const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected');
  })
});