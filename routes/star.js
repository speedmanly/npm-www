module.exports = star

function star (req, res) {
  if (req.method != 'POST') return res.error(405, 'Method not allowed')

  req.maxLength = 255

  var username = req.cookies.get('name')

  req.on('data', function (inc) {
    var body = JSON.parse(inc)

    var pm = '/registry/' + body.name
    var starIt = !body.isStarred // it wasn't starred before, so the user wants to star it

    req.couch.get(pm + '?revs=true', function (er, cr, data) {
      if (er) { // user probably isn't logged in
        // console.error('error! ', er)
        return res.error(500, er)
      }

      data.users = data.users || {}

      if (starIt) { // user did star it once and now wants to unstar
        // console.error('starring: ', data._id)
        data.users[username] = true
      } else { // user hasn't starred it yet
        // console.error('unstarring: ', data._id)
        delete data.users[username]
      }

      req.couch.put(pm, data, function (er, cr, data) {
        if (er || data.error) { 
          // this means the user's session has expired
          er = er || new Error(data.error)
          er.response = data
          er.path = req.url
          res.session.set('error', er)
          res.session.set('done', req.url)
          return res.redirect('/login')
        }

        return res.send(200)
      })

    })
  })
}