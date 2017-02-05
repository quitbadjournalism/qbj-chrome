var elemAddBadSite = document.querySelector('#add-bad-site')
var elemBadSites = document.querySelector('#bad-sites')
var elemBadSiteTemplate = document.querySelector('#templates .bad-site')
var elemEnableGIFs = document.querySelector('#enable-gifs')

// Add bad site to the options
function addBadSite (value) {
  var elemNewBadSite = elemBadSiteTemplate.cloneNode(true)
  elemNewBadSite.querySelector('input[type="text"]').value = value || ''
  elemNewBadSite.addEventListener('click', eventBadSiteClick)
  elemBadSites.appendChild(elemNewBadSite)
}

// Click bad site
function eventBadSiteClick (event) {
  // Remove
  if (event.target.className.match('remove-bad-site')) {
    elemBadSites.removeChild(this)
  }
}

// Create new bad site
elemAddBadSite.addEventListener('click', function (event) {
  addBadSite()
})

// Saves options to chrome.storage.sync
function saveOptions() {
  // Get the options
  var elemBadSitesItems = elemBadSites.querySelectorAll('.bad-site input[type="text"]')
  var badSites = []

  // Get the user-defined bad sites
  for (var i = 0; i < elemBadSitesItems.length; i++) {
    var badSiteValue = elemBadSitesItems[i].value
    badSites.push(badSiteValue)
  }

  // Enable GIFs
  var enableGIFs = elemEnableGIFs.checked || false

  // @debug
  // console.log('save_options', badSites)

  // Save options
  chrome.storage.sync.set({
    badSites,
    enableGIFs
  }, function () {
    // Update status to let user know options were saved.
    var status = document.getElementById('status')
    status.textContent = 'Options saved.'
    setTimeout(function() {
      status.textContent = ''
    }, 1000)
  })
}

// Restore options from chrome.storage.sync
function restoreOptions() {
  chrome.storage.sync.get({
    badSites: [],
    enableGIFs: true
  }, function(items) {
    // Show the options
    for (var i = 0; i < items.badSites.length; i++) {
      addBadSite(items.badSites[i])
    }

    // Uncheck enable GIFs
    if (items.enableGIFs) {
      elemEnableGIFs.checked = true
    } else {
      elemEnableGIFs.checked = false
    }
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.getElementById('save').addEventListener('click', saveOptions)