const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const ejs = require('ejs');
const socketIo = require("socket.io");
const http = require("http");



const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('views', path.join(__dirname, '../views'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:23000/confessions_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Confession Schema and Model
const confessionSchema = new mongoose.Schema({
  text: String,
  timestamp: { type: Date, default: Date.now },
});
const Confession = mongoose.model('Confession', confessionSchema);

// Serve the index page with the form
app.get('/', (req, res) => {
  res.render('index.ejs');
});


// Handle form submission
app.post('/submit', async (req, res) => {
    const confessionText = req.body.confessionText;
  
    try {
      const newConfession = new Confession({ text: confessionText });
      await newConfession.save();
      io.emit("newConfession", newConfession);
      console.log('Confession submitted');
      res.redirect('/confessions');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error saving confession');
    }
  });

// Serve the confessions page with pagination
app.get('/confessions', async (req, res) => {
  var Filter = require('bad-words'),
  filter = new Filter({ replaceRegex:  /[A-Za-z0-9가-힣_]/g }); 
  var newBadWords = ['gandu','loda','lun','chod'];
  filter.addWords(...newBadWords);
    const perPage = 5;
    const page = parseInt(req.query.page) || 1;


    try {
      const totalCount = await Confession.countDocuments();
      const totalPages = Math.ceil(totalCount / perPage);
  
      const confessions = await Confession.find({})
        .sort({ timestamp: -1 }) // Sort by timestamp in descending order
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();

  confessions.map(x=>{
    x._doc.text=filter.clean(x._doc.text.toString())
  })
      res.render('confessions', {
        confessions,
        currentPage: page,
        totalPages
      });
    } catch (error) {
      console.error('Error fetching confessions:', error);
      res.status(500).send('Error fetching confessions');
    }
  });

const PORT = process.env.PORT || 3050;

// Set up socket connection event
io.on("connection", socket => {
    console.log("A user connected");
    // You can handle various socket events here
  });
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

