var redis = require('redis');
var multer  = require('multer');
var express = require('express');
var http = require('http');
var fs      = require('fs');
var httpProxy = require('http-proxy');

var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})
var urlList = "recentURLs";
var serverList = "serverList";
var imageQueue = "imageQueue";
//client.ltrim(serverList, 1, 0);
client.del(serverList);
client.rpush(serverList, 'http://127.0.0.1:3000');
client.rpush(serverList, 'http://127.0.0.1:3001');

//HTTP Proxy
/*var proxy   = httpProxy.createProxyServer({});
var serverProxy  = http.createServer(function(req, res)
{
	client.rpoplpush(serverList, serverList, function(err, TARGET){
	console.log("Proxy now pointing to server:" + TARGET);
	proxy.web( req, res, {target: TARGET } );
  	});
});
serverProxy.listen(3002);
console.log('Proxy listening at http://%s:%s', serverProxy.address().address, serverProxy.address().port);*/

//HTTP SERVER 1
var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Server listening at http://%s:%s', host, port)
})

//HTTP SERVER 2
/*var additionalServer = app.listen(3001, function () {
  var host = additionalServer.address().address
  var port = additionalServer.address().port
  console.log('Additional instance of service is running at http://%s:%s', host, port)
})*/

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
	console.log("--------------------------------------");
	console.log("Request URL:\"" + req.url + "\" on port:" + req.socket.localPort);	
	client.lpush(urlList, req.url);
	client.ltrim(urlList, 0, 4);
	next(); // Passing the request to the next handler in the stack.
});

app.get('/', function(req, res) {
  res.send('Hello world\n');
})

app.get('/set', function(req, res) {
	var key = "key";
	var value = "This message will self-destruct in 10 seconds";
	client.set("key", value);
	client.expire("key", 10);
	res.send("value set to: This message will self-destruct in 10 seconds");
})

app.get('/get', function(req, res) {
	client.get("key", function(err,value){ 
		if(!err) {
			//console.log(value);
			var redisvalue = value;
			if (value)
				res.send(redisvalue);
			else
				res.send("key not found...");
		}
		else{
			res.send("no key found");
		}	
	});
})

app.get('/recent', function(req, res) {
	
	client.lrange(urlList, 0, 4, function(err,value){ 
		if(!err) {
			console.log(value);
			var urlListValue = value;
			var resText = "Recent URLs accessed:<br>";
			for (var i = 0; i<urlListValue.length; i++) {
				resText = resText + urlListValue[i] + "<br>";
			}
			res.send(resText);
		}
	});	
})


app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   //console.log(req.body) // form fields
   console.log(req.files) // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		//console.log(img);	  		
	  		client.lpush(imageQueue, img);
	  		client.ltrim(imageQueue, 0, 0);
	  		console.log("Image uploaded successfully");
		});
	}

   res.status(204).end()
}]);

app.get('/meow', function(req, res) {
	{			
		client.lrange(imageQueue, 0, 0, function(err, items){ 
			if(!err) {
				res.writeHead(200, {'content-type':'text/html'});
				items.forEach(function (imagedata)
				{
		   			res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+imagedata+"'/>");
				});
			   	res.end();
			}
		});
	}
})



