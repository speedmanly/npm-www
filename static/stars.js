/*
	Let's get these stars up in here
*/

function addExpiration () {
  var NUM_SECONDS = 60
  var d = new Date()
  d.setTime(d.getTime() + NUM_SECONDS*1000)
  return '; expires='+d.toGMTString()
}

function getPackages (name) {  
  if (document.cookie.indexOf('packages') === -1) return name ? null : {}

  var cookies = document.cookie.split('; ')
  for (var i = 0; i < cookies.length; ++i) {
    if (cookies[i].indexOf('packages') > -1)
      var packages = JSON.parse(cookies[i].split('=')[1])
      if (name) return packages[name]
      return packages
  }

  return name ? null : {}
}

$(document).ready(function () {
  // check if there's already a cookie
  var packageName = $('.star').data('name')
  
  var starType = getPackages(packageName)
  if (starType) {
    if (starType === 'star') {
      $('.star').addClass('star-starred')
    } else {
      $('.star').removeClass('star-starred')
    }
  }

  // user clicks on the star
  $('.star').click(function (e) {
    // let's turn this into a checkbox eventually...
    e.preventDefault()
    var packages = getPackages()

    var data = {}
    data.name = $(this).data('name')
    data.isStarred = $(this).hasClass('star-starred')

    $.ajax({
      url: '/star'
    , data: JSON.stringify(data)
    , type: 'POST'
    })
    .done(function (resp) {

      if (data.isStarred) {
        // console.log('no more yellow :-(')
        $('.star').removeClass('star-starred')
        packages[data.name] = 'nostar'
        document.cookie =  'packages=' + JSON.stringify(packages) + addExpiration()
      } else {
        // console.log('make it into a star!!')
        $('.star').addClass('star-starred')
        packages[data.name] = 'star'
        document.cookie =  'packages=' + JSON.stringify(packages) + addExpiration()
      }

    })
    .error(function (resp) {
      // console.log('error: ', resp)
      window.location = '/login?done=/package/' + data.name
    })
  })

})