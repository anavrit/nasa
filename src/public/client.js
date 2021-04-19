const Immutable = require('immutable');
const roverName = document.getElementById('roverName');

let store = Immutable.Map({
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    mars: ''
});

// add our markup to the page
const root = document.getElementById('root')

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
        <header></header>
        <main>
            <section>
                ${mars}
            </section>
        </main>
        <footer></footer>
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

const roverHTML = (rover) => {
  return (`
      <div class='info-center'>
        <p><strong>Name:</strong> ${rover.rover.name}</p>
        <p><strong>Status:</strong> ${rover.rover.status}</p>
      </div>
      <img src='${rover.img_src}' /><br>
      <div class='info-center'>
        <p><strong>Landing Date:</strong> ${rover.rover.landing_date}</p>
        <p><strong>Launch Date:</strong> ${rover.rover.launch_date}</p>
        <p><strong>Camera:</strong> ${rover.camera.full_name}</p>
      </div>
    `)
}

const SpiritImages = (state) => {
  let { mars } = state.set()
  if (!mars) {
    mars = getRoverImages(state, 'spirit')
  }
  const rover = mars.spirit['photos'][0]
  return roverHTML(rover)
}

const OpportunityImages = (state) => {
  let { mars } = state.set()
  if (!mars) {
    mars = getRoverImages(state, 'opportunity')
  }
  const rover = mars.opportunity['photos'][0]
  return roverHTML(rover)
}

const CuriosityImages = (state) => {
  let { mars } = state.set()
  if (!mars) {
    mars = getRoverImages(state, 'curiosity')
  }
  const rover = mars.curiosity['photos'][0]
  return roverHTML(rover)
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
