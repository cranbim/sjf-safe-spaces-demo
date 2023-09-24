//has search.js run yet?
console.log("search script running yellow")

//Toby's Sheety API
const api ="https://api.sheety.co/fc5c71f9022f71a533593458b68c355b/communityAndChildren'sSpacesAndServicesMappingForPrototypeUse/sheet1";
//Dave's Sheety API
// const api ="https://api.sheety.co/a60dc9d9904d04eaacc75a9fb033bdee/communityAndChildrensSpacesAndServicesMapping/sheet1"

const dataSearchTemp = document.querySelector("[data-search-temp]")
const dataCardsCont = document.querySelector("[data-cards-cont]")
const dataSearch = document.querySelector("[data-search]")

// space is this list of spaces
let space = []

//markers is the map markers
let markers = [];


//every time the user makes a change in the search bart this code will log that change
dataSearch.addEventListener("input", (e) => {
    //to lower case stops the search from being case sensitive
    const val = e.target.value.toLowerCase()
  
      space.forEach(camp => {
   //does the search include any letters in the venueNames or addresss of the spaces
        const isVis = camp.venueName.toLowerCase().includes(val) || camp.address.toLowerCase().includes(val)
  
            //if it does not contain the letter remove from the list
            camp.element.classList.toggle("hide", !isVis)
          
       
    })

    //map icons
    markers.forEach(marker => {
      const camp = space.find(camp => marker.getLatLng().equals([parseFloat(camp.latitude), parseFloat(camp.longitude)]));
    
        const isVisa = camp.venueName.toLowerCase().includes(val) || camp.address.toLowerCase().includes(val)
        // marker.removeLayer("[map-marker]", !isVisa);
        if(isVisa){
          mymap.addLayer(marker);
        } else {
          mymap.removeLayer(marker);
        }
    });
})


// Create an array to store active filter values
let activeFilters = [];


//Add an event listener to all fliter inputs
// On click update active status and then use this to filter
document.querySelectorAll('.filter-input').forEach((input) => {
  input.addEventListener('click', function () {
    const VALA = this.getAttribute('data-value');
    console.log(VALA);
 
    
    // Toggle the active state of the filter
    const isActive = activeFilters.includes(VALA);
    if (isActive) {
    
      const index = activeFilters.indexOf(VALA);
      if (index !== -1) {
        activeFilters.splice(index, 1);
      }
    } else {

      activeFilters.push(VALA);
    }
    console.log(activeFilters);
    // cards
    space.forEach(camp => {
      //returns filters from the active filters array.
      const isVisa = activeFilters.length==0 || activeFilters.some(filter => {
        return camp.age.toString().includes(filter) || camp.accessibilityFeatures.includes(filter) || camp.facilities.includes(filter);
      });
      camp.element.classList.toggle("hide", !isVisa);
    });

    // markers
    markers.forEach(marker => {
      const camp = space.find(camp => marker.getLatLng().equals([parseFloat(camp.latitude), parseFloat(camp.longitude)]));
      const isVisa = activeFilters.length==0 || activeFilters.some(filter => {
        return camp.age.toString().includes(filter) || camp.accessibilityFeatures.includes(filter) || camp.facilities.includes(filter);
      });
      if (isVisa) {
        mymap.addLayer(marker);
      } else {
        mymap.removeLayer(marker);
      }
    });
  });
});

     

// on load fetch the data from sheety and build the 'space' list of cards
  fetch(api)
  .then(res => res.json())
  .then(data => {
    space = data.sheet1.map(camp => {
      const card = dataSearchTemp.content.cloneNode(true).children[0]
      const header = card.querySelector("[data-header]")
      const body = card.querySelector("[data-body]")
      header.textContent = camp.venueName
      body.textContent = camp.address
      const innerOne  =  card.querySelector("[data-season]")
      innerOne.textContent = camp.seasonal;
      const innerTwo =  card.querySelector("[data-facilities]")
      innerTwo.textContent = camp.facilities;
      const innerThree  =  card.querySelector("[data-accessibility]")
      innerThree.textContent = camp.parking;
      dataCardsCont.append(card)
     

      const latitude = parseFloat(camp.latitude);
      const longitude = parseFloat(camp.longitude);

      // Skip if data is invalid
      if (isNaN(latitude) || isNaN(longitude)) {
        console.log("Invalid latitude or longitude:", camp);
        return null; 
      }

      const accessibilityFeatures = camp.accessibilityFeatures || [];
      const facilities = camp.facilities || [];
      const age = camp.ageGroups || [];

      return {
        venueName: camp.venueName,
        address: camp.address,
        element: card,
        accessibilityFeatures: accessibilityFeatures,
        facilities: facilities,
        age: age,
        latitude: latitude,  
        longitude: longitude
      };
    });
  })


  // code from HTML
  // This is all to do with setting up the map

  function changeBackgroundColor(element) {
    if (element.style.backgroundColor === "" || element.style.backgroundColor === "white") {
      element.style.backgroundColor = "#6d6d6d";
    } else {
      element.style.backgroundColor = "white";
    }
  }






       // Making a map and tiles
       const mymap = L.map("issMap").setView([51.35420, -2.45917], 11);
      const attribution =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      const tiles = L.tileLayer(tileUrl, { attribution });
      tiles.addTo(mymap);

      
      const scale = devicePixelRatio > 1.5 ? "@2x" : "";
      const keyerer = 'uGY0k3LEVIsN1HUIhJkj';
      L.tileLayer(
        `https://api.maptiler.com/maps/streets/{z}/{x}/{y}${scale}.png?key=${keyerer}`,
        {
          tileSize: 512,
          zoomOffset: -1,
          minZoom: 1,
          attribution:
            '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a>, ' +
            '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
          crossOrigin: true,
        }
      ).addTo(mymap);


      L.control.maptilerGeocoding({ 
        apiKey: keyerer,
      placeholder: "search",
      collapsed: true,
      }).addTo(mymap);
     
      


      // Making a marker with a custom icon.
      const issIcon = L.icon({
        iconUrl: "Marker.png",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor:  [0, -20]
      });

      const api_url = "https://api.sheety.co/fc5c71f9022f71a533593458b68c355b/communityAndChildren'sSpacesAndServicesMappingForPrototypeUse/sheet1";

      async function getISS() {
        const response = await fetch(api_url);
        const data = await response.json();

        const places = data.sheet1.slice(1, 37); 

        places.forEach((place) => {
  const marker = L.marker(
    [parseFloat(place.latitude), parseFloat(place.longitude)],
    { icon: issIcon }
  ).addTo(mymap);

  marker.on('mouseover', function(ev) {
    console.log(place.venueName)
    marker.openPopup();
  });

  marker.bindPopup(place.venueName);
  

  marker.getElement().classList.add("map-marker");

  markers.push(marker);
});
   
  
       
      }

      getISS();
 