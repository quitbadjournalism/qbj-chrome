function escapeRegExpString (input) {
  return input.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
}

function getAjax (options) {
  var oReq = new XMLHttpRequest()
  options = options || {}

  // Load
  oReq.addEventListener('load', function () {
    if (options.load && typeof options.load === 'function') {
      var data = JSON.parse(oReq.responseText)
      options.load(data, oReq)
    }
  })

  // Error
  oReq.addEventListener('error', function () {
    if (options.error && typeof options.error === 'function') {
      options.error(oReq.responseText, oReq)
    }
  })

  // Open + send
  oReq.open(options.method || 'GET', options.url)
  oReq.send()

  return oReq
}

var currentLocation = window.location

// User bad sites
var options = {
  badSites: [],
  enableGIFs: true
}
chrome.storage.sync.get({
  badSites: [],
  enableGIFs: true
}, function(items) {
  var getBadSites = []

  // Ensure they're regexps
  if (items.badSites && items.badSites instanceof Array) {
    for (var i = 0; i < items.badSites.length; i++) {
      getBadSites.push(new RegExp(escapeRegExpString(items.badSites[i]), 'i'))
    }
  }

  // Set the options
  options.badSites = getBadSites
  options.enableGIFs = items.enableGIFs
})

// Always blocked!
var badSites = {
  breitbart: [
    /breitbart(\.co|m)?(\.(au|us|uk))?/i
  ],
  dailymail: [
    /dailym\.ai/i,
    /dailymail(\.co|m)?(\.(au|us|uk|ie))?/i,
    /mailonsunday(\.co|m)?(\.(au|us|uk))?/i,
    /mymail\.co\.uk/i
  ],
  thesun: [
    /thesun(\.co|m)?(\.(au|us|uk|ie))?/i,
    /thescottishsun\.co\.uk/i
  ],
  user: badSites
}

var customBadSites

function blockBadSite (loc, url, img) {
  document.write('<div style="text-align: center">' +
    '<h1>Hi there!</h1>' +
    '<h2 style="font-weight:normal"><pre><code>' + loc + '</code></pre></h2>' +
    '<h2 style="font-weight:normal">was blocked by <strong>Quit Bad Journalism</strong> &mdash; <em>You\'re welcome!</em></h2>' +
    '<p><a href="https://github.com/qbj/qbj-chrome" target="_blank">Why?</a></p>' +
    (img || '') +
    '<marquee style="margin-top: 100px; margin-bottom: 100px"><a href=\"' + url + '\">Let me in &mdash; I\'m aware of the dangers to my mental health that continuing to this website will expose me to.</a></marquee>' +
    '</div>')
}

if (!/_qbj_allow_/i.test(currentLocation)) {
  var allowThroughURL

  // Already has query vars
  if (/\?/.test(currentLocation)) {
    allowThroughURL = currentLocation + '&amp;_qbj_allow_=1'
  } else {
    allowThroughURL = currentLocation + '?_qbj_allow_=1'
  }

  for (var i in badSites) {
    if (badSites.hasOwnProperty(i)) {
      for (var j = 0; j < badSites[i].length; j++) {
        if (badSites[i][j].test(currentLocation)) {
          // Get a GIF!
          if (options.enableGIFs) {
            getAjax({
              url: 'http://api.giphy.com/v1/gifs/search?q=dance&limit=20&rating=g&api_key=dc6zaTOxFJmzC',
              load: function (data, xhr) {
                var img = ''

                // Got a random GIF
                if (data.hasOwnProperty('data')) {
                  var getRandomGIF = data.data[Math.floor(Math.random() * data.data.length)]

                  if (getRandomGIF) {
                    img = '<a href="' + getRandomGIF.url + '" target="_blank"><img src="' + getRandomGIF.images.original.url + '" alt="" /></a>' +
                      '<p>GIFs provided by <a href="http://giphy.com" target="_blank">GIPHY</a></p>'
                  }
                }

                blockBadSite(currentLocation, allowThroughURL, img)
              },
              error: function (data, xhr) {
                blockBadSite(currentLocation, allowThroughURL)
              }
            })
          } else {
            blockBadSite(currentLocation, allowThroughURL)
          }
          
          break
        }
      }
    }
  }
}
