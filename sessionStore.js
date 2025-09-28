// sessionStore.js - Solução alternativa para sessões
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const sessionFileStore = (session) => {
  return class FileStore extends session.Store {
    constructor(options = {}) {
      super(options);
      this.path = options.path || './sessions';
      if (!fs.existsSync(this.path)) {
        fs.mkdirSync(this.path, { recursive: true });
      }
    }

    get(sid, callback) {
      const filePath = path.join(this.path, `${sid}.json`);
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return callback(null, null);
        try {
          const sessionData = JSON.parse(data);
          callback(null, sessionData);
        } catch {
          callback(null, null);
        }
      });
    }

    set(sid, sessionData, callback) {
      const filePath = path.join(this.path, `${sid}.json`);
      fs.writeFile(filePath, JSON.stringify(sessionData), callback);
    }

    destroy(sid, callback) {
      const filePath = path.join(this.path, `${sid}.json`);
      fs.unlink(filePath, callback);
    }
  };
};

module.exports = sessionFileStore;