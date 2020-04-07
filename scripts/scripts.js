


/*****************
 * SELL.HTML
 * postListing used in the POST button of the sell.html page
 * 
 * sends the information from the parameters into the DB.
 * 
 * VALIDATION OF INPUT STILL NEEDS TO BE DONE
 * 
 */

 /**
  * Method called when the BUTTON is pushed. Sends the form info
  * into database
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
        fragType: listFragType,
        visible: true
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

/**
 * The main function for this page that gets the
 * DB information for listings and then calls
 * the functions to create the DOM elements to display them
 */
function getListings() {
    let listings = [];
    let thisDocID;

    firebase.auth().onAuthStateChanged(function (user) {
        db.collection("listing")
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                let listingData = doc.data();
                listingData.id = doc.id;
                listings.push(listingData);
            }); 
        }).then(function() {


            listings.forEach((listing) => {
                if (listing.visible == true) {
                    createListingRow(listing);
                }
                
            });
        })

        .catch((error) => {
            console.log(`Error getting listings: ${error}`);
        });
    });
}


/**
 * Creates the DOM elements to show the listings on the page,
 * using the listing object (each individual listng) from the getListing method
 * @param {} listing 
 */
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
/**
 * Pulls the value after "?" in the HTML. Used to pass values
 * between pages
 */
function parseURL() {
    let queryString = decodeURIComponent(window.location.search)
    let queries = queryString.split("?");
    let userID = queries[1];
    return userID;
}
/**
 * Gets the specific listing from the DB using the listing ID in the HTML after 
 * the query string "?". 
 * @param {*} userID 
 */
function getSpecificListing(userID) {
    firebase.auth().onAuthStateChanged(function (user) {
        
        db.collection("listing").doc(userID)
        .get()
        .then(function(doc) {
            let listingData = doc.data();
            let listingID = doc.id;
            let listingListerID = listingData.user;
            let contactSellerButton = document.getElementById("listing_contact_button");

            createListingPage(listingData);
            updateContactSellerButton(contactSellerButton, listingID, listingListerID, user.uid);
        })
        .catch((error) => {
            console.log(`Error getting listings: ${error}`);
        });
    });
}
/**
 * Creates the DOM elements for the listing to display it on the page
 * @param {} listing 
 */
function createListingPage(listing) {
    let domInsertion = document.getElementById("listing_insertion");

    let titleContainer = document.createElement("div");
    titleContainer.classList.add("container");
    domInsertion.appendChild(titleContainer);

    let title = document.createElement("h3");
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
/**
 * Checks if the user browsing the page is the same user who made the listing. If 
 * true, changes the button to navigate back to myListing. Otherwise, user can
 * send message to the lister.
 * 
 * @param {the button ID} elementID 
 * @param {the ID of the listing in the DB} listingID 
 * @param {the ID of the lister in the DB} listerID 
 * @param {the current logged in user of the page} userID 
 */
function updateContactSellerButton(elementID, listingID, listerID, userID) {
    if (listerID == userID) {
        
        elementID.innerHTML = `<button type="button" class="btn btn-primary btn-lg" >My Listings</button>`;
        elementID.href = `./myListings.html`;
    } else {
        elementID.href = `./sendMessage.html?${listingID}`;
    }
}




/****************************
 * SEND MESSAGE.HTML
 * 
 **************************/

function sendMessageHandler() {
    sendMessage(parseURL());
}

function getListingData(listerID) {
    firebase.auth().onAuthStateChanged(function (user) {
        
        db.collection("listing").doc(listerID)
        .get()
        .then(function(doc) {
            let listingData = doc.data();
            //let listingUserID = listingData.user;

            document.getElementById("listing_title").value = listingData.title;
        })
        .catch((error) => {
            console.log(`Error getting listings: ${error}`);
        }); 
    });
}



function sendMessage(listerID) {
    let listingUserID;
    let listingData;
    let thisListingID;
  
    db.collection("listing").doc(listerID)
        .get()
        .then(function(doc) {
            console.log("why");
            listingData = doc.data();
            thisListingID = doc.id;
         
            listingUserID = listingData.user;
            console.log("in function: " + listingUserID);
        }).then(function() {
            let messageSubject = document.getElementById("message_subject").value;
            let message = document.getElementById("messageBody").value;
            let thisUser = firebase.auth().currentUser.uid;

            let thisDate = new Date();
            let listYear = thisDate.getFullYear();
            let listMonth = thisDate.getMonth();
            let listDay = thisDate.getDate();
            let listHour = thisDate.getHours();
            let listMin = thisDate.getMinutes();
            let listMonthTranslated = translateMonth(listMonth);

            let listDate = `${listMonthTranslated} ${listDay}, ${listYear}, ${listHour}:${listMin}`;

            let thisMessage = {
                sender: thisUser,
                receiver: listingUserID,
                subject: messageSubject,
                message: message,
                year: listYear,
                month: listMonth,
                day: listDay,
                date: listDate,
                hour: listHour,
                minute: listMin,
                listingID: thisListingID,
                listingTitle: listingData.title
            }
            firebase.auth().onAuthStateChanged(function (user) {
                db.collection("messages").add(thisMessage)
                .then(function(docRef){
                    console.log(`listing created with id ${docRef}. REMEMBER TO UPDATE THE PAGE REDIRECT`);
                })
                .catch(function(error){
                    console.log(`error adding listing --> ${error}`);
                })
                .then(function() {
                    //THIS NEEDS TO BE CHANGED TO A SENT MESSAGE .HTML
                    window.location.href = "./sentConfirmation.html";
                });
            });
        })
        .catch((error) => {
            console.log(`Error getting messages: ${error}`);
        });
}

/****************************
 * INBOX.HTML
 * 
 **************************/
function populateInbox() {
    
    let userMessages = [];
    firebase.auth().onAuthStateChanged(function (user) {
        db.collection("messages").where("receiver", "==", user.uid)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                let thisMessage = doc.data();
                thisMessage.docID = doc.id;
                userMessages.push(thisMessage);
                
            }); 
        }).then(function() {
            if (userMessages.length == 0) {
                let emptyInboxMsg = document.getElementById("inbox_insertion");
                emptyInboxMsg.innerHTML = "You have no messages!";
            } else {

                userMessages.forEach((message) => {
                    let msgSenderID = message.sender;
                    let msgSenderName;
                    let messageDocID = message.docID;

                    

                    db.collection("users").doc(msgSenderID)
                    .get()
                    .then(function(doc) {
                        let docData = doc.data();
                        msgSenderName = docData.name;
                    
                        
                        createInboxMessage(message, msgSenderName, messageDocID);

                    })
                    .catch((error) => {
                        console.log(`Error getting messages: ${error}`);
                    });


                    


                })
            }

        })
        .catch((error) => {
            console.log(`Error getting messages: ${error}`);
        });
    });
}

function createInboxMessage(message, msgSenderName, messageID) {
    let senderID = message.sender;
    let senderName = msgSenderName;
    let inboxMessageID = messageID;

    let tableRow = document.createElement("tr");
    document.getElementById("inbox_insertion").appendChild(tableRow);

    let sender = document.createElement("td");
    let senderLink = document.createElement("a");
    senderLink.href = `./viewMessage.html?${inboxMessageID}`;
    senderLink.innerHTML = senderName
    sender.appendChild(senderLink);
    tableRow.appendChild(sender);

    let subject = document.createElement("td");
    let subjectLink = document.createElement("a");
    subjectLink.href = `./viewMessage.html?${inboxMessageID}`;
    subjectLink.innerHTML = message.subject;
    subject.appendChild(subjectLink);
    tableRow.appendChild(subject);

    let dateSent = document.createElement("td");
    let dateLink = document.createElement("a");
    dateLink.href = `./viewMessage.html?${inboxMessageID}`;
    dateLink.innerHTML = message.subject;
    dateSent.appendChild(dateLink);
    tableRow.appendChild(dateSent);

}


/****************************
 * ViewMessage.HTML
 * 
 **************************/

function getMessage(messageID) {
    let messageData;
    firebase.auth().onAuthStateChanged(function (user) {
        
        db.collection("messages").doc(messageID)
        .get()
        .then(function(doc) {
            messageData = doc.data();

            
        }).then(function() {
            db.collection("users").doc(messageData.sender)
        .get()
        .then(function(user) {
            userData = user.data();
            userName = userData.name;

            document.getElementById("view_message_sender").innerHTML = userName;
            document.getElementById("view_message_subject").innerHTML = messageData.subject;
            document.getElementById("view_message_body").innerHTML = messageData.message;
            document.getElementById("view_message_listing").innerHTML = messageData.listingTitle;

            changeReplyButton(messageData.listingID);
        })
        })
        .catch((error) => {
            console.log(`Error getting listings: ${error}`);
        }); 
    });
}

function changeReplyButton(listingID) {
    let replyButton = document.getElementById("view_message_reply_button");
    replyButton.href = `./sendMessage.html?${listingID}`;
}








