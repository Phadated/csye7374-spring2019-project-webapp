const promClient = require('prom-client');

const homeCounter = new promClient.Counter({ 
    name: 'home_counter', 
    help: 'Number of visits to / -http.get' 
});


const pingCounter = new promClient.Counter({ 
    name: 'ping_counter', 
    help: 'Number of visits to /ping ' 
});

module.exports = {
  getHomePage: (req, res) => {
    homeCounter.inc();
    res.render('main.ejs', {
        title: "Welcome"

    });

},
    getPingPage: (req, res) => {
        pingCounter.inc();
       res.send("Pong-Ankush")
    },

  
};


