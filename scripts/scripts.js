


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

    let listDate = `${listMonthTranslated} ${listDay}, ${listYear} ${listHour}:${listMin}`;

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
        date: listDate
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


function getListings() {
    let listings = [];

    firebase.auth().onAuthStateChanged(function (user) {
        console.log("im in function");
        db.collection("listing").where("user", "==", user.uid)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                listings.push(doc.data());

            }); 
        }).then(function() {
            if (listings.length == 0) {
                let noListingsMsg = document.createElement("p");
                noListingsMsg.innerHTML = "You haven't created any listings!";
                document.getElementById(card_deck).appendChild(noListingsMsg);
            } else {
                listings.forEach((listing) => {
                    createListingCard(listing);
                })
            }

            
        });
    });
}

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


























