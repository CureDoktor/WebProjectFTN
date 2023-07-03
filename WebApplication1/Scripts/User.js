$(document).ready(function () {
    var user_role = sessionStorage.getItem("user_type");
    if (user_role == "Customer") {
        CustomerSegment();
    }
    else if (user_role == "Seller") {
        SellerSegment();
    }
    else { AdminSegment() }
});

var orderStatus = ["Active", "Executed", "Canceled"];

function AdminSegment() {
    $('.customer-section').css("display", "none");
    $('#seller-section').css("display", "none");
    $('#admin-section').css("display", "flex");

    $.ajax({
        url: '/api/admin/GetNonAdminUsers',
        type: 'GET',
        success: function (data) {
            var users = data;
            populateUsersTable(users);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('Greška prilikom dobavljanja korisnika:', errorThrown);
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/order/ForAdmin",
        success: function (data) {
            FillOrdersForAdmin(data);
        },
        error: function () {
            alert("Failed to retrieve orders for admin.");
        }
    });

    function populateReviewTable(reviews) {
        var tableBody = $('#admin-review-table tbody');
        tableBody.empty();

        $.each(reviews, function (index, review) {
            var row = $('<tr>');
            row.append('<td>' + review.Product.Name + '</td>');
            row.append('<td>' + review.Reviewer.FirstName + ' ' + review.Reviewer.LastName + '</td>');
            row.append('<td>' + review.Title + '</td>');
            row.append('<td>' + review.Content + '</td>');
            row.append('<td>' + (review.Approved ? 'Da' : 'Ne') + '</td>');
            row.append('<td><button class="ApproveReview" data-reviewid="' + review.Id + '">Odobri</button></td>');
            row.append('<td><button class="DeclineReview" data-reviewid="' + review.Id + '">Odbij</button></td>');
            tableBody.append(row);
        });
    };
    $.ajax({
        url: '/api/review/ReturnAll',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response && response.length > 0) {
                populateReviewTable(response);
            }
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + error);
        }
    });

    $(document).on('click', '.ApproveReview', function () {
        var reviewId = $(this).data('reviewid');

        $.ajax({
            type: "GET",
            url: '/api/review/Approve/' + reviewId,
            success: function () {
                alert("Recenzija je prihvacena");
                location.reload();
            },
            error: function (data) {
                alert(data.responseJSON["Message"]);
            }
        });
    });

    $(document).on('click', '.DeclineReview', function () {
        var reviewId = $(this).data('reviewid');

        $.ajax({
            type: "GET",
            url: '/api/review/Decline/' + reviewId,
            success: function () {
                alert("Recenzija je odbijena");
                location.reload();
            },
            error: function (data) {
                alert(data.responseJSON["Message"]);
            }
        });
    });

}

function FillOrdersForAdmin(data) {
    var tableBody = $("#admin-order-table tbody");
    tableBody.empty();

    $.each(data, function (index, order) {
        var row = $("<tr></tr>");
        d = new Date(order.OrderDate);
        date = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
        row.append("<td>" + order.Id + "</td>");
        row.append("<td>" + order.Product.Name + "</td>");
        row.append("<td>" + order.Quantity + "</td>");
        row.append("<td>" + date + "</td>");
        row.append("<td>" + orderStatus[order.Status] + "</td>");

        if (orderStatus[order.Status] === "Active") {
            row.append('<td><button class="MarkOrderDelivered" data-orderid="' + order.Id + '">Označi prispeće</button></td>');
            row.append('<td><button class="CancelOrder" data-orderid="' + order.Id + '">Otkazi prispece</button></td>');
        }
        

        tableBody.append(row);
    });

    $(document).on('click', '.MarkOrderDelivered', function () {
        var orderId = $(this).data('orderid');

        $.ajax({
            type: "GET",
            url: '/api/order/CompleteOrder/' + orderId,
            success: function () {
                alert("Porudžbina je označena kao izvršena");
                location.reload();
            },
            error: function (data) {
                alert(data.responseJSON["Message"]);
            }
        });
    });

    $(document).on('click', '.CancelOrder', function () {
        var orderId = $(this).data('orderid');

        $.ajax({
            type: "GET",
            url: '/api/order/DeleteOrder/' + orderId,
            success: function () {
                alert("Porudžbina je označena kao otkazana");
                location.reload();
            },
            error: function (data) {
                alert(data.responseJSON["Message"]);
            }
        });
    });
}


function SellerSegment() {
    $('.customer-section').css("display", "none");
    $('#seller-section').css("display", "flex");
    $('#admin-section').css("display", "none");
    $.ajax({
        url: "/api/product/Seller",
        type: "GET",
        success: function (data) {
            LoadProducts(data);
        },
        error: function (error) {
            console.log(error);
        }
    });

    //https://stackoverflow.com/questions/14267781/sorting-html-table-with-javascript taken from this site
    var getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;
    var comparer = function (idx, asc) {
        return function (a, b) {
            return function (v1, v2) {
                return (v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2))
                    ? v1 - v2
                    : v1.toString().localeCompare(v2);
            }(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
        }
    };

    $(document).on('click', '#products-div th', function () {
        const th = $(this)[0];
        const table = th.closest('table');
        Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
            .forEach(tr => table.appendChild(tr));
    });

    $('#search-button').click(function () {
        var name = $('#search-name').val().toLocaleLowerCase();
        var city = $('#search-city').val().toLocaleLowerCase();

        var min = $('#search-min-price').val();
        if (min == "") { min = 0; }
        var max = $('#search-max-price').val();
        if (max == "") { max = 100000; }
        table = $('#products-table tr:not(:first)').filter(function () {
            $(this).toggle(
                ($(this.children[1]).text().toLowerCase().indexOf(name) > -1) &&
                ($(this.children[5]).text().toLowerCase().indexOf(city) > -1) &&
                ($(this.children[2]).text().slice(-4) >= min) &&
                ($(this.children[2]).text().slice(-4) <= max)
            )
        });
    });
}

function LoadProducts(products) {

    var convertedImage;
    $('#new-product-button').click(function () {
        $('#product-name1').val("");
        $('#product-title1').text("");
        $('#product-price1').val("");
        $('#product-quantity1').val("");
        $('#product-description1').val("");
        $('#product-city1').val("");
        $('#productModalAdd').css('display', 'block');

    });

    $(document).on('click', '#submitChangesAdd', function () {
        var imageElement = $('#product-image1');
        var imageFile = $('#product-image-upload1').prop('files')[0];
        var reader = new FileReader();
        var convertedImage;
        reader.onloadend = function () {
            // Konverzija slike u Base64 string
            var imageData = reader.result;
            imageElement.attr('src', imageData);

            // Konverzija Base64 stringa u format pogodan za slanje na server
            var base64Data = imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
            convertedImage = atob(base64Data);
        };

        if (imageFile) {
            reader.readAsDataURL(imageFile);
        }
        var productName = $('#product-title1').val();
        var productPrice = $('#product-price1').val();
        var productQuantity = $('#product-quantity1').val();
        var productDescription = $('#product-description1').val();
        var productCity = $('#product-city').val();
        // Ovde možete dodati logiku za slanje promena na server
        // Na primer, možete napraviti AJAX poziv za ažuriranje proizvoda
        var product = {
            Name: productName,
            Price: productPrice,
            Quantity: productQuantity,
            Description: productDescription,
            City: productCity,
            Image: convertedImage
        };

        $.ajax({
            type: 'PUT',
            url: '/api/product/AddProduct',
            data: JSON.stringify(product),
            contentType: 'application/json',
            success: function () {
                alert('Proizvod je uspešno dodat.');
            },
            error: function (error) {
                alert('Došlo je do greške pri ažuriranju proizvoda.' + error);
            }
        });

        // Zatvaranje modala
        $('#productModalAdd').css('display', 'none');
    });
    if (products.length == 0) {
        $('#products-div').html("Trenutno nema proizvoda");
    } else {
        let productsTable = '<table id="products-table" border="1px solid">';
        var user_role = sessionStorage.getItem("user_type");

        if (user_role == "Customer") {
            productsTable += '<thead><tr><th>Id</th><th>Naziv</th><th>Cena</th><th>Količina</th><th>Opis</th><th>Grad</th><th colspan="2"></th></tr></thead>';
        } else if (user_role == "Seller" || user_role == "Administrator") {
            productsTable += '<thead><tr><th>Id</th><th>Naziv</th><th>Cena</th><th>Količina</th><th>Opis</th><th>Grad</th><th colspan="1"></th></tr></thead>';
        } else {
            productsTable += '<thead><tr><th>Id</th><th>Naziv</th><th>Cena</th><th>Količina</th><th>Opis</th><th>Grad</th></tr></thead>';
        }

        productsTable += '<tbody>';

        for (product in products) {
            let temp = products[product];
            productsTable += '<tr>';
            productsTable += '<td>' + temp.Id + '</td> <td>' + temp.Name + '</td> <td>' + temp.Price + '</td> <td>' + temp.Quantity + '</td> <td>' + temp.Description + '</td> <td>' + temp.City + '</td>';

            if (user_role == "Customer") {
                productsTable += '<td><button class="AddToFavorites" id="' + temp.Id + '">Dodaj</button></td>';
            }

            if (user_role == "Customer" && temp.Quantity > 0) {
                productsTable += '<td><button class="OrderProduct" min="1" max="' + temp.Quantity + '" id="' + temp.Id + '"">Poruči</button></td>';
            }
            if (user_role == "Seller" && !temp.Deleted) {
                productsTable += '<td><button class="UpdateProduct" id="' + temp.Id + '"">Izmeni</button>';
                productsTable += '<button class="DeleteProduct" id="' + temp.Id + '"">Obrisi</button></td>';
            }

            productsTable += '</tr>';
        }

        productsTable += '</tbody></table>';
        $('#products-div').html(productsTable);

        $(document).on('click', '.UpdateProduct', function () {
            id = $(this).attr('id');
            $.ajax({
                type: "GET",
                url: '/api/product/GetProductDetails/' + id,
                success: function (product) {
                    sessionStorage.setItem("tempProductId", product.Id);
                    $('#product-title').val(product.Name);
                    $('#product-image').attr('src', product.Image);
                    $('#product-price').val(product.Price);
                    $('#product-quantity').val(product.Quantity);
                    $('#product-city').val(product.City);
                    $('#product-description').val(product.Description);
                    
                    $('#productModal').css('display', 'block');
                }
            });
        });


        $(document).on('click', '#submitChanges', function () {
            var imageElement = $('#product-image');
            var imageFile = $('#product-image-upload').prop('files')[0];
            var reader = new FileReader();
            var convertedImage;
            reader.onloadend = function () {
                var imageData = reader.result;
                imageElement.attr('src', imageData);
                
                var base64Data = imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
                convertedImage = atob(base64Data);
            };

            if (imageFile) {
                reader.readAsDataURL(imageFile);
            }
            var productName = $('#product-title').val();
            var productPrice = $('#product-price').val();
            var productQuantity = $('#product-quantity').val();
            var productCity = $('#product-city').val();
            var productDescription = $('#product-description').val();
            var product = {
                Id: sessionStorage.getItem("tempProductId"),
                Name: productName,
                Price: productPrice,
                City: productCity,
                Quantity: productQuantity,
                Description: productDescription,
                Image: convertedImage
            };

            $.ajax({
                type: 'PUT',
                url: '/api/product/UpdateProduct',
                data: JSON.stringify(product),
                contentType: 'application/json',
                success: function () {
                    alert('Proizvod je uspešno ažuriran.');
                },
                error: function (error) {
                    alert('Došlo je do greške pri ažuriranju proizvoda.' + error);
                }
            });

            // Zatvaranje modala
            $('#productModal').css('display', 'none');
        });

        $(document).on('click', '.DeleteProduct', function () {
            id = $(this).attr('id');
            $.ajax({
                type: "GET",
                url: '/api/product/DeleteProduct/' + id,
                success: function () {
                    alert("Uspesno obrisano.");
                    window.location.href = 'Index.html';
                },
                error: function (data) {
                    alert(data.responseJSON["Message"]);
                }
            });
        });

        $(document).on('click', '.OrderProduct', function () {
            var id = $(this).attr('id');
            sessionStorage.setItem("temp_prod_id", id);
            var max = $(this).attr('max');
            $('#quantityInput').attr("max", max);
            $('#quantityInput').attr("min", 1);

            $('#orderModal').css('display', 'block');
        });

        $('.close').click(function () {
            $('#orderModal').css('display', 'none');
        });

        $(window).click(function (event) {
            if (event.target.id === 'orderModal') {
                $('#orderModal').css('display', 'none');
            }
        });

        $('#confirmOrder').click(function () {
            var quantity = $('#quantityInput').val();
            var id = sessionStorage.getItem("temp_prod_id");

            var order = { "Id": id, "Quantity": quantity }

            $.ajax({

                url: '/api/order/CreateOrder',
                type: 'PUT',
                data: JSON.stringify(order),
                contentType: 'application/json; charset=utf-8',
                success: function () {
                    alert("Uspesno kreirana porudzbina.");
                    window.location.href = 'Index.html';
                },
                error: function (data) {
                    alert(data.responseJSON['Message']);
                }

            });


            $('#orderModal').css('display', 'none');
        });
    }
}

function CustomerSegment() {
    $('.customer-section').css("display", "flex");
    $('#seller-section').css("display", "none");
    $('#admin-section').css("display", "none");
    loadOrders();

    $('#toggle-orders').click(function (event) {
        event.preventDefault();
        if ($('#orders-section').css("display") == "flex") {
            $('#orders-section').css("display", "none");
        }
        else {
            $('#orders-section').css("display", "flex");
        }
    });

    $.ajax({
        type: "GET",
        url: "/api/product/getFavorite",
        success: function (data) {
            populateProductsTable(data);
        },
        error: function () {
            alert("Failed to retrieve favorite products.");
        }
    });

    $('#toggle-products').click(function (event) {
        event.preventDefault();
        if ($('#fav-products-section').css("display") == "flex") {
            $('#fav-products-section').css("display", "none");
        }
        else {
            $('#fav-products-section').css("display", "flex");
        }
    });

    $('#add-new-review').click(function (event) {
        event.preventDefault();

        var orderId = localStorage.getItem("currentOrderId");
        var comment = $('#review-title').val();
        var description = $('#review-description').val();

        var review = {
            "Id": orderId,
            "Title": comment,
            "Content": description
        };

        $.ajax({
            type: "POST",
            url: '/api/review/AddReview',
            data: review,
            success: function () {
                alert("Recenzija je uspešno dodata");
                location.reload();
            },
            error: function (xhr, status, error) {
                var errorMessage = xhr.responseText;
                alert("Greška prilikom dodavanja recenzije: " + errorMessage);
            }
        });


        $('#reviewModal').css('display', 'none');
    });
}

function loadOrders() {
    $.ajax({
        type: "GET",
        url: "/api/order/ForCurrentUser",
        success: function (data) {
            populateOrdersTable(data);
        },
        error: function () {
            alert("Failed to retrieve orders.");
        }
    });
}

function populateOrdersTable(data) {
    var tableBody = $("#order-table tbody");
    tableBody.empty();

    $.each(data, function (index, order) {
        var row = $("<tr></tr>");
        row.append("<td>" + order.Id + "</td>");
        row.append("<td>" + order.Product.Name + "</td>");
        row.append("<td>" + order.Quantity + "</td>");
        row.append("<td>" + order.OrderDate + "</td>");
        row.append("<td>" + orderStatus[order.Status] + "</td>");
        // Aktivna --> Zavrsena

        //Recenzija
        if (orderStatus[order.Status] === "Active") {
            row.append('<td><button class="MarkOrderDelivered" data-orderid="' + order.Id + '">Označi prispeće</button></td>');
        }
        if (orderStatus[order.Status] === "Executed") {
            row.append('<td><button class="LeaveReview" data-orderid="' + order.Id + '">Ostavi recenziju</button></td>');
            row.append('<td>' +
                '<button class="DeleteReview" data-reviewid="' + order.Id + '">Obriši recenziju</button>' +
                '</td>');
        }

        tableBody.append(row);
    });

    $(document).on('click', '.MarkOrderDelivered', function () {
        var orderId = $(this).data('orderid');

        $.ajax({
            type: "GET",
            url: '/api/order/CompleteOrder/' + orderId,
            success: function () {
                alert("Porudžbina je označena kao izvršena");
                loadOrders();
            },
            error: function (data) {
                alert(data.responseJSON["Message"]);
            }
        });
    });

    $(document).on('click', '.LeaveReview', function () {
        var orderId = $(this).data('orderid');
        localStorage.setItem("currentOrderId", orderId);
        $('#reviewModal').css('display', 'block');
    });

    $('.close').click(function () {
        $('#reviewModal').css('display', 'none');
    });

    $(window).click(function (event) {
        if (event.target.id === 'reviewModal') {
            $('#reviewModal').css('display', 'none');
        }
    });



    // Brisanje recenzije
    $(document).on('click', '.DeleteReview', function () {
        var reviewId = $(this).data('reviewid');

        $.ajax({
            type: "POST",
            url: '/api/review/DeleteReview/' + reviewId,
            success: function () {
                alert("Recenzija je uspešno obrisana");
                location.reload();
            },
            error: function (xhr, status, error) {
                var errorMessage = xhr.responseText;
                alert("Greška prilikom brisanja recenzije: " + errorMessage);
            }
        });
    });
}

function populateProductsTable(data) {
    var tableBody = $("#product-table tbody");
    tableBody.empty();

    $.each(data, function (index, product) {
        var row = $("<tr></tr>");
        row.append("<td>" + product.Id + "</td>");
        row.append("<td>" + product.Name + "</td>");
        row.append("<td>" + product.Price + "</td>");
        row.append("<td>" + product.Quantity + "</td>");
        row.append("<td>" + product.Description + "</td>");
        row.append("<td>" + product.City + "</td>");

        tableBody.append(row);
    });
}

function populateUsersTable(users) {
    //https://stackoverflow.com/questions/14267781/sorting-html-table-with-javascript taken from this site
    var getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;
    var comparer = function (idx, asc) {
        return function (a, b) {
            return function (v1, v2) {
                return (v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2))
                    ? v1 - v2
                    : v1.toString().localeCompare(v2);
            }(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
        }
    };

    $(document).on('click', '#users-table th', function () {
        const th = $(this)[0];
        const table = th.closest('table');
        Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
            .forEach(tr => table.appendChild(tr));
    });

    var roles = ["Kupac", "Prodavac", "Administrator"]
    var tableBody = $('#users-table tbody');
    tableBody.empty();

    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        var row = $('<tr></tr>');
        row.append($('<td></td>').text(user.Id));
        row.append($('<td></td>').text(user.FirstName));
        row.append($('<td></td>').text(user.LastName));
        row.append($('<td></td>').text(user.Username));
        row.append($('<td></td>').text(roles[user.Role]));
        tableBody.append(row);
    }

    // Event listener za dugme Pretraži
    $('#search-btnq').click( function () {
        var name = $('#search-nameq').val().toLocaleLowerCase().trim(); 
        var lastname = $('#search-lastnameq').val().toLocaleLowerCase().trim(); 
        var rolesrc = $('#search-roleq').val().toLocaleLowerCase(); 
        table = $('#users-table tr:not(:first)').filter(function () {
            $(this).toggle(
                ($(this.children[1]).text().toLowerCase().indexOf(name) > -1) &&
                ($(this.children[2]).text().toLowerCase().indexOf(lastname) > -1) &&
                ($(this.children[4]).text().toLowerCase().indexOf(rolesrc) > -1) 
                
            )
        });
    });

    
    
}