exports.ping = function ping (req, res) {
  return res.send('OK', 200);
}

var package = require('../package.json')

exports.status = function status (req, res) {
  return res.json({
    status:   'OK',
    pid:      process.pid,
    app:      process.title,
    host:     process.env.SMF_ZONENAME,
    uptime:   process.uptime(),
    version:  package.version
  }, 200);
}
