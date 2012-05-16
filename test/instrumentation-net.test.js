var should  = require('should')
  , path    = require('path')
  , net     = require('net')
  , helper  = require(path.join(__dirname, 'lib', 'agent_helper'))
  ;

describe("agent instrumentation of the net module", function () {
  var agent
    , server
    , RESPONSE = 'WHANGADANG\n'
    , PORT     = 9876
    ;

  beforeEach(function (done) {
    agent = helper.loadMockedAgent();

    server = net.createServer(function (conn) {
      conn.write(RESPONSE);
      conn.pipe(conn);
    });

    server.listen(PORT, 'localhost', function () { return done(); });
  });

  afterEach(function (done) {
    server.on('close', function () {
      helper.unloadAgent(agent);

      return done();
    });

    server.close();
  });

  it("should have noticed the application port", function (done) {
    var client = net.connect(PORT, 'localhost');

    client.on('data', function (data) {
      data.toString().should.equal(RESPONSE);
      client.end();
    });

    client.on('end', function () {
      should.exist(agent.applicationPort, 'agent.applicationPort not set');
      agent.applicationPort.should.equal(PORT);

      return done();
    });
  });
});