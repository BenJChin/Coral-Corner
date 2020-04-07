
/****************************
 * HELPER METHODS THAT ARE USEFUL BETWEEN ALL PAGES
 * 
 **************************/
/**
 * Capitalizes the first letter of the word. Useful for
 * displaying CITY strings from DB, since it's saved as all lower case
 * @param {string} word 
 */
function capitalize(word) {
    let capitalizedWord = word[0].toUpperCase() + word.slice(1);
    return capitalizedWord;
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

/**
 * Pulls the value after "?" in the HTML. Used to pass values
 * between pages. Only returns the first value.
 */
function parseURL() {
    let queryString = decodeURIComponent(window.location.search)
    let queries = queryString.split("?");
    let userID = queries[1];
    return userID;
}

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
    let listCity = document.getElementById("city").value.toLowerCase();
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



/****************************
 * 
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
                let thisListingID = doc.id;
                let thisData = doc.data();
                thisData.docID = thisListingID;
                userListings.push(thisData);

            }); 
        }).then(function() {
            if (userListings.length == 0) {
                let noListingsMsg = document.createElement("p");
                noListingsMsg.innerHTML = "You haven't created any listings!";
                document.getElementById("card_deck").appendChild(noListingsMsg);
            } else {
                userListings.forEach((listing) => {
                    if(listing.visible == true) {
                        createListingCard(listing);
                    }
                    
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
    viewListingLink.href = `./listing.html?${listing.docID}`;
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
    let userData;
    let visibleListings = [];
    
    firebase.auth().onAuthStateChanged(function (user) {
        db.collection("users").doc(user.uid)
        .get()
        .then(function(doc) {
            userData = doc.data();
        })
        .then(function() {
            db.collection("listing")
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    let listingData = doc.data();
                    listingData.id = doc.id;
                    listings.push(listingData);
                }); 
            })
            .then(function() {

                //Populate Listings Array with Listing Data
                listings.forEach((listing) => {
                    let thisListingValues = Object.values(listing);

                    
                    console.log(userData.city)
                    console.log(thisListingValues.includes(userData.city));

                    if (listing.visible == true) {
                        if(thisListingValues.includes(userData.city) || thisListingValues.includes(userData.province)) {
                            visibleListings.push(listing);
                            createListingRow(listing);
                        }
                    }

                });

                //Create the expand search button
                let expandListingsButton = document.createElement("button");
                expandListingsButton.classList.add("btn");
                expandListingsButton.classList.add('btn-primary');
                expandListingsButton.setAttribute("id", "expand_listing_button");
                expandListingsButton.innerHTML = "Expand Listings";
                expandListingsButton.onclick = function() {
                    listings.forEach((listing) => {
                        if (listing.visible == true) {
                            createListingRow(listing);
                        }
                    })

                    document.getElementById("no_listing_msg").style.display = "none";
                    expandListingsButton.style.display = "none";

                }
                document.getElementById("expand_listings_container").appendChild(expandListingsButton);

                /**
                 * Checks if user has not set CITY or PROVINCE location data yet. If they have
                 * and there are still no visible listings, then give option to expand listings to
                 * all provinces / cities
                 */
                if (visibleListings.length == 0) {
                    if (userData.city == undefined || userData.province == undefined) {
                        let accountButtonContainer = document.getElementById("go_to_account_button_container");

                        let noListingsMsg = document.createElement("p");
                        noListingsMsg.innerHTML = "You don't seem to have a location set. Check your account page and set a location!";
                        noListingsMsg.setAttribute("id", "no_listing_msg");
                        document.getElementById("listing_container").insertBefore(noListingsMsg, accountButtonContainer );

                        let goToAccountButton = document.createElement("button");
                        goToAccountButton.classList.add("btn");
                        goToAccountButton.classList.add('btn-primary');
                        goToAccountButton.setAttribute("id", "go_to_account_button");
                        goToAccountButton.innerHTML = "Go to My Account";
                        goToAccountButton.onclick = function() {
                            window.location.href = "./account.html";
                        }
                        document.getElementById("go_to_account_button_container").appendChild(goToAccountButton);

                    } else {
                        let noListingsMsg = document.createElement("p");
                        noListingsMsg.innerHTML = "There don't appear to be any listings in your province. Expand search?";
                        noListingsMsg.setAttribute("id", "no_listing_msg");

                        let accountButtonContainer = document.getElementById("go_to_account_button_container");
                        document.getElementById("listing_container").insertBefore(noListingsMsg, accountButtonContainer );

                    }

                }  
            })
            .catch((error) => {
                console.log(`Error getting listings: ${error}`);
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
    listingLocation.innerHTML = `Location: ${capitalize(listing.city)}, ${province.toUpperCase()}`;
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
    locationText.innerHTML = `Location: ${capitalize(listing.city)}, ${listing.province.toUpperCase()}`;
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
    species.innerHTML = capitalize(listing.species);
    speciesContainer.appendChild(species);

    let fragContainer = document.createElement("div");
    fragContainer.classList.add("py-2");
    descriptionContainer.appendChild(fragContainer);

    let fragTitle = document.createElement("h5");
    fragTitle.innerHTML = `Coral Size:`;
    fragContainer.appendChild(fragTitle);

    let frag = document.createElement("p");
    frag.innerHTML = convertFragData(listing.fragType);
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

function convertFragData(fragType) {
    switch (fragType) {
        case "frag_size":
            return "Fragment";
            break;
        case "reg_size":
            return "Full coral size";
            break;
        default:
            return "Unspecified";
    }
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
/**
 * Function called on page load of sendMessage.html to retrieve the
 * message.
 */
function sendMessageHandler() {
    sendMessage(parseURL());
}

/**
 * Gets the listing data from the original listing. Populates
 * the listing_title element with that data. Currently doesn't
 * do anything else with the listing data.
 * @param {OBJ} listerID 
 *          the listing document ID pulled from the URL when
 *          it was passed on from listings page
 */
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

/**
 * Grabs the form data from the message page and sends
 * it to the DB. 
 * @param {OBJ} listerID 
 *          the listing document ID from the URL ? section
 */

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
/**
 * Queries DB for messages that have the same "receiver" id as the
 * currently logged in user id and calls createInboxMessage to populate the DOM with them.
 */
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

/**
 * Creates the indivdual message DOM elements in the list from the
 * data pulled from DB.
 * 
 * @param {*} message 
 *              the message object from DB
 * @param {*} msgSenderName 
 *              the string plaintext name of the sender
 * @param {*} messageID 
 *              the message doc id
 */
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
/**
 * Queries the DB for the specific message (message doc ID that's passed on from
 * the previous page) and populates the DOM with that message
 * @param {*} messageID 
 */
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

/**
 * Edits the reply button to include the listing ID and sends
 * user to the sendMessage page with that data.
 * MAYBE MAYBE SEND MESSAGE INFO TOO
 * @param {} listingID 
 */
function changeReplyButton(listingID) {
    let replyButton = document.getElementById("view_message_reply_button");
    replyButton.href = `./sendMessage.html?${listingID}`;
}


/****************************
 * Account.HTML
 * 
 **************************/

 /**
  * Calls the DB to get the user info. Then calls
  * the fillAccountInfo function to populate the DOM
  */
function getAccountInfo() {
    firebase.auth().onAuthStateChanged(function (user) {
        
        db.collection("users").doc(user.uid)
        .get()
        .then(function(data) {
            let userData = data.data();
            fillAccountInfo(userData);
        })
        
        .catch((error) => {
            console.log(`Error getting data: ${error}`);
        });
    });
}

/**
 * Fills the DOM information with the user information from database
 * @param {user} account 
 */
function fillAccountInfo(account) {
    document.getElementById("title_user_name").innerHTML = account.name;
    document.getElementById("profile_name").innerHTML = account.name;
    document.getElementById("profile_email").innerHTML = account.email;
    document.getElementById("profile_description").innerHTML = account.description;
    document.getElementById("profile_city").innerHTML = account.city;
    document.getElementById("profile_province").innerHTML = account.province.toUpperCase();
}

/**
 * Logout functionality tied to the button
 */
function logout() {
    firebase.auth().signOut()
    .then(function() {
        console.log("Signout successful");
        window.location.href = "../index.html";
      })
    .catch(function(error) {
        console.log(`Error: ${error}`);
    });
}

/****************************
 * editProfile.HTML
 * 
 **************************/
/**
 * Initial call to the database to get the user info.
 * Sets that userinfo as the default data if it exists, so user
 * doesn't have to type as much when updating.
 */
function editProfileGetAccountInfo() {
    firebase.auth().onAuthStateChanged(function (user) {
        
        db.collection("users").doc(user.uid)
        .get()
        .then(function(data) {
            let userData = data.data();
            fillPlaceholderData(userData);
        })
        
        .catch((error) => {
            console.log(`Error getting data: ${error}`);
        });
    });
}

/**
 * Fills the form with information from the user account if it exists
 * @param {user} account 
 */
function fillPlaceholderData(account) {
    document.getElementById("edit_name").value = account.name;
    document.getElementById("edit_email").value = account.email;
    document.getElementById("edit_city").value = account.city;
    document.getElementById("edit_province").value = account.province;
    document.getElementById("edit_profile_description").value = account.description;

}

/**
 * The function called when the edit button is submitted. Takes
 * the form info and updates USER info in DB
 */
function editProfileButtonHandler() {
    let editName = document.getElementById("edit_name").value;
    let editEmail = document.getElementById("edit_email").value;
    let editCity = document.getElementById("edit_city").value;
    let editProvince = document.getElementById("edit_province").value;
    let editDescription = document.getElementById("edit_profile_description").value;

    let profileInfo = {
        name: editName,
        email: editEmail,
        city: editCity,
        province: editProvince,
        description: editDescription
    }

    firebase.auth().onAuthStateChanged(function (user) {
        db.collection("users").doc(user.uid).update(profileInfo)
        .then(function(){
            console.log(`profile updated!`);
        })
        .catch(function(error){
            console.log(`error updating: ${error}`);
        })
        .then(function() {
            window.location.href = "./account.html";
        });
    });
}




