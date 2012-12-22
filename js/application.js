var rethinkDBEndpoint = { host: '10.16.3.131', port: 8080 };

//TODO:  Move out the setupDatabase and seedDummyData to a different file, after extracting the endpoint setting to local browser store( issue#1).
var setUpDatabase = function() {
  rethinkdb.connect(rethinkDBEndpoint, function(conn){
    rethinkdb.dbList().run().collect(function(existingDbs){
      if($.inArray('passionfruit', existingDbs) === -1) {
        rethinkdb.dbCreate('passionfruit').run();
        rethinkdb.db('passionfruit').tableCreate({tableName: 'passion', primaryKey: 'name'}).run();
      }
    });
  });
}

var seedDummyData = function() {

  var tech = ['C','Java','Objective-C','C++','C#','PHP','Basic','Python','Perl','Ruby','JavaScript','Delphi','Lisp','Pascal','VB .NET','Ada','MATLAB','Lua','Assembly','PL/SQL'];
  var characters = ['Batman','Wolverine ','Iron Man','Superman','Spider-Man','Storm ','Flash ','Hulk ','Wonder Woman','Green Lantern','Thor ','Captain America','Catwoman','Elektra ','Mystique ','Jade ','Daredevil ','Silver Surfer','Tigra','Nightcrawler ','Deadpool ','Human Torch','Iceman ','Blade ','Daredevil ','Cyclops ','Starfire ','Green Arrow','Xena: Warrior Princess','Rogue ','Raven ','Supergirl','Shadowcat','The Jaguar ','Gambit ','Zorro','Black Canary','Ghost Rider ','Robin ','Aquaman','Professor X','Hellboy','The Punisher','Magneto','X-Man','Firestar','Nightwing','Black Knight ','Invisible Woman','Colossus ','Beast ','Rampage ','Batgirl','Quicksilver ','Juggernaut ','Firestorm ','Black Lightning','Huntress ','Hawkeye ','Black Panther ','Mister Fantastic','Superwoman','Beast Boy','Queen of Swords','Thing ','Rose and Thorn','Emma Frost','Wonder Girl','Scarlet Witch','Isis ','Crystal ','Havok ','Power Girl','Black Widow ','Red Tornado','Venus ','Scooby Doo','She-Ra','Hercules ','The Incredibles','Cyborg ','Captain Marvel ','Matilda Wormwood','Ultraviolet ','Black Widow ','Miss America ','Starlight ','Ice ','White Witch ','Dream Girl','Dawn ','Goku','Teen Titans ','Katana ','Darkstar ','Dragonfly ','Stan Lee','Dawnstar','Black Orchid','Black Cat ','Icemaiden'
  ];

  var insertUsers = function(users) {
    rethinkdb.connect(rethinkDBEndpoint, function(conn){
      conn.use('passionfruit');
      var insertUser = function(user){
        rethinkdb.table('passion').insert(user, true).run();
      };
      users.forEach(insertUser);
      conn.close();
    },
    function(){
      alert("Not able to connect to db");
    });
  }

  var users = characters.map(function(name) { return {name : name, tags : tech.sort(function() { return 0.5 - Math.random();}).slice(0,5)}; })

  insertUsers(users);
};


var connectToDB = function(callback){
  rethinkdb.connect(rethinkDBEndpoint, function(conn){
    conn.use('passionfruit');
    var table = rethinkdb.table('passion')
    callback(table, rethinkdb, conn);
    conn.close();
  }, 
  function(){
    alert("Not able to connect to db");
  });
}

var namesStartingWith = function(startingWith, callback) {
  connectToDB(function(table, r) {
    table
      .filter(r.js("this.name.toLowerCase().indexOf('" +  startingWith.toLowerCase() + "') == 0"))
      .run()
      .collect(callback);
  });
}

var tagsStartingWith = function(startingWith, callback) {
  connectToDB(function(table, r) {
    table
      .concatMap(r.js("this.tags.filter(function(e, i, a){return (e.indexOf('" + startingWith + "') === 0);})"))
      .distinct()
      .run()
      .collect(callback);
  });
}

var allData = function(callback) {
  connectToDB(function(table, r) {
    table
      .concatMap(function(p){return p('tags')})
      .distinct()
      .run()
      .collect(callback);
  });
}

$(document).ready(function(){
  $("#add-tags-form").submit(function(e){
    e.preventDefault();
    var formValues = $(e.target).serializeObject();
    var user = formValues["name"];
    var tags = formValues["tags"];
    connectToDB(function(table){
      table.insert({ name: user, tags: tags.split(",") }, true).run();
    });
  });

  $("#name").autocomplete({
    source: function( request, response ) {
      namesStartingWith(request.term, function( data ) {
            response( $.map( data, function( item ) {
                return { label: item.name, tags: item.tags};
              }))
          });
    },
    select: function( event, ui ){
      $("#tags").tagit("removeAll");
      ui.item.tags.forEach(function(tag){
        $("#tags").tagit("createTag",tag);
      });
    }
  });
});
