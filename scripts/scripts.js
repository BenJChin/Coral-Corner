
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
    const capitalizedWord = word[0].toUpperCase() + word.slice(1);
    return capitalizedWord;
}

/**
 * Translates the month integer into the string
 * for that Month. From January (0) to December (11)
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
    const queryString = decodeURIComponent(window.location.search)
    const queries = queryString.split("?");
    const userID = queries[1];
    return userID;
}

/**
 * Takes the species names from sps or lps from the
 * DB and converts into their full name as a string.
 * @param {*} polyp_data 
 */
function convertPolypData(polyp_data) {
    if (polyp_data == "lps") {
        return "Large Polyp Stony";
    }
    if (polyp_data == "sps") {
        return "Small Polyp Stony";
    }
}

/**
 * Takes the fragType data from the DB and returns it into
 * a friendly readable string.
 * @param {} fragType 
 */
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
/*****************
 * SELL.HTML
 * postListing used in the POST button of the sell.html page
 * 
 * sends the information from the parameters into the DB.
 * 
 ******************/

 /**
  * Method called when the BUTTON is pushed. PUSHES the form info
  * into database
  */
function postListing() {
    const listTitle = document.getElementById("inputTitle").value;
    const listPrice = parseInt(document.getElementById("inputPrice").value);
    const listSpecies = document.getElementById("speciesID").value;
    let listFragType;
    
    const fragRadio = document.getElementsByName("frag_type");
    for (let i = 0; i < fragRadio.length; i++) {
        if(fragRadio[i].checked) {
            listFragType = fragRadio[i].value;
        }
    }
    const listCity = document.getElementById("city").value.toLowerCase();
    const listProv = document.getElementById("province").value;
    const listDescription = document.getElementById("description").value;
    const thisUser = firebase.auth().currentUser.uid;

    const thisDate = new Date();
    const listYear = thisDate.getFullYear();
    const listMonth = thisDate.getMonth();
    const listDay = thisDate.getDate();
    const listHour = thisDate.getHours();
    const listMin = thisDate.getMinutes();
    const listMonthTranslated = translateMonth(listMonth);

    const listDate = `${listMonthTranslated} ${listDay}, ${listYear}, ${listHour}:${listMin}`;

    const thisListing = {
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

    //WRITE the listing object data into the DB
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
 * GETS all the Listings from the DB with the
 * user id that matches the user. The getUserListings function
 * is called on page load. If the listing is "Visible" then it will
 * be put onto the DOM
 */
function getUserListings() {
    let userListings = [];
    let visibleListings = [];

    //READ from DB to pull listing information
    firebase.auth().onAuthStateChanged(function (user) {
        db.collection("listing").where("user", "==", user.uid)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                const thisListingID = doc.id;
                const thisData = doc.data();
                thisData.docID = thisListingID;
                userListings.push(thisData);
                document.getElementById("load_spinner").style.display = "none";

                if (thisData.visible) {
                    visibleListings.push(thisData);
                }
            }); 
            //Checks if the listing is supposed to be visible
        }).then(function() {
            if (visibleListings.length == 0) {
                const noListingsContainer = document.createElement("div");
                noListingsContainer.classList.add("container");
                noListingsContainer.classList.add("general_container");
                noListingsContainer.classList.add("py-3");
                document.getElementById("listing_container").appendChild(noListingsContainer);
                const noListingsMsg = document.createElement("p");
                noListingsMsg.innerHTML = "You haven't created any listings!";
                noListingsContainer.appendChild(noListingsMsg);
                document.getElementById("load_spinner").style.display = "none"; 
            } else {
                userListings.forEach((listing) => {
                    if(listing.visible == true) {
                        createListingRow(listing, true);
                    }
                    
                })
            }

        })
        .catch((error) => {
            console.log(`Error getting listings: ${error}`);
        });
    });
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
    const isInMyListingsPage = false;
    
    //READ from DB to pull USERS data
    firebase.auth().onAuthStateChanged(function (user) {
        db.collection("users").doc(user.uid)
        .get()
        .then(function(doc) {
            userData = doc.data();
        })
        //Second READ from DB to pull listing data
        .then(function() {
            db.collection("listing")
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    const listingData = doc.data();
                    listingData.id = doc.id;
                    listings.push(listingData);
                }); 
            })
            .then(function() {
                
                //Populate Listings Array with Listing Data
                listings.forEach((listing) => {
                    const thisListingValues = Object.values(listing);
                    if (listing.visible == true) {
                        if(thisListingValues.includes(userData.city) || thisListingValues.includes(userData.province)) {
                            visibleListings.push(listing);
                            createListingRow(listing, isInMyListingsPage);
                            
                        }
                    }

                });
                //Create the expand search button
                const expandListingsButton = document.createElement("button");
                expandListingsButton.classList.add("btn");
                expandListingsButton.classList.add('btn-primary');
                expandListingsButton.setAttribute("id", "expand_listing_button");
                expandListingsButton.innerHTML = "Expand Listings";
                expandListingsButton.onclick = function() {
                    listings.forEach((listing) => {
                        const thisListingValues = Object.values(listing);
                        if (listing.visible == true) {
                            if(!thisListingValues.includes(userData.city) && !thisListingValues.includes(userData.province))
                            createListingRow(listing, isInMyListingsPage);
                            
                        }
                    })

                    if (document.body.contains(document.getElementById("no_listings_msg"))) {
                        document.getElementById("no_listing_msg").style.display = "none";
                    }
                    
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
                        const accountButtonContainer = document.getElementById("go_to_account_button_container");

                        const noListingsMsg = document.createElement("p");
                        noListingsMsg.innerHTML = "You don't seem to have a location set. Check your account page and set a location!";
                        noListingsMsg.setAttribute("id", "no_listing_msg");
                        document.getElementById("listing_container").insertBefore(noListingsMsg, accountButtonContainer );

                        const goToAccountButton = document.createElement("button");
                        goToAccountButton.classList.add("btn");
                        goToAccountButton.classList.add('btn-primary');
                        goToAccountButton.setAttribute("id", "go_to_account_button");
                        goToAccountButton.innerHTML = "Go to My Account";
                        goToAccountButton.onclick = function() {
                            window.location.href = "./account.html";
                        }
                        document.getElementById("go_to_account_button_container").appendChild(goToAccountButton);

                    } else {
                        const noListingsMsg = document.createElement("p");
                        noListingsMsg.innerHTML = "There don't appear to be any listings in your province. Expand search?";
                        noListingsMsg.setAttribute("id", "no_listing_msg");

                        const accountButtonContainer = document.getElementById("go_to_account_button_container");
                        document.getElementById("listing_container").insertBefore(noListingsMsg, accountButtonContainer );

                    }

                }
                
                document.getElementById("load_spinner").style.display = "none";
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
 *              the listing object
 * @param {} addUserButtons
 *              a boolean to check if we need to generate
 *              the extra buttons for the myListings.html page
 */
function createListingRow(listing, addUserButtons) {
    const articleDiv = document.createElement("article");
    articleDiv.classList.add("search-result");
    articleDiv.classList.add("row");
    articleDiv.classList.add("listing_row");
    articleDiv.classList.add("py-3");
    document.getElementById("listing_container").appendChild(articleDiv);

    const imgDiv = document.createElement("div");
    imgDiv.classList.add("col-lg-3");
    articleDiv.appendChild(imgDiv);

    const imgLink = document.createElement("a");
    imgLink.href = `./listing.html?${listing.id}`
    imgDiv.appendChild(imgLink);

    const img = document.createElement("img");
    img.src = "../img/CoralA.jpg";
    img.alt = "A picture of coral";
    imgLink.appendChild(img);
    
    const listingInfoDiv = document.createElement("div");
    listingInfoDiv.classList.add("col-lg-9");
    articleDiv.appendChild(listingInfoDiv);

    const titleLink = document.createElement("a");
    titleLink.href = `./listing.html?${listing.id}`;
    listingInfoDiv.appendChild(titleLink);

    const listingTitle = document.createElement("h4");
    listingTitle.innerHTML = listing.title;
    titleLink.appendChild(listingTitle);

    const listingDate = document.createElement("p");
    listingDate.classList.add("text-muted");
    listingDate.classList.add("listing_subtext");
    listingDate.innerHTML = `Date Posted: ${listing.date}`;
    listingInfoDiv.appendChild(listingDate);

    const listingLocation = document.createElement("p");
    listingLocation.classList.add("text-muted");
    listingLocation.classList.add("listing_subtext");
    const province = listing.province;
    listingLocation.innerHTML = `Location: ${capitalize(listing.city)}, ${province.toUpperCase()}`;
    listingInfoDiv.appendChild(listingLocation);

    const listingDescription = document.createElement("p");
    listingDescription.innerHTML = listing.description;
    listingInfoDiv.appendChild(listingDescription);

    //Checks if the buttons in myListings.html
    //should be generated
    if (addUserButtons) {
        const viewListingButton = document.createElement("button");
        viewListingButton.classList.add("btn");
        viewListingButton.classList.add("btn-primary");
        viewListingButton.classList.add("my_listings_button");
        viewListingButton.onclick = function() {
            window.location.href = `./listing.html?${listing.docID}`;
        }
        viewListingButton.innerHTML = `View Listing`;
        listingInfoDiv.appendChild(viewListingButton);

        //The DELETE listing button
        const deleteListingButton = document.createElement("button");
        deleteListingButton.classList.add("btn");
        deleteListingButton.classList.add("btn-danger");
        deleteListingButton.classList.add("my_listings_button");
        deleteListingButton.onclick = function() {
            const userConfirm = window.confirm("Are you sure you want to delete this listing?");
            if (userConfirm) {
                listing.visible = false;
                db.collection("listing").doc(listing.docID).update(listing)
                .then(function() {
                    window.alert("Listing deleted");
                })
                .then(function() {
                    location.reload();
                }).catch(function(error) {
                    console.log(`Error updating: ${error}`);
                })
            }
        }
        deleteListingButton.innerHTML = `Delete`;
        listingInfoDiv.appendChild(deleteListingButton);
    }
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
    //READ from DB for listings data
    firebase.auth().onAuthStateChanged(function (user) {
        db.collection("listing").doc(userID)
        .get()
        .then(function(doc) {
            const listingData = doc.data();
            const listingID = doc.id;
            const listingListerID = listingData.user;
            const contactSellerButton = document.getElementById("listing_contact_button");

            createListingPage(listingData);
            updateContactSellerButton(contactSellerButton, listingID, listingListerID, user.uid);
            document.getElementById("load_spinner").style.display = "none";
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
    if (listing.species == 'sps' || listing.species =='lps') {
        listing.species = convertPolypData(listing.species);
    }
    const domInsertion = document.getElementById("listing_insertion");

    const titleContainer = document.createElement("div");
    titleContainer.classList.add("container");
    domInsertion.appendChild(titleContainer);

    const title = document.createElement("h3");
    title.innerHTML = listing.title;
    titleContainer.appendChild(title);

    const dateText = document.createElement("p");
    dateText.classList.add("text-muted");
    dateText.classList.add("listing_subtext");
    dateText.innerHTML = `Date Posted: ${listing.date}`;
    titleContainer.appendChild(dateText);

    const locationText = document.createElement("p");
    locationText.classList.add("text-muted");
    locationText.classList.add("listing_subtext")
    locationText.innerHTML = `Location: ${capitalize(listing.city)}, ${listing.province.toUpperCase()}`;
    titleContainer.appendChild(locationText);

    const listingTextContainer = document.createElement("div");
    listingTextContainer.classList.add("container");
    listingTextContainer.classList.add("py-3")
    domInsertion.appendChild(listingTextContainer);

    const row = document.createElement("div");
    row.classList.add("row");
    listingTextContainer.appendChild(row);

    const imgContainer = document.createElement("div");
    imgContainer.classList.add("col-md-6");
    imgContainer.classList.add("py-1");
    row.appendChild(imgContainer);

    const img = document.createElement("img");
    img.classList.add("img-fluid");
    img.src = "../img/coral.jpg";
    img.alt = "a picture of coral";
    imgContainer.appendChild(img);

    const descriptionContainer = document.createElement("div");
    descriptionContainer.classList.add("col-md-6");
    descriptionContainer.classList.add("py-1");
    row.appendChild(descriptionContainer);

    const speciesContainer = document.createElement("div");
    speciesContainer.classList.add("py-2");
    descriptionContainer.appendChild(speciesContainer);

    const speciesTitle = document.createElement("h5");
    speciesTitle.innerHTML = `Species:`;
    speciesContainer.appendChild(speciesTitle);

    const species = document.createElement("p");
    species.innerHTML = capitalize(listing.species);
    speciesContainer.appendChild(species);

    const fragContainer = document.createElement("div");
    fragContainer.classList.add("py-2");
    descriptionContainer.appendChild(fragContainer);

    const fragTitle = document.createElement("h5");
    fragTitle.innerHTML = `Coral Size:`;
    fragContainer.appendChild(fragTitle);

    const frag = document.createElement("p");
    frag.innerHTML = convertFragData(listing.fragType);
    fragContainer.appendChild(frag);

    const userDescriptionContainer = document.createElement("div");
    userDescriptionContainer.classList.add("py-2");
    descriptionContainer.appendChild(userDescriptionContainer);

    const descriptionTitle = document.createElement("h5");
    descriptionTitle.innerHTML = `Description:`;
    userDescriptionContainer.appendChild(descriptionTitle);

    const description = document.createElement("p");
    description.innerHTML = listing.description;
    userDescriptionContainer.appendChild(description);

    const cost = document.createElement("h5");
    cost.innerHTML = `Cost: $${listing.price}`;
    userDescriptionContainer.appendChild(cost);
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
    //READ database to get the listings data that matches the user
    firebase.auth().onAuthStateChanged(function () { 
        db.collection("listing").doc(listerID)
        .get()
        .then(function(doc) {
            const listingData = doc.data();
            document.getElementById("listing_title").value = listingData.title;
            document.getElementById("load_spinner").style.display = "none";
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
    //READ database for listing data matching the lister ID
    db.collection("listing").doc(listerID)
        .get()
        .then(function(doc) {
            listingData = doc.data();
            thisListingID = doc.id;
            listingUserID = listingData.user;
        }).then(function() {
            const messageSubject = document.getElementById("message_subject").value;
            const message = document.getElementById("messageBody").value;
            const thisUser = firebase.auth().currentUser.uid;
            const thisDate = new Date();
            const listYear = thisDate.getFullYear();
            const listMonth = thisDate.getMonth();
            const listDay = thisDate.getDate();
            const listHour = thisDate.getHours();
            const listMin = thisDate.getMinutes();
            const listMonthTranslated = translateMonth(listMonth);

            const listDate = `${listMonthTranslated} ${listDay}, ${listYear}, ${listHour}:${listMin}`;

            const thisMessage = {
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
            //WRITE into database with the message object
            firebase.auth().onAuthStateChanged(function () {
                db.collection("messages").add(thisMessage)
                .then(function(docRef){
                    console.log(`listing created with id ${docRef}`);
                })
                .catch(function(error){
                    console.log(`error adding listing --> ${error}`);
                })
                .then(function() {
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
    //Query from database to get messages data that matches user ID
    firebase.auth().onAuthStateChanged(function (user) {
        db.collection("messages").where("receiver", "==", user.uid)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                const thisMessage = doc.data();
                thisMessage.docID = doc.id;
                userMessages.push(thisMessage);
                document.getElementById("load_spinner").style.display = "none"; 
            }); 
        }).then(function() {
            if (userMessages.length == 0) {
                const emptyInboxMsg = document.getElementById("inbox_insertion");
                emptyInboxMsg.innerHTML = "You have no messages!";
                document.getElementById("load_spinner").style.display = "none"; 
            } else {
                userMessages.forEach((message) => {
                    const msgSenderID = message.sender;
                    let msgSenderName;
                    const messageDocID = message.docID;

                    db.collection("users").doc(msgSenderID)
                    .get()
                    .then(function(doc) {
                        const docData = doc.data();
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
    const senderName = msgSenderName;
    const inboxMessageID = messageID;

    const tableRow = document.createElement("tr");
    document.getElementById("inbox_insertion").appendChild(tableRow);

    const sender = document.createElement("td");
    const senderLink = document.createElement("a");
    senderLink.href = `./viewMessage.html?${inboxMessageID}`;
    senderLink.innerHTML = senderName
    sender.appendChild(senderLink);
    tableRow.appendChild(sender);

    const subject = document.createElement("td");
    const subjectLink = document.createElement("a");
    subjectLink.href = `./viewMessage.html?${inboxMessageID}`;
    subjectLink.innerHTML = message.subject;
    subject.appendChild(subjectLink);
    tableRow.appendChild(subject);

    const dateSent = document.createElement("td");
    const dateLink = document.createElement("a");
    dateLink.href = `./viewMessage.html?${inboxMessageID}`;
    dateLink.innerHTML = message.date;
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
    //Database READ to get the specific message from the doc ID
    firebase.auth().onAuthStateChanged(function () {
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
            document.getElementById("load_spinner").style.display = "none";
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
    const replyButton = document.getElementById("view_message_reply_button");
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
    //READ database to get the user information to display
    firebase.auth().onAuthStateChanged(function (user) {
        db.collection("users").doc(user.uid)
        .get()
        .then(function(data) {
            const userData = data.data();
            fillAccountInfo(userData);
            document.getElementById("load_spinner").style.display = "none";
        })    
        .catch((error) => {
            console.log(`Error getting data: ${error}`);
        });
    });
}

/**
 * Fills the DOM information with the user information from database. 
 * Checks if each value has been set yet, if it hasn't, then sets it to
 * a default empty string or a message.
 * @param {user} account 
 */
function fillAccountInfo(account) {
    document.getElementById("title_user_name").innerHTML = account.name;
    document.getElementById("profile_name").innerHTML = account.name;
    document.getElementById("profile_email").innerHTML = account.email;
    if (account.description == undefined) {
        document.getElementById("profile_description").innerHTML = ``;
    } else {
        document.getElementById("profile_description").innerHTML = account.description;
    } 
    if (account.city == undefined) {
        document.getElementById("profile_city").innerHTML = "Not set yet!";
    } else {
        document.getElementById("profile_city").innerHTML = account.city;
    }

    if (account.province == undefined) {
        document.getElementById("profile_province").innerHTML = "";
    } else {
        document.getElementById("profile_province").innerHTML = `, ${account.province.toUpperCase()}`;
    } 
}

/**
 * Logout functionality tied to the button. Logs
 * user out of their account.
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
    //READ DB to get the user information of the user
    firebase.auth().onAuthStateChanged(function (user) {    
        db.collection("users").doc(user.uid)
        .get()
        .then(function(data) {
            const userData = data.data();           
            fillPlaceholderData(userData);
            document.getElementById("load_spinner").style.display = "none";
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

    const profileInfo = {
        name: editName,
        email: editEmail,
        city: editCity,
        province: editProvince,
        description: editDescription
    }

    //DB UPDATE; Update the user information with the
    //profile information object
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




