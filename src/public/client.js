const Immutable = require('immutable');

let store = Immutable.Map({
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    mars: ''
});
let lastImage;
let lastRover = 'curiosity';
let roverTracker = 'curiosity';
let startIndex = 0;

// add our markup to the page
const root = document.getElementById('root')
const roverName = document.getElementById('roverName');
const expandedImg = document.getElementById('expandedImg');
const imgText = document.getElementById('imgText');
const previous = document.getElementById('previous');
const next = document.getElementById('next');

const updateStore = (store, newState) => {
    store = store.merge(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (state) => {
   const rover = state.set()
   let mars;
   switch (roverName.value) {
     case "opportunity":
      mars = OpportunityImages(rover);
      break;
     case "spirit":
      mars = SpiritImages(rover);
      break;
     default:
      mars = CuriosityImages(rover);
   }
    return `
        <main>
          ${mars}
        </main>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h3>Welcome, <strong>${name}</strong>!</h3>
            <br />
        `
    }

    return `
        <h3>Hello!</h3>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

const roverHTML = (roverArray, name) => {
  let element;
  if (lastImage == undefined || lastRover != roverArray[0].rover.name.toLowerCase()) {
    lastImage = roverArray[0]
  }
  if (lastRover != roverArray[0].rover.name) {
    lastRover = roverArray[0].rover.name.toLowerCase()
  }
  expandedImg.src = lastImage.img_src
  const thumbnails = (image, index) => {
    const imageID = 'image' + index
    element = document.getElementById(imageID)
    element.src = image.img_src
    element.addEventListener('click', function() {
      expandedImg.src = image.img_src
      lastImage = image
    })
  }
  roverArray.forEach(thumbnails)
  return (`
      <div id='imgText'>
        <p><strong>Status:</strong> ${lastImage.rover.status}</p>
        <p><strong>Camera:</strong> ${lastImage.camera.full_name}</p>
        <p><strong>Earth date:</strong> ${lastImage.earth_date}</p>
        <p><strong>Landing date:</strong> ${lastImage.rover.landing_date}</p>
        <p><strong>Launch date:</strong> ${lastImage.rover.launch_date}</p>
      </div>
    `)
}

const SpiritImages = (state) => {
  let { mars } = state.set()
  if (!mars) {
    mars = getRoverImages(state, 'spirit')
  }
  const rover = getRoverImagesSlice(mars.spirit['photos'])
  return roverHTML(rover, 'spirit')
}

const OpportunityImages = (state) => {
  let { mars } = state.set()
  if (!mars) {
    mars = getRoverImages(state, 'opportunity')
  }
  const rover = getRoverImagesSlice(mars.opportunity['photos'])
  return roverHTML(rover, 'opportunity')
}

const CuriosityImages = (state) => {
  let { mars } = state.set()
  if (!mars) {
    mars = getRoverImages(state, 'curiosity')
  }
  const rover = getRoverImagesSlice(mars.curiosity['photos'])
  return roverHTML(rover, 'curiosity')
}

const getRoverImagesSlice = (roverArray) => {
  if (lastRover != roverArray[0].rover.name.toLowerCase()) {
    startIndex = 0
  }
  let idx = startIndex
  let arraySlice = roverArray.slice(idx,idx+5)
  const nextClick = () => {
    idx += 5
    startIndex = idx
    arraySlice = arraySlice.map((item, ind) => roverArray[ind+idx])
  }
  const previousClick = () => {
    idx -= 5
    startIndex = idx
    arraySlice = arraySlice.map((item, ind) => roverArray[ind+idx])
  }
  if (roverArray[idx+5] != undefined && idx >=5) {
    next.style.display = 'block';
    previous.style.display = 'block';
    next.addEventListener('click', nextClick)
    previous.addEventListener('click', previousClick)
  } else if (roverArray[idx+5] != undefined && idx < 5) {
    next.style.display = 'block';
    previous.style.display = 'none';
    next.addEventListener('click', nextClick)
  } else if (roverArray[idx+5] == undefined && idx >= 5) {
    next.style.display = 'none';
    previous.style.display = 'block';
    previous.addEventListener('click', previousClick)
  } else {
    next.style.display = 'none';
    previous.style.display = 'none';
  }
  return arraySlice
}

// ------------------------------------------------------  API CALLS

// API call for Rover images
const getRoverImages = (state, name) => {
  let { mars } = state.toJSON()
  fetch(`http://localhost:3000/${name}`)
    .then(res => res.json())
    .then(mars => updateStore(store, { mars }))
  return mars
}

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
    return data
}
