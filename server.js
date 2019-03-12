var crypto = require('crypto');
var http = require('http');

module.exports = WebSocket = function (options) {
  this.options = options;
  this.connect();
}

WebSocket.prototype.onopen = function () {
  // TODO
}

WebSocket.prototype.setSocket = function (socket) {
  this.socket = socket;
}

WebSocket.prototype.connect = function () {
  var that = this;
  var key = new Buffer(this.options.protocolVersion + '-' + Date.now()).toString('base64');
  var options = Object.assign({
    headers:{
    'Connection':'Upgrade',
    'Upgrade':'websocket',
    'Sec-Websocket-Key':key,
    }
  },this.options)

  var req = http.request(options);

  req.end();

  req.on('upgrade', function(res,socket,upgradeHead){
    that.setSocket(socket);
    that.onopen();
  })
}

var server = http.createServer(function(req,res){
  res.writeHead(200,{'Content-Type':'text/plain'});
  res.end('Hellow world\n');
})

server.listen(12010);

server.on('upgrade', function(req,socket,upgradeHead){
  var head = new Buffer(upgradeHead);
  upgradeHead.copy(head);
  var key = req.headers['sec-websocket-key'];
  var shasum = crypto.createHash('sha1');
  key = shasum.update(key + shasum.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64'));
  var headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    'Sec-Websocket-Accept: ' + key,
    'Sec-Websocket-Protocol: chat'
  ];

  socket.setNoDelay(true);
  socket.write(headers.concat('','').join('\r\n'));


  var websocket = new WebSocket();
  websocket.setSocket(socket)
})