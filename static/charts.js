// d3 does not have native jsonp, so add it
d3.jsonp = function (url, callback) {
  function rand() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
      c = '', i = -1;
    while (++i < 15) c += chars.charAt(Math.floor(Math.random() * 52));
    return c;
  }

  function create(url) {
    var e = url.match(/callback=d3.jsonp.(\w+)/),
      c = e ? e[1] : rand();
    d3.jsonp[c] = function(data) {
      callback(null, data);
      delete d3.jsonp[c];
      script.remove();
    };
    return 'd3.jsonp.' + c;
  }

  var cb = create(url),
    script = d3.select('head')
    .append('script')
    .attr('type', 'text/javascript')
    .attr('src', url.replace(/(\{|%7B)callback(\}|%7D)/, cb));
};

function day (s) {
  if (!(s instanceof Date)) {
    if (!Date.parse(s))
      return null
    s = new Date(s)
  }
  return s.toISOString().substr(0, 10)
}

function totalDownloadsUrl(from, to) {
  return '/vis/index';
  /*
  return '//isaacs.iriscouch.com/downloads/_design/app/_view/day?' +
    'group_level=1' +
    '&startkey=' + encodeURIComponent(JSON.stringify([ day(from) ])) +
    '&endkey=' + encodeURIComponent(JSON.stringify([ day(to), {} ])) +
    '&callback={callback}';
  */
}

function packageDownloadsUrl(name, from, to) {
  return '/vis/package/'+name;
  /*
  return '//isaacs.iriscouch.com/downloads/_design/app/_view/pkg?' +
    'group_level=2' +
    '&startkey=' + encodeURIComponent(JSON.stringify([ name, day(from) ])) +
    '&endkey=' + encodeURIComponent(JSON.stringify([ name, day(to), {} ])) +
    '&callback={callback}';
  */
}

function downloadChart(opts) {
  // load data
  d3.json(opts.url, function(err, raw) {
    var data = [];
    if(err) {
      return;
    }

    for(var i = 0; i < raw.rows.length; i++) {
      data.push({
        date: new Date(raw.rows[i].key[opts.dateKeyIndex]),
        downloads: raw.rows[i].value
      });
    }

    data.sort(function(a, b) {
      return a.date - b.date;
    });

    render(data);
  });

  // render d3 chart
  function render(data) {
    var margin = opts.margin,
        width = opts.width - margin.left - margin.right,
        height = opts.height - margin.top - margin.bottom,
        // formatters
        bisectDate = d3.bisector(function(d) { return d.date; }).left,
        formatValue = d3.format(',.0f'),
        // axis extents
        x = d3.time.scale().range([0, width]),
        y = d3.scale.linear().range([height, 0]);

    var area = d3.svg.area()
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y(d.downloads); });

    var svg = d3.select(opts.el).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var extent = d3.extent(data, function(d) { return d.downloads; });

    // make the extent of the y axis a bit larger than the data to leave space
    // at the bottom
    extent[0] -= Math.round(extent[0] / 6);

    x.domain([data[0].date, data[data.length - 1].date]);
    y.domain(extent);

    var xdom = d3.extent(data, function(d) { return d.date });

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(
            d3.svg.axis()
              .tickValues(d3.time.weeks(xdom[0], xdom[1], 1))
              .scale(x)
              .orient('bottom'));

    if(opts.hasYAxis) {

      svg.append("g")
          .attr("class", "y axis")
          .call(
            d3.svg.axis()
              .scale(y)
              .orient('left')
          )
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end");

    }

    svg.append('path')
        .datum(data)
        .attr('class', 'area')
        .attr('d', area);

    var focus = svg.append('g')
        .attr('class', 'focus')
        .style('display', 'none');

    focus.append('circle')
        .attr('r', 4.5);

    focus.append('text')
        .attr('x', 9)
        .attr('dy', '.35em');

    svg.append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', function() { focus.style('display', null); })
        .on('mouseout', function() { focus.style('display', 'none'); })
        .on('mousemove', mousemove);

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      focus.attr('transform', 'translate(' + x(d.date) + ',' + y(d.downloads) + ')');
      focus.select('text').text(formatValue(d.downloads));
    }
  }
}
