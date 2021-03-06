var mongoose = require('mongoose');
var fs = require('fs');
var Schema = mongoose.Schema;
var Grid = require('gridfs-stream');
var db = require('./config.js');
Grid.mongo = mongoose.mongo;
var gfs = Grid(db.dbconn.db);




exports.saveInputFile = (audFilePath, transcribedData, topic, metaData, callBack) => {
  gfs.files.find({filename: topic}).toArray(function (err, files) {
    if (err) {
      throw (err);
    }
  	// console.log('inside then : ', data);

  	console.log('filesFound : ', files);
  var entryNum = 1;
  if (files.length !== 0) {
  	entryNum = files.length + 1;
  }
  var writestream = gfs.createWriteStream({
    filename: topic,
    metadata: {
    	text: transcribedData,
    	entrynumber: entryNum
    }
  });

  fs.createReadStream(audFilePath).pipe(writestream);

  writestream.on('close', function (file) {
    console.log(file.filename + ' - Written To DB');
    console.log('the file to delete: ', audFilePath);
    // this is supposed to delete the newly created file
    fs.unlink(audFilePath);
    if (callBack !== undefined) {
    	callBack(file);
    }
  });
  })
}

exports.returnAllRecords = (callBack) => {
	var records = [];
	// gfs.files.count()
	// .then((numOfRecs) => {
  gfs.files.find().toArray(function (err, files) {
    if (err) {
      throw (err);
    }
    console.log('files: ', files);
      //files is an array of objects
    for (var i = 0; i < files.length; i++) {
      records.push({filename: files[i].filename, id: files[i]._id, entrynumber: files[i].metadata.entrynumber});	
    }
    callBack(records);
	});
}

exports.getRecordByTopic = (topic, callBack) => {

  var records = [];
	gfs.files.find({filename: topic}).toArray(function (err, files) {
    if (err) {
      throw (err);
    }
    // console.log('files by topic: ', files);
    console.log('topic: ', topic);
      //files is an array of objects
    for (var i = 0; i < files.length; i++) {
      records.push({filename: files[i].filename, id: files[i]._id, entrynumber: files[i].metadata.entrynumber});	
    }
    callBack(records);
	});

}

exports.getRecordById = (id, callBack) => {
    var readstream = gfs.createReadStream({
	    _id: id
    });

    callBack(readstream);
}

exports.consoleLogAllDataBase = () => {
  gfs.files.find().toArray(function (err, files) {
    if (err) {
         throw (err);
    }
    console.log(files);
  });
}
