


/*****************
 * SELL.HTML
 * postListing used in the POST button of the sell.html page
 * 
 * sends the information from the parameters into the DB.
 * 
 * VALIDATION OF INPUT STILL NEEDS TO BE DONE
 * 
 */

function postListing() {
    let listTitle = document.getElementById("inputTitle").value;
    let listPrice = parseInt(document.getElementById("inputPrice").value);
    let listSpecies = document.getElementById("speciesID").value;
    let listFragType;
    
    let fragRadio = document.getElementsByName("frag_type");
    for (let i = 0; i < fragRadio.length; i++) {
        if(fragRadio[i].checked) {
            listFragType = fragRadio[i].value;
        }
    }
    let listCity = document.getElementById("city").value;
    let listProv = document.getElementById("province").value;
    let listDescription = document.getElementById("description").value;
    let thisUser = firebase.auth().currentUser.uid;

    let thisDate = new Date();
    let listYear = thisDate.getFullYear();
    let listMonth = thisDate.getMonth();
    let listDay = thisDate.getDate();
    let listHour = thisDate.getHours();
    let listMin = thisDate.getMinutes();
    let listMonthTranslated = translateMonth(listMonth);

    let listDate = `${listMonthTranslated} ${listDay}, ${listYear}, ${listHour}:${listMin}`;

    let thisListing = {
        user: thisUser,
        title: listTitle,
        price: listPrice,
        species: listSpecies,
        city: listCity,
        province: listProv,
        description: listDescription,
        year: listYear,
        month: listMonth,
        day: listDay,
        date: listDate,
        fragType: listFragType
    }

    
    firebase.auth().onAuthStateChanged(function (user) {
        db.collection("listing").add(thisListing)
        .then(function(docRef){
            console.log(`listing created with id ${docRef}`);
        })
        .catch(function(error){
            console.log(`error adding listing --> ${error}`);
        })
        .then(function() {
            window.location.href = "./myListings.html";
        });



        /*
        db.collection("users/").doc(user.uid)
            .onSnapshot(function (d) {
            console.log("Current data: ", d.data());

            if (d.get("total") != null)
                x = d.data()["total"];
            else
                x = 0; // user has not added any cups yet
            console.log(x);
            document.getElementById("caffeinecount").innerHTML = x; 
            }); */
    });
}

/**
 * Translates the month integer into the string
 * for that Month
 * @param {monthNumber} num 
 */
function translateMonth(num) {
    switch (num) {
        case 0:
            return "January";
            break;
        case 1:
            return "February";
            break;
        case 2:
            return "March";
            break;
        case 3:
            return "April";
            break;
        case 4:
            return "May";
            break;
        case 5:
            return "June";
            break;
        case 6:
            return "July";
            break;
        case 7:
            return "August";
            break;
        case 8:
            return "September";
            break;
        case 9:
            return "October";
            break;
        case 10:
            return "November";
            break;
        case 11:
            return "December";
            break;
        default:
            return;
            break;
    }
}

/****************************
 * myListings.HTML
 * 
 **************************/

/**
 * Pulls the Listings from the DB with the
 * user id that matches the user
 */
function getUserListings() {
    let userListings = [];

    firebase.auth().onAuthStateChanged(function (user) {
        console.log("im in function");
        db.collection("listing").where("user", "==", user.uid)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                userListings.push(doc.data());

            }); 
        }).then(function() {
            if (userListings.length == 0) {
                let noListingsMsg = document.createElement("p");
                noListingsMsg.innerHTML = "You haven't created any listings!";
                document.getElementById(card_deck).appendChild(noListingsMsg);
            } else {
                userListings.forEach((listing) => {
                    createListingCard(listing);
                })
            }

            
        })
        .catch((error) => {
            console.log(`Error getting listings: ${error}`);
        });
    });
}

/**
 * Creates the DOM elements to display the user listings
 * in the MY_LISTINGS.html page. Displays them as cards.
 * 
 * @param {} listing 
 */
function createListingCard(listing) {
    let cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    document.getElementById("card_deck").appendChild(cardDiv);

    let cardImg = document.createElement("img");
    cardImg.classList.add("card-img-top");
    cardImg.classList.add("card_img");
    cardImg.src = "../img/placeholder_coral.jpeg";
    cardDiv.appendChild(cardImg);

    let cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    cardDiv.appendChild(cardBody);

    let cardTitle = document.createElement("h4");
    cardTitle.classList.add("card-title");
    cardTitle.innerHTML = listing.title;
    cardBody.appendChild(cardTitle);

    let cardSubTitle = document.createElement("h4");
    cardSubTitle.classList.add("card-subtitle");
    cardSubTitle.classList.add("mb-2");
    cardSubTitle.classList.add("text-muted");
    cardSubTitle.innerHTML = listing.date;
    cardBody.appendChild(cardSubTitle);

    let cardParagraph = document.createElement("p");
    cardParagraph.classList.add("card-text");
    cardParagraph.innerHTML = listing.description;
    cardBody.appendChild(cardParagraph);

    let cardFooter = document.createElement("div");
    cardFooter.classList.add("card-footer");
    cardDiv.appendChild(cardFooter);

    let cardSmall = document.createElement("small");
    cardSmall.classList.add("text-muted");
    cardFooter.appendChild(cardSmall);

    let viewListingLink = document.createElement("a");
    viewListingLink.classList.add("card-link");
    viewListingLink.href = "#!";
    viewListingLink.innerHTML = "View";
    cardSmall.appendChild(viewListingLink);

    let deleteListingLink = document.createElement("a");
    deleteListingLink.classList.add("card-link");
    deleteListingLink.href = "#!";
    deleteListingLink.innerHTML = "Delete";
    cardSmall.appendChild(deleteListingLink);
}



/****************************
 * BUY.HTML
 * 
 **************************/
/*
        db.collection("users/").doc(user.uid)
            .onSnapshot(function (d) {
            console.log("Current data: ", d.data());

            if (d.get("total") != null)
                x = d.data()["total"];
            else
                x = 0; // user has not added any cups yet
            console.log(x);
            document.getElementById("caffeinecount").innerHTML = x; 
            }); */

function getListings() {
    let listings = [];
    let thisDocID;

    firebase.auth().onAuthStateChanged(function (user) {
        console.log("im in function");
        db.collection("listing")
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                
                let listingData = doc.data();
                listingData.id = doc.id;
                listings.push(listingData);
                console.log(listings);
            }); 
        }).then(function() {


            listings.forEach((listing) => {
                createListingRow(listing);
            });
        })

        .catch((error) => {
            console.log(`Error getting listings: ${error}`);
        });
    });
}



function createListingRow(listing) {
    let articleDiv = document.createElement("article");
    articleDiv.classList.add("search-result");
    articleDiv.classList.add("row");
    articleDiv.classList.add("listing_row");
    articleDiv.classList.add("py-3");
    document.getElementById("listing_container").appendChild(articleDiv);

    let imgDiv = document.createElement("div");
    imgDiv.classList.add("col-lg-3");
    articleDiv.appendChild(imgDiv);

    let imgLink = document.createElement("a");
    imgLink.href = `./listing.html?${listing.id}`

    imgDiv.appendChild(imgLink);

    let img = document.createElement("img");
    img.src = "../img/CoralA.jpg";
    img.alt = "A picture of coral";
    imgLink.appendChild(img);
    

    let listingInfoDiv = document.createElement("div");
    listingInfoDiv.classList.add("col-lg-9");
    articleDiv.appendChild(listingInfoDiv);

    let titleLink = document.createElement("a");
    titleLink.href = `./listing.html?${listing.id}`;
    listingInfoDiv.appendChild(titleLink);

    let listingTitle = document.createElement("h4");
    listingTitle.innerHTML = listing.title;
    titleLink.appendChild(listingTitle);


    let listingDate = document.createElement("p");
    listingDate.classList.add("text-muted");
    listingDate.classList.add("listing_subtext");
    listingDate.innerHTML = `Date Posted: ${listing.date}`;
    listingInfoDiv.appendChild(listingDate);

    let listingLocation = document.createElement("p");
    listingLocation.classList.add("text-muted");
    listingLocation.classList.add("listing_subtext");
    let province = listing.province;
    listingLocation.innerHTML = `Location: ${listing.city}, ${province.toUpperCase()}`;
    listingInfoDiv.appendChild(listingLocation);

    let listingDescription = document.createElement("p");
    listingDescription.innerHTML = listing.description;
    listingInfoDiv.appendChild(listingDescription);

}




/****************************
 * LISTING.HTML
 * 
 **************************/

function parseURL() {
    let queryString = decodeURIComponent(window.location.search)
    let queries = queryString.split("?");
    let userID = queries[1];
    return userID;
}

function getSpecificListing(userID) {
    firebase.auth().onAuthStateChanged(function (user) {
        console.log("im in function");
        db.collection("listing").doc(userID)
        .get()
        .then(function(doc) {
            
            let listingData = doc.data();
            let listingUserID = listingData.user;
            let contactSellerButton = document.getElementById("listing_contact_button");

            createListingPage(listingData);
            updateContactSellerButton(contactSellerButton, listingUserID);

            
        })
        .catch((error) => {
            console.log(`Error getting listings: ${error}`);
        });
    });
}

function createListingPage(listing) {
    let domInsertion = document.getElementById("listing_insertion");

    let titleContainer = document.createElement("div");
    titleContainer.classList.add("container");
    domInsertion.appendChild(titleContainer);

    let title = document.createElement("h1");
    title.innerHTML = listing.title;
    titleContainer.appendChild(title);

    let dateText = document.createElement("p");
    dateText.classList.add("text-muted");
    dateText.classList.add("listing_subtext");
    dateText.innerHTML = `Date Posted: ${listing.date}`;
    titleContainer.appendChild(dateText);

    let locationText = document.createElement("p");
    locationText.classList.add("text-muted");
    locationText.classList.add("listing_subtext")
    locationText.innerHTML = `Location: ${listing.city}, ${listing.province.toUpperCase()}`;
    titleContainer.appendChild(locationText);

    let listingTextContainer = document.createElement("div");
    listingTextContainer.classList.add("container");
    listingTextContainer.classList.add("py-3")
    domInsertion.appendChild(listingTextContainer);

    let row = document.createElement("div");
    row.classList.add("row");
    listingTextContainer.appendChild(row);

    let imgContainer = document.createElement("div");
    imgContainer.classList.add("col-md-6");
    imgContainer.classList.add("py-1");
    row.appendChild(imgContainer);

    let img = document.createElement("img");
    img.classList.add("img-fluid");
    img.src = "../img/coral.jpg";
    img.alt = "a picture of coral";
    imgContainer.appendChild(img);

    let descriptionContainer = document.createElement("div");
    descriptionContainer.classList.add("col-md-6");
    descriptionContainer.classList.add("py-1");
    row.appendChild(descriptionContainer);

    let speciesContainer = document.createElement("div");
    speciesContainer.classList.add("py-2");
    descriptionContainer.appendChild(speciesContainer);

    let speciesTitle = document.createElement("h5");
    speciesTitle.innerHTML = `Species:`;
    speciesContainer.appendChild(speciesTitle);

    let species = document.createElement("p");
    species.innerHTML = listing.species;
    speciesContainer.appendChild(species);

    let fragContainer = document.createElement("div");
    fragContainer.classList.add("py-2");
    descriptionContainer.appendChild(fragContainer);

    let fragTitle = document.createElement("h5");
    fragTitle.innerHTML = `Coral Size:`;
    fragContainer.appendChild(fragTitle);

    let frag = document.createElement("p");
    frag.innerHTML = listing.fragType;
    fragContainer.appendChild(frag);

    //awful variable name
    let userDescriptionContainer = document.createElement("div");
    userDescriptionContainer.classList.add("py-2");
    descriptionContainer.appendChild(userDescriptionContainer);

    let descriptionTitle = document.createElement("h5");
    descriptionTitle.innerHTML = `Description:`;
    userDescriptionContainer.appendChild(descriptionTitle);

    let description = document.createElement("p");
    description.innerHTML = listing.description;
    userDescriptionContainer.appendChild(description);

    let cost = document.createElement("h5");
    cost.innerHTML = `Cost: ${listing.cost}`;
}

function updateContactSellerButton(elementID, userID) {
    elementID.href = `./sendMessage.html?${userID}`;
}

