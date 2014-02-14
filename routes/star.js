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
        console.error('error! ', er)
        return res.error(500, er)
      }

      data.users = data.users || {}

      if (starIt) { // user did star it once and now wants to unstar
        console.error('starring: ', data._id)
        data.users[username] = true
      } else { // user hasn't starred it yet
        console.error('unstarring: ', data._id)
        delete data.users[username]
      }

      console.error('all stars: ', data.users)
      req.couch.put(pm, data, function (er, cr, data) {
        console.error('er: ', er)
        // console.error('cr: ', cr)
        console.error('data: ', data)
        return res.send(200)
      })

    })
  })
}