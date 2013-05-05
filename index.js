var leveljs = require('level-js')
var crunch = require('voxel-crunch')

module.exports = VoxelLevel

function VoxelLevel(game, readyCB) {
  if (!(this instanceof VoxelLevel)) return new VoxelLevel(game, readyCB)
  this.game = game
  this.db = leveljs('blocks')
  this.db.open(readyCB)
}

VoxelLevel.prototype.load = function(chunkPosition, dimensions, cb) {
  var chunkLength = dimensions[0] * dimensions[1] * dimensions[2]
  var chunkIndex = chunkPosition.join('|') + '|' + chunkLength
  this.db.get(chunkIndex, function(err, rle) {
    if (err) return cb(err)
    var voxels = new Uint32Array(chunkLength)
    crunch.decode(rle, voxels)
    cb(false, {position: chunkPosition, voxels: voxels, dimensions: dimensions})
  })
}

VoxelLevel.prototype.store = function(chunk, cb) {
  var rle = crunch.encode(chunk.voxels)
  var key = chunk.position.join('|')
  key += '|' + chunk.voxels.length
  this.db.put(key, rle, cb)
}

// crunch.decode(rle, new Uint32Array(chunk.voxels.length))