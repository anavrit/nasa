const Immutable = require('immutable');
const { merge } = require('immutable')

let store = Immutable.Map({
    rover: 'curiosity',
    curiosity: '',
    spirit: '',
    opportunity: '',
    startIndex: 0
});

let manifest = {
  curiosity: '',
  spirit: '',
  opportunity: ''
};

// add our markup to the page
const root = document.getElementById('root')
const roverName = document.getElementById('roverName');
const expandedImg = document.getElementById('expandedImg');
const imgText = document.getElementById('imgText');
const previous = document.getElementById('previous');
const next = document.getElementById('next');

const updateManifest = (manifest, roverManifest, rover) => {
    manifest[rover] = roverManifest[rover]
    render(root, store)
}

const updateStore = (store, newState) => {
    store = store.merge(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (state) => {
    const newState = state.set('rover', roverName.value)
    store = store.merge(newState)
    return `
        <main>
          ${MarsImages(newState)}
        </main>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

roverName.onchange = () => {
  const newRover = roverName.value
  const stateOnChange = store.set('rover', newRover).set('startIndex', 0)
  updateStore(store, stateOnChange)
}

const nextClick = () => {
  const newStartIndex = store.get('startIndex') + 5
  const newState = store.set('startIndex', newStartIndex)
  updateStore(store, newState)
}

const previousClick = () => {
  const newStartIndex = store.get('startIndex') - 5
  const newState = store.set('startIndex', newStartIndex)
  updateStore(store, newState)
}

next.addEventListener('click', nextClick)
previous.addEventListener('click', previousClick)

const roverHTML = (state, roverArraySlice) => {
  let element;
  const rover = state.get('rover')
  const roverPhotos = state.get(rover)
  let expandedImage = roverArraySlice[0]
  const manifestInfo = manifest[rover]['photo_manifest']
  expandedImg.src = roverArraySlice[0].img_src
  const displayImages = (image, index) => {
    const imageID = 'image' + index
    element = document.getElementById(imageID)
    element.src = image
    element.addEventListener('click', function() {
      expandedImg.src = image
      expandedImage = roverArraySlice[index]
    })
  }
  const roverImages = roverArraySlice.map(item => item.img_src)
  roverImages.forEach(displayImages)
  showOrHideButtons(state)
  return (`
      <div id='imgText'>
        <p><strong>Status:</strong> ${expandedImage.rover.status}</p>
        <p><strong>Camera:</strong> ${expandedImage.camera.full_name}</p>
        <p><strong>Date of latest photos:</strong> ${manifestInfo.max_date}</p>
        <p><strong>Date of displayed photos:</strong> ${expandedImage.earth_date}</p>
        <p><strong>Number of photos:</strong> ${roverPhotos.photos.length}</p>
        <p><strong>Landing date:</strong> ${expandedImage.rover.landing_date}</p>
        <p><strong>Launch date:</strong> ${expandedImage.rover.launch_date}</p>
      </div>
    `)
}

const MarsImages = (state) => {
  let rover = state.get('rover')
  let marsRover = state.get(rover)
  let roverManifest = manifest[rover]
  if (roverManifest==='') {
    getRoverManifest(rover)
  }
  if (marsRover==='') {
    getRoverImages(state)
  }
  const roverArraySlice = getRoverImagesSlice(state)
  return roverHTML(state, roverArraySlice)
}

const getRoverImagesSlice = (state) => {
  const rover = state.get('rover')
  const roverArray = state.get(rover).photos
  const idx = state.get('startIndex')
  let arraySlice = roverArray.slice(idx,idx+5)
  return arraySlice
}

const showOrHideButtons = (state) => {
  const idx = state.get('startIndex')
  const rover = state.get('rover')
  const roverArray = state.getIn([rover, 'photos'])
  if (roverArray[idx+5] != undefined && idx >=5) {
    next.style.display = 'block';
    previous.style.display = 'block';
  } else if (roverArray[idx+5] != undefined && idx < 5) {
    next.style.display = 'block';
    previous.style.display = 'none';
  } else if (roverArray[idx+5] == undefined && idx >= 5) {
    next.style.display = 'none';
    previous.style.display = 'block';
  } else {
    next.style.display = 'none';
    previous.style.display = 'none';
  }
}

// API call for Rover images
const getRoverImages = (state) => {
  let rover = state.get('rover')
  let roverPhotos = state.get(rover)
  fetch(`http://localhost:3000/${rover}`)
    .then(res => res.json())
    .then(roverPhotos => updateStore(store, roverPhotos))
}

const getRoverManifest = (rover) => {
  let roverManifest = manifest[rover]
  fetch(`http://localhost:3000/manifest/${rover}`)
    .then(res => res.json())
    .then(roverManifest => updateManifest(manifest, roverManifest, rover))
}
