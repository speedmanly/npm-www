var request = require('request');

function day (s) {
  if (!(s instanceof Date)) {
    if (!Date.parse(s))
      return null
    s = new Date(s)
  }
  return s.toISOString().substr(0, 10)
}

exports.fetchTotalDownloads = function(req, res) {
  var month = Date.now() - (1000 * 60 * 60 * 24 * 31),
      end = new Date(),
      start = new Date(month);

  end.setDate(end.getDate() - 1);

  var params = {
    group_level: 1,
    startkey: JSON.stringify([ day(start) ]),
    endkey: JSON.stringify([ day(end), {} ])
  };

  request({
    url: 'http://isaacs.iriscouch.com/downloads/_design/app/_view/day',
    qs: params,
    json: true
  }, function(err, resp, body) {
    res.setHeader('Content-type', 'application/json');
    res.end(JSON.stringify(body));
  });
};

exports.fetchPackageDownloads = function(name, req, res) {
  var month = Date.now() - (1000 * 60 * 60 * 24 * 31) * 2,
      end = new Date(Date.now() - 1000 * 60 * 60 * 24),
      start = new Date(month);

  var params = {
    group_level: 2,
    startkey: JSON.stringify([ name, day(start) ]),
    endkey: JSON.stringify([ name, day(end) || {}])
  };

  request({
    url: 'http://isaacs.iriscouch.com/downloads/_design/app/_view/pkg',
    qs: params,
    json: true
  }, function(err, resp, body) {
    res.setHeader('Content-type', 'application/json');
    res.end(JSON.stringify(body));
  });
};
