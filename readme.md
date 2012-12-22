##About
PassionFruit is a simple application that aims to consolidate an individual's interests, recommend others with similar interest.

For new joiners, this application can be a source of networking.

The interests are captured in the form of tags, which can have it's own hierarchy, thus giving varied levels of views.

PassionFruit is built on Javascript, backed by [RethinkDB](http://www.rethinkdb.com).

This application is still work-in-progress, future plans include (but do not limit)
* Automatic mining of interests from a varied set of sources (with the user's approval)
* Different visualizations

##Setting up
- Install [RethinkDB](http://www.rethinkdb.com/docs/install/)
- Configure the rethinkDBEndpoint in application.js
- ```setUpDatabase``` method should create the database/table on the rethinkDB instance. 
- ```seedDummyData``` method inserts dummy users and tags them with random programming languages.
(At present, both these methods need to be involed via browser console).