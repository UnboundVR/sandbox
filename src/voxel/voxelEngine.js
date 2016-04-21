import createEngine from 'voxel-engine';
import extend from 'extend';

var engine;
var settings;

function getId(pos) {
  return pos.join('|');
}

function generateWorld(x, y) {
  return y === 1 ? 1 : 0;
}

module.exports = {
  init() {
    settings = {
      generateChunks: true,
      generate: generateWorld,
      chunkDistance: 2,
      worldOrigin: [0, 0, 0]
    };

    engine = createEngine(settings);
  },
  getSettings() {
    return settings;
  },
  getInitialChunks() {
    let initialPositions = [];
    for(var i = -1; i < 1; i++) {
      for(var j = -1; j < 1; j++) {
        for(var k = -1; k < 1; k++) {
          initialPositions.push([i,j,k]);
        }
      }
    }
    return initialPositions.map(this.getChunk);
  },
  getChunk(chunkPos) {
    // Convert from the dictionary-based array to a true array (this assumes the keys in the dict are ordered, which seems to be the case)
    let chunk = extend({}, engine.voxels.chunks[getId(chunkPos)]);
    chunk.voxels = Object.values(chunk.voxels);
    return chunk;
  },
  getAllChunks() {
    let chunks = [];
    for (let chunk in engine.voxels.chunks) {
      let position = engine.voxels.chunks[chunk].position;
      chunks.push(this.getChunk(position));
    }

    return chunks;
  },
  setBlock(pos, val) {
    engine.setBlock(pos, val);
  },
  chunkAtPosition(pos) {
    return engine.voxels.chunkAtPosition(pos);
  },
  ensureChunkExists(chunkPos) {
    let chunkId = getId(chunkPos);
    if(!engine.voxels.chunks[chunkId]) {
      engine.pendingChunks.push(chunkId);
      engine.loadPendingChunks(engine.pendingChunks.length);
    }
  },
  setChunk(chunkPos, chunk) {
    // Convert to the format that voxel-engine internally uses to represent chunks (i.e. a dictionary where the keys are the number of the position)
    let voxels = chunk.voxels;
    chunk.voxels = {};
    for(let i = 0; i < voxels.length; i++) {
      chunk.voxels[i] = voxels[i];
    }

    engine.voxels.chunks[getId(chunkPos)] = chunk;
  }
};
