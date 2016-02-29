var rle = require('../shared/rle');
var engine = require('voxel-engine');

module.exports = {
  init: function(socket) {
    var self = this;
    this.connect(socket);
    return new Promise(function(resolve, reject) {
      self.onReady = resolve;
    });
  },
  connect: function(socket) {
    var self = this;
    socket.on('disconnect', function() {
      // TODO handle disconnection
    });
    this.socket = socket;
    this.bindEvents(socket);
  },
  bindEvents: function(socket) {
    var self = this;

    var processChunk = function(chunk) {
      var voxels = rle.decode(chunk.voxels);
      chunk.voxels = voxels;
      self.engine.showChunk(chunk);
    };

    socket.on('settings', function(settings) {
      settings.generateChunks = false;
      self.engine = self.createEngine(settings);
      socket.emit('created');
      socket.on('chunk', processChunk);
      socket.on('noMoreChunks', function() {
        self.engine.voxels.on('missingChunk', function(chunkPosition) {
          socket.emit('requestChunk', chunkPosition, processChunk);
        });

        self.onReady();
      });
    });

    socket.on('set', function(pos, val) {
      self.engine.setBlock(pos, val);
    });
  },
  createEngine: function(settings) {
    var self = this;
    var socket = this.socket;
    settings.controlsDisabled = false;
    self.engine = engine(settings);
    self.engine.settings = settings;

    return self.engine;
  }
};
