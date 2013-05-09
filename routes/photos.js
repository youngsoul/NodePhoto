var fs = require("fs");
var photoProperties = {}
photoProperties['cam1'] = "/Users/youngsoul/DevData/dir1";

var fileName = "foo.txt";
fs.exists(fileName, function(exists) {
  if (exists) {
    fs.stat(fileName, function(error, stats) {
      fs.open(fileName, "r", function(error, fd) {
        var buffer = new Buffer(stats.size);
        fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
          var data = buffer.toString("utf8", 0, buffer.length);
          console.log(data);
          fs.close(fd);
        });
      });
    });
  }
});


exports.list = function(req, res){
  getDailyPhotoSummary(req,res,'cam1');
  res.render('./photos/index', { title: 'Photos here' });
};

var getDailyPhotoSummary = function(req,res,cameraName) {

  fs.readdir(photoProperties[cameraName], function(err, files) {
    for( var i = 0; i < files.length; i++) {
      console.log("file: " + files[i]);
      var parts = files[i].split("_");
      console.log("TS: " + parts[2] + " ID: " + parts[3].split(/\./)[0]);
    }
  });
}