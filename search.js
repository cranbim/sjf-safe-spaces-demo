//has search.js run yet?
console.log("search script running")

//Calls the safe spaces data.
const api ="https://api.sheety.co/fc5c71f9022f71a533593458b68c355b/communityAndChildrensSpacesAndServicesMapping/sheet1";

//Interact with the html elements.
const dataSearchTemp = document.querySelector("[data-search-temp]")
const dataCardsCont = document.querySelector("[data-cards-cont]")
const dataSearch = document.querySelector("[data-search]")



let space = []
let markers = [];


//every time the user makes a change in the search bar this code will log that change
dataSearch.addEventListener("input", (e) => {
    //to lower case stops the search from being case sensitive
    const val = e.target.value.toLowerCase()
  
      space.forEach(camp => {
   //does the search include any letters in the venueNames or addresss of the spaces
        const isVis = camp.venueName.toLowerCase().includes(val) || camp.address.toLowerCase().includes(val)
  
            //if it does not contain the letter remove from the list
            camp.element.classList.toggle("hide", !isVis)
          
       
    })

    // same code for the map icons
    markers.forEach(marker => {
      const camp = space.find(camp => marker.getLatLng().equals([parseFloat(camp.latitude), parseFloat(camp.longitude)]));
    
        const isVisa = camp.venueName.toLowerCase().includes(val) || camp.address.toLowerCase().includes(val)
        if(isVisa){
          mymap.addLayer(marker);
        } else {
          mymap.removeLayer(marker);
        }
    });
})



// Create an array to store active filter values.
let activeFilters = [];




//This is activated when the remove filters button is pressed.
function removeAllFilters() {
  //clears the activeFilters array.
  activeFilters = [];
  console.log(activeFilters);
  //resets the background colour of the filters.
  resetBackgroundColor();
  //removes the hide filter stopping any markers or cards from showing.
  space.forEach(camp => {
    camp.element.classList.remove("hide");
  });


  markers.forEach(marker => {
    mymap.addLayer(marker);
  });

}

//activates the removeFiltersButton onClick
document.getElementById("removeFiltersButton").addEventListener("click", removeAllFilters);




document.querySelectorAll('.filter-input').forEach((input) => {
  input.addEventListener('click', function () {

   
 //checks the data value of the colter clicked 
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
      //eliminates the cards that do not have the attributes in that column of the table that are contained in the activeFilters array.
      const isVisa = activeFilters.every(filter => {
        return camp.ageGroups.toString().includes(filter) || camp.accessibilityFeatures.includes(filter) || camp.facilities.includes(filter);
      });
      camp.element.classList.toggle("hide", !isVisa);
    });

    // markers
    markers.forEach(marker => {
//eliminates the map markers that do not have the attributes in that column of the table that are contained in the activeFilters array.
      const camp = space.find(camp => marker.getLatLng().equals([parseFloat(camp.latitude), parseFloat(camp.longitude)]));
      const isVisa = activeFilters.every(filter => {
        return camp.ageGroups.toString().includes(filter) || camp.accessibilityFeatures.includes(filter) || camp.facilities.includes(filter);
      });
      if (isVisa) {
        mymap.addLayer(marker);
      } else {
        mymap.removeLayer(marker);
      }
    });
    //runs a function that shows all the cards and map icons on the map if the array is cleared meaning there are no active filters.
    if (activeFilters.length === 0) {
      removeAllFilters();
      console.log("run success");
    }
  });

});


function populateFurtherInfo(event){
  //not working on child elements
  // let fiHandle=document.querySelector("#further-info-contents");
  // console.log(fiHandle)
  // fiHandle.textContent='';
  // console.log(fiHandle)

  let dataIndex=""
  if(!event.target.dataset.spaceindex){
    
  } else {
    dataIndex=event.target.dataset.spaceindex;
    // console.log(space[dataIndex].displayInfo);
    let fiName=document.querySelector("#further-info-name");
    fiName.innerText=space[dataIndex].venueName;
    let fiAddress=document.querySelector("#further-info-address");
    fiAddress.innerHTML=`<span>address: </span>${space[dataIndex].address}`;
    let fiHandle=document.querySelector("#further-info-contents");
    fiHandle.textContent='';
    space[dataIndex].displayInfo.forEach(info=>{
      let p=document.createElement('p');
      p.innerHTML=`<span>${info.title}: </span> ${info.content}`
      fiHandle.appendChild(p)
    })
  }
  
  console.log(dataIndex)
}

  fetch(api)
  .then(res => res.json())
  .then(data => {
    space = data.sheet1.map((camp,i) => {
      console.log("card: "+i);
      const card = dataSearchTemp.content.cloneNode(true).children[0]
      const header = card.querySelector("[data-header]")
      const body = card.querySelector("[data-body]")
      card.dataset.spaceindex = i
      header.textContent = camp.venueName
      body.textContent = camp.address

      //variables to diplay the extra info for the extra info container.
      const innerOne  =  card.querySelector("[data-Info1]")
      innerOne.textContent = camp.displayInfo1;
      dataCardsCont.append(card)
      const innerTwo  =  card.querySelector("[data-Info2]")
      innerTwo.textContent = camp.displayInfo2;
      // dataCardsCont.append(card)
      const innerThree  =  card.querySelector("[data-Info3]")
      innerThree.textContent = camp.displayInfo3;
      // dataCardsCont.append(card)
      const innerFour  =  card.querySelector("[data-Info4]")
      innerFour.textContent = camp.displayInfo4;
      // dataCardsCont.append(card)
     card.addEventListener("click", populateFurtherInfo);

     //lat and long for the markers.
      const latitude = parseFloat(camp.latitude);
      const longitude = parseFloat(camp.longitude);

      // Skip if data is invalid
      if (isNaN(latitude) || isNaN(longitude)) {
        console.log("Invalid latitude or longitude:", camp);
        return null; 
      }

      const accessibilityFeatures = camp.accessibilityFeatures || [];
      const facilities = camp.facilities || [];
      const ageGroups = camp.ageGroups || [];

      return {
        venueName: camp.venueName,
        address: camp.address,
        element: card,
        accessibilityFeatures: accessibilityFeatures,
        facilities: facilities,
        ageGroups: ageGroups,
        latitude: latitude,  
        longitude: longitude,
        displayInfo: [
          {title:'email', content:camp.email},
          {title:'open times', content:camp.openingTimes},
          {title:'facilities', content:camp.facilities},
          {title:'age groups', content:camp.ageGroups},
          {title:'accessibility', content:camp.accessibilityFeatures},
        ]
      };
    });
    // console.log(dataCardsCont)
  })
 