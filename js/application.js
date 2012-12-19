var setUpDatabase = function() {
  rethinkdb.connect({ host: '10.16.3.131', port: 8080 }, function(conn){
    rethinkdb.dbList().run().collect(function(existingDbs){
      if($.inArray('passionfruit', existingDbs) === -1) {
        rethinkdb.dbCreate('passionfruit').run();
        rethinkdb.db('passionfruit').tableCreate({tableName: 'passion', primaryKey: 'name'}).run();
      }
    });
  });
}

var connectToDB = function(callback){
  rethinkdb.connect({ host: '10.16.3.131', port: 8080 }, function(conn){
    console.log("Connected to DB");
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
      .filter(r.js("this.name.indexOf('" +  startingWith + "') == 0"))
      .map(function(passion){return passion('name')})
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
      .distinct()
      .run()
      .collect(callback);
  });  
}

$(document).ready(function(){
   setUpDatabase();
  $("#add-tags-form").submit(function(e){
    e.preventDefault();
    var formValues = $(e.target).serializeObject();
    var user = formValues["name"];
    var tags = formValues["tags"];
    connectToDB(function(table){
      table.insert({ name: user, tags: tags.split(",") }).run();
    });
  });

  $("#name").autocomplete({
    source: function( request, response ) {
      namesStartingWith(request.term, response);
    }
  });
});
