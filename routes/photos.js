var fs = require("fs");
var photoProperties = {}
photoProperties['cam1'] = "/Users/youngsoul/DevData/dir1";
var monthIndexToName = ['na', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November','December'];
var photoMap = null;

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

/*
  from bootstrap-ajax.js
 if (data.fragments) {
 for (var s in data.fragments) {
 $(s).replaceWith(data.fragments[s])
 }
 }

 */
exports.listByDay = function(req,res) {
  var dayOf = req.param('day');

  console.log("listByDay: " + dayOf);
  /*
   <div class='picture-content'>
   <p>Pictures go here</p>
   </div>
   */
  var htmlContent = "<div class='picture-content'><p>Photos from day " + dayOf + " html goes here</p></div>";
  var returnObject = {};
  var fragmentsMap = {};
  fragmentsMap['div.picture-content'] = htmlContent;
  var fragArray = [];
  fragArray.push(fragmentsMap);

  returnObject['fragments'] = fragmentsMap; //fragArray; //fragmentsMap;

  res.json(returnObject);
  //res.render('./photos/photosbyday', { title: "Photos for day: " + dayOf, day: dayOf });

};

exports.list = function(req, res){
  if( photoMap != null ) return photoMap;

  photoMap = getDailyPhotoSummary(req,res,'cam1');

  var monthYearLabels = {};

  for( var dateKey in photoMap ) {
    var dateParts = dateKey.split(/\//);
    console.log("keyList: " + dateKey + " " + dateParts[0] + ":" + dateParts[2]);
    var monthYearLabel = monthIndexToName[Number(dateParts[0])] + " " + dateParts[2];
    if( monthYearLabels[monthYearLabel] == null ) {
      monthYearLabels[monthYearLabel] = [];
    }

    var dataObj = {};
    dataObj['dateKey'] = dateKey;
    dataObj['uniqueName'] = dateParts[0] + ":" + dateParts[2];
    monthYearLabels[monthYearLabel].unshift(dataObj);
  }

  res.render('./photos/index', { title: 'Photos here', photoMap: photoMap, monthYearLabels: monthYearLabels });
};


var processFiles=function( files ) {
  var photoMap = {};

  for( var i = 0; i < files.length; i++) {
    //console.log("file: " + files[i]);
    var parts = files[i].split("_");
    var index = parts[3].split(/\./)[0];
    //console.log("TS: " + parts[2] + " Index: " + index );
    var timeStamp = parts[2];
    var year = timeStamp.substring(0,4);
    var month = timeStamp.substring(4,6);
    var day = timeStamp.substring(6,8);
    //console.log("YMD: " + year + "," + month + "," + day);
    var photoData = {};
    photoData.date = month+"/"+day+"/"+year;
    photoData.month = month;
    photoData.year = year;
    photoData.day = day;
    photoData.file = files[i];
    photoData.index = index;

    if( photoMap[photoData.date] == null ) {
      photoMap[photoData.date] = new Array();
    }
    photoMap[photoData.date].push( photoData );

  }
  console.log("PhotoMap: " + photoMap);
  // sort the photos per day by increasing index
  for( var key in photoMap ) {
    console.log("Key: " + key);
    var photosArray = photoMap[key]
    photosArray.sort(function(a,b) {
      return a.index - b.index;
    });
  }

  for( var key2 in photoMap ) {
    console.log("Key: " + key2);
    var photosArray2 = photoMap[key2]

    for( var i = 0; i < photosArray2.length; i++) {
      console.log("Photo: " + photosArray2[i].file + ":" + photosArray2[i].index);
    }
  }

  return photoMap;
};


var getDailyPhotoSummary = function(req,res,cameraName) {



  var photoMap = {};
  var files = fs.readdirSync(photoProperties[cameraName]);
  photoMap = processFiles(files);

  /*
  fs.readdir(photoProperties[cameraName], function(err, files) {
    for( var i = 0; i < files.length; i++) {
      //console.log("file: " + files[i]);
      var parts = files[i].split("_");
      var index = parts[3].split(/\./)[0];
      //console.log("TS: " + parts[2] + " Index: " + index );
      var timeStamp = parts[2];
      var year = timeStamp.substring(0,4);
      var month = timeStamp.substring(4,6);
      var day = timeStamp.substring(6,8);
      //console.log("YMD: " + year + "," + month + "," + day);
      var photoData = {};
      photoData.date = month+"/"+day+"/"+year;
      photoData.month = month;
      photoData.year = year;
      photoData.day = day;
      photoData.file = files[i];
      photoData.index = index;

      if( photoMap[photoData.date] == null ) {
        photoMap[photoData.date] = new Array();
      }
      photoMap[photoData.date].push( photoData );

    }
    console.log("PhotoMap: " + photoMap);
    // sort the photos per day by increasing index
    for( var key in photoMap ) {
      console.log("Key: " + key);
      var photosArray = photoMap[key]
      photosArray.sort(function(a,b) {
        return a.index - b.index;
      });
    }

    for( var key2 in photoMap ) {
      console.log("Key: " + key2);
      var photosArray2 = photoMap[key2]

      for( var i = 0; i < photosArray2.length; i++) {
        console.log("Photo: " + photosArray2[i].file + ":" + photosArray2[i].index);
      }
    }


  });
*/
  return photoMap;
}