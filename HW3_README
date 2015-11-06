# HW3: Cache, Proxies, Queues
=========================
### Setup

* Clone this repo, run `npm install`.
* Install redis and run on localhost:6379

### Task 1: Complete set/get with an expiring cache
When `/set` is visited, application will set a new key in redis client with the value:
> "this message will self-destruct in 10 seconds".
Timer is set for this key in redis with `client.expire("key", 10);`
When `/get` is visited, application will get that stored key and display it to webpage.

### Task 2: Recent visited sites
New route with `/recent` has been created, which will display the most recently visited sites.
Inside `app.use(function(req, res, next)` application is pushing current request's url into `urlList` variable. 
Inside `/recent` route application is just fetching latest 5 values from `urlList` list with 
	client.lrange(urlList, 0, 4, function(err,value){ ...
and displaying on webpage.

### Task 3: Cat picture uploads: queue
Two new routes `/upload`, and `/meow` are implemented.
Image is uploaded using curl command as follows

	curl -F "image=@./img/morning.jpg" localhost:3000/upload

`upload` stores the images in a queue named `imageQueue` and when user sends a request to `\meow` route, recently uploaded image is displayed to user and is removed from redis queue `imageQueue`.

### Task 4: Additional service instance running
There is already an instance of service running at port 3000. Similar to that, I am running another instance of the service on port 3001 with following code.

	var additionalServer = app.listen(3001, function () {

	  var host = additionalServer.address().address
	  var port = additionalServer.address().port

	  console.log('Additional instance of service is running at http://%s:%s', host, port)
	})

### Task 5: Proxy server
I have added new node package `http-proxy` for creating proxy server. Following code runs proxy server on port 3002.
	var proxy   = httpProxy.createProxyServer({});
	var serverProxy  = http.createServer(function(req, res)
	{
	  client.rpoplpush(serverList, serverList, function(err, TARGET){
	  		console.log("TARGET:" + TARGET);
		  	proxy.web( req, res, {target: TARGET } );
	  });
	  
	});
	serverProxy.listen(3002);
	console.log('Proxy listening at http://%s:%s', serverProxy.address().address, serverProxy.address().port);
[rpoplpush](http://redis.io/commands/rpoplpush)

