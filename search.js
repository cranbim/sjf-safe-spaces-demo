//has search.js run yet?
console.log("search script running")

const api ="https://api.sheety.co/fc5c71f9022f71a533593458b68c355b/communityAndChildren'sSpacesAndServicesMappingForPrototypeUse/sheet1";

const dataSearchTemp = document.querySelector("[data-search-temp]")
const dataCardsCont = document.querySelector("[data-cards-cont]")
const dataSearch = document.querySelector("[data-search]")

let space = []

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
      const isVisa = activeFilters.some(filter => {
        return camp.age.toString().includes(filter) || camp.accessibilityFeatures.includes(filter) || camp.facilities.includes(filter);
      });
      camp.element.classList.toggle("hide", !isVisa);
    });

    // markers
    markers.forEach(marker => {
      const camp = space.find(camp => marker.getLatLng().equals([parseFloat(camp.latitude), parseFloat(camp.longitude)]));
      const isVisa = activeFilters.some(filter => {
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
      const age = camp.age || [];

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
 