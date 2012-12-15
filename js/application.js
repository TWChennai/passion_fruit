var connectToDB = function(callback){
	rethinkdb.connect({ host: '10.16.4.39', port: 8080 }, function(conn){
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
			.filter(r.js("this.user.indexOf('" +  startingWith + "') == 0"))
			.map(function(passion){return passion('user')})
			.run().collect(callback);
	});
}

$(document).ready(function(){
	$("#add-tags-form").submit(function(e){
		e.preventDefault();
		var formValues = $(e.target).serializeObject();
		var user = formValues["name"];
		var tags = formValues["tags"];
		connectToDB(function(table){
			table.insert({ user: user, tags: tags.split(",") }).run();
		});
	});

	$("#name").autocomplete({
		source: function( request, response ) {
			namesStartingWith(request.term, response);
        }
    });


});