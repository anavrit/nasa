const Immutable = require('immutable');

// Declaring the Immutable store to hold image data
let store = Immutable.Map({
    rover: 'curiosity',
    curiosity: '',
    spirit: '',
    opportunity: '',
    startIndex: 0
});

// Adding html elements to page
const root = document.getElementById('root')
const roverName = document.getElementById('roverName');
const expandedImg = document.getElementById('expandedImg');
const imgText = document.getElementById('imgText');
const previous = document.getElementById('previous');
const next = document.getElementById('next');
const imageID = ['image0', 'image1', 'image2', 'image3', 'image4']
const thumbnails = imageID.map(id => document.getElementById(id))
const tn = 5

// Updating the store object
const updateStore = (store, newState) => {
    store = store.merge(newState)
    render(root, store)
}

// Rendering the app page
const render = async (root, state) => {
  try {
    root.innerHTML = App(state)
  } catch (err) {
    console.log('error:', err)
  }
}

// Creating content for the app page
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

// Reacting to changes in the selected rover
roverName.onchange = () => {
  const newRover = roverName.value
  const stateOnChange = store.set('rover', newRover).set('startIndex', 0)
  updateStore(store, stateOnChange)
}

// Rendering the next five images when available
const nextClick = () => {
  const newStartIndex = store.get('startIndex') + tn
  const newState = store.set('startIndex', newStartIndex)
  updateStore(store, newState)
}

// Rendering the previous five images when available
const previousClick = () => {
  const newStartIndex = store.get('startIndex') - tn
  const newState = store.set('startIndex', newStartIndex)
  updateStore(store, newState)
}

// Adding event listeners to the buttons
next.addEventListener('click', nextClick)
previous.addEventListener('click', previousClick)

// Generating the HTML for the app page using the updated state
const roverHTML = (roverArraySlice) => {
  const roverImages = roverArraySlice.map(item => item.img_src)
  const displayImages = (image, index) => {
    thumbnails[index].src = image
    thumbnails[index].addEventListener('click', function() {
      expandedImg.src = image
      expandedImage = roverArraySlice[index]
    })
  }
  let expandedImage = roverArraySlice[0]
  expandedImg.src = roverArraySlice[0].img_src
  thumbnails.forEach(thumbnail => thumbnail.src = "")
  roverImages.forEach(displayImages)
  return (lengthOfArray) => {
    return (`
      <div id='imgText'>
        <p><strong>Status:</strong> ${expandedImage.rover.status}</p>
        <p><strong>Camera:</strong> ${expandedImage.camera.full_name}</p>
        <p><strong>Date of latest photos:</strong> ${expandedImage.earth_date}</p>
        <p><strong>Number of photos:</strong> ${lengthOfArray}</p>
        <p><strong>Landing date:</strong> ${expandedImage.rover.landing_date}</p>
        <p><strong>Launch date:</strong> ${expandedImage.rover.launch_date}</p>
      </div>
        `)
    }
}

// Updating the state if needed and requesting revised HTML
const MarsImages = (state) => {
  const rover = state.get('rover')
  const marsRover = state.get(rover)
  if (marsRover==='') {
    getRoverImages(state)
  }
  const lengthOfArray = marsRover.latest_photos.length
  const roverArraySlice = getRoverImagesSlice(state)
  const getExpandedImage = roverHTML(roverArraySlice)
  showOrHideButtons(state)
  return getExpandedImage(lengthOfArray)
}

// Generating slices of five images from the full set of images
const getRoverImagesSlice = (state) => {
  const rover = state.get('rover')
  const idx = state.get('startIndex')
  const roverArray = state.get(rover).latest_photos
  const arraySlice = roverArray.slice(idx,idx+5)
  return arraySlice
}

// Showing or hiding buttons to help the user navigate through the images
const showOrHideButtons = (state) => {
  const idx = state.get('startIndex')
  const rover = state.get('rover')
  const roverArray = state.getIn([rover, 'latest_photos'])
  if (roverArray[idx+tn] != undefined && idx >=tn) {
    next.style.display = 'block';
    previous.style.display = 'block';
  } else if (roverArray[idx+tn] != undefined && idx < tn) {
    next.style.display = 'block';
    previous.style.display = 'none';
  } else if (roverArray[idx+tn] == undefined && idx >= tn) {
    next.style.display = 'none';
    previous.style.display = 'block';
  } else {
    next.style.display = 'none';
    previous.style.display = 'none';
  }
}

// API call for rover images
const getRoverImages = (state) => {
  const rover = state.get('rover')
  let roverPhotos = state.get(rover)
  try {
    fetch(`http://localhost:3000/${rover}`)
         .then(res => res.json())
         .then(roverPhotos => updateStore(store, roverPhotos))
  } catch (err) {
    console.log('error:', err)
  }
}
