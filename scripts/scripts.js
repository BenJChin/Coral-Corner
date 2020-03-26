


/*****************
 * postListing used in the POST button of the sell.html page
 * 
 * sends the information from the parameters into the DB.
 * 
 * VALIDATION OF INPUT STILL NEEDS TO BE DONE
 */

function postListing() {
    let listTitle = document.getElementById("inputTitle").value;
    let listPrice = parseInt(document.getElementById("inputprice").value);
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
    let thisUser = firebase.auth().currentUser.uid;

    console.log(`listing: ${listTitle}, price: ${listPrice},
    species: ${listSpecies}, fragType: ${listFragType}, city: ${listCity},
    prov: ${listProv}`);

    let thisListing = {
        user: thisUser,
        title: listTitle,
        price: listPrice,
        species: listSpecies,
        city: listCity,
        province: listProv
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

            /*
            if (d.get("total") != null)
                x = d.data()["total"];
            else
                x = 0; // user has not added any cups yet

            
            console.log(x);
            document.getElementById("caffeinecount").innerHTML = x; 
            }); */
    });
}



























