const fs = require('fs');
var Promise = require('bluebird');
Promise.promisifyAll(fs);
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var id = counter.getNextUniqueId();
  items[id] = text;
  callback(null, { id, text });
};

exports.readAll = (callback) => {
  var data = [];
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      console.log('Error in read all');
    } else {
      var data = _.map(files, (file) => {
        var id = path.basename(file, '.txt');
        var filepath = path.join(exports.dataDir, file);
        return fs.readFileAsync(filepath).then((fileData) => {
          return {
            id: id,
            text: fileData.toString();
          };
        });
      });
      Promise.all(data)
        .then((items) => {
          callback(null, items);
        })
        .catch((err) => callback(err));
    }
    callback(null, data);
  });
};

exports.readOne = (id, callback) => {
  var text = null;
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      console.log('Error in readOne');
    } else {
      let foundFile = false;
      files.forEach((file, index) => {
        if (file.split('.')[0] === id) {
          foundFile = true;
          fs.readFile(`${exports.dataDir}/${file}`, (err, fileData) => {
            if (err) {
              console.log(err);
            } else {
              text = fileData.toString();
              callback(null, { id, text });
            }
          });
        }
      });
      if (!foundFile) {
        callback(new Error(`No item with id: ${id}`));
      }
    }
  });
};

exports.update = (id, text, callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      console.log('Error in readOne');
    } else {
      let foundFile = false;
      files.forEach((file, index) => {
        if (file.split('.')[0] === id) {
          foundFile = true;
          fs.writeFile(`${exports.dataDir}/${file}`, text, (err, fileData) => {
            if (err) {
              console.log(err);
            } else {
              callback(null, { id, text });
            }
          });
        }
      });
      if (!foundFile) {
        callback(new Error(`No item with id: ${id}`));
      }
    }
  });
};

exports.delete = (id, callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      console.log('Error in readOne');
    } else {
      let foundFile = false;
      files.forEach((file, index) => {
        if (file.split('.')[0] === id) {
          foundFile = true;
          fs.unlink(`${exports.dataDir}/${file}`, (err) => {
            if (err) {
              console.log('could not delete file');
            } else {
              callback();
            }
          });
        }
      });
      if (!foundFile) {
        callback(new Error(`No item with id: ${id}`));
      }
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
