/*
	Let's get these stars up in here
*/

$(document).ready(function () {
  $('.star').click(function () {
    var data = {}
    data.name = $(this).data('name')
    data.isStarred = $(this).hasClass('star-starred')

    $.ajax({
      url: '/star'
    , data: JSON.stringify(data)
    , type: 'POST'
    })
    .done(function (resp) {
      console.log(data, resp)

      if (data.isStarred) {
        console.log('no more yellow :-(')
        $('.star').removeClass('star-starred')
      } else {
        console.log('make it into a star!!')
        $('.star').addClass('star-starred')
      }
    })
    .error(function (resp) {
      console.log('error: ', resp)
      window.location = '/login?done=/package/' + data.name
    })
  })

})