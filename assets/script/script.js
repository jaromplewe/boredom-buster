// drop-down and collapsible
$(document).ready(function (event) {
    $('select').formSelect();
    $('.collapsible').collapsible();
    $('.sidenav').sidenav();

    // global DOM elements
    let activityType = document.getElementsByClassName('activityType');
    let activityCost = document.getElementsByClassName('activityCost');
    let activityParticipants = document.getElementsByClassName('activityParticipants');
    $('.collapsible').addClass('hide');

    // RETURN SELECTED VALUES FROM FORM AND CREATE URL
    // activity Type
    function type() {
        for (let i = 0; i < activityType.length; i++) {
            // console.log(activityType)
            if (activityType[0].selected == true) {
                return "";
            } else if (activityType[i].selected == true) {
                const typeVal = "?type=" + activityType[i].text.toLowerCase();
                return typeVal;
            }
        }
    }
    // activityCost
    function cost() {
        for (let i = 0; i < activityCost.length; i++) {
            if (activityCost[0].selected == true) {
                return "";
            } else if (type() == "" && activityCost[i].selected == true) {
                console.log(activityCost[i].value)
                const costVal = "?minprice=0&maxprice=" + activityCost[i].value;
                return costVal;
            } else if (activityCost[i].selected == true) {
                const costVal = "&minprice=0&maxprice=" + activityCost[i].value;
                return costVal;
            }
        }
    }
    // activityParticipants
    function participants() {
        for (let i = 0; i < activityParticipants.length; i++) {
            if (activityParticipants[0].selected == true) {
                return "";
            } else if (type() == "" && cost() == "" && activityParticipants[i].selected == true) {
                const costVal = "?participants=" + activityParticipants[i].text.toLowerCase();
                return costVal;
            } else if (activityParticipants[i].selected == true) {
                const participantsVal = '&participants=' + activityParticipants[i].text.toLowerCase();
                return participantsVal;
            }
        }
    }

    // Display activity

    //Bored-API call
    $('#searchBtn').on('click', function (event) {
        event.preventDefault();
        


        let boredQueryUrl = "https://www.boredapi.com/api/activity" + type() + cost() + participants();
        console.log(boredQueryUrl)
        $("#activityResponse").empty();
        $("#booksListDiv").empty();

        $.ajax({
            url: boredQueryUrl,
            method: "GET"
        }).then(function (activityResponse) {
            console.log(activityResponse);
            // If no activity is found, display a message
            if (activityResponse.error) {
                $("#activityResponse").text("You're not as bored as you think you are, try being less specific.");
                return;
            }
            // Display activity to page
            $("#activityResponse").text(activityResponse.activity);
            $('.collapsible').removeClass('hide');

            var activityName = activityResponse.activity
            var queryURL = "https://www.googleapis.com/books/v1/volumes?q=" + activityName;

            //Google Books API call
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (booksResponse) {
                console.log(booksResponse);

                // Display books to page
                let booksList = $("<ul>")
                // booksList.addClass("collapsible");

                let relatedBookInfo = $("<li>");

                let relatedBooksList = $("<div>")
                // relatedBooksList.addClass("collapsible-body");

                $("#booksListDiv").append(booksList); // <ul>
                booksList.append(relatedBookInfo); // <li>
                relatedBookInfo.append(relatedBooksList); // <div class="collapsible-body">



                for (let i = 0; i < 5; i++) {
                    // create collapsible-header div
                    let relatedBooks = $("<div>");
                    // relatedBooks.addClass("collapsible-header");
                    relatedBooks.attr("tabindex", "0");
                    relatedBooks.text("Related books:");

                    // add text to collapsible-header
                    let relatedBooksText = $("<h4>")
                    relatedBooksText.text(booksResponse.items[i].volumeInfo.title);

                    // append collapsible-header to relatedBookInfo
                    relatedBookInfo.append(relatedBooksText);

                    // append book info to collapsible
                    // author name
                    let authorTag = $("<p>");
                    authorTag.text("Author: " + booksResponse.items[i].volumeInfo.authors);
                    relatedBookInfo.append(authorTag);

                    // description
                    let descriptionTag = $("<p>");
                    descriptionTag.text("Description: " + booksResponse.items[i].volumeInfo.description);
                    relatedBookInfo.append(descriptionTag);
                    descriptionTag.addClass('show-read-more');
                    let buyLinkTab = $("<a>");

                    // link
                    buyLinkTab.attr("href", booksResponse.items[i].volumeInfo.infoLink);
                    buyLinkTab.text("Buy Book Link");
                    buyLinkTab.attr("target", "blank")
                    relatedBookInfo.append(buyLinkTab);
                }

                // show "read more" function for book description
                var maxLength = 300;
                    $(".show-read-more").each(function(i){
                        var descriptionText = "Description: " + booksResponse.items[i].volumeInfo.description;
                        if($.trim(descriptionText).length > maxLength){
                            var shortDescriptionText = descriptionText.substring(0, maxLength);
                            var removedStr = descriptionText.substring(maxLength, $.trim(descriptionText).length);
                            $(this).empty().html(shortDescriptionText);
                            $(this).append(' <a href="javascript:void(0);" class="read-more">read more...</a>');
                            $(this).append('<span class="more-text">' + removedStr + '</span>');
                        }
                    });
                    $(".read-more").click(function(){
                        $(this).siblings(".more-text").contents().unwrap();
                        $(this).remove();
                    });

            }).catch(function (error) {
                console.log(error);
            })

        }).catch(function (error) {
            console.log(error);
        })

    })

    // to-do button adds activity to local storage
    $('#todoBtn').on('click', function(event) {
        event.preventDefault();

        // Added toast to main page
        console.log($('#activityResponse'))
        if ($('#activityResponse')[0].textContent === "") {
            M.toast({html: 'No activity to add'});
            return;
        } else {
            M.toast({html: 'Added!'});
            let activityName = $("#activityResponse")[0].innerText;
            let activityList = JSON.parse(localStorage.getItem('activityList'));
            if (activityList) {
                activityList.unshift(activityName);
            } else {
                activityList = [];
                activityList.unshift(activityName);
            }
            localStorage.setItem('activityList', JSON.stringify(activityList));
            console.log(activityList)
            
        }
    })
});

