module.exports = csplog

function csplog (req, res) {
  console.warn('csplog method: ', req.method)
  if (req.method !== 'POST') { return res.error(404) }

  req.on('body', function (data) {
    try {
      data = JSON.parse(data)      
    } catch (ex) {
      data = {msg: data}
    }
    req.log.warn(data, 'content-security-policy validation')
  })
}