$(document).ready(function () {

    $.ajax({
        url: "/api/product",
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
});

function LoadProducts(products) {
    if (products.length == 0) {
        $('#products-div').html("Trenutno nema proizvoda");
    } else {
        let productsTable = '<table id="products-table" border="1px solid">';
        var user_role = sessionStorage.getItem("user_type");

        if (user_role == "Customer") {
            productsTable += '<thead><tr><th>Id</th><th>Naziv</th><th>Cena</th><th>Količina</th><th>Opis</th><th>Grad</th><th colspan="2"></th> </tr></thead>';
        } else if (user_role == "Seller" || user_role == "Administrator") {
            productsTable += '<thead><tr><th>Id</th><th>Naziv</th><th>Cena</th><th>Količina</th><th>Opis</th><th>Grad</th></tr></thead>';
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

            productsTable += '</tr>';
        }

        productsTable += '</tbody></table>';
        $('#products-div').html(productsTable);

        $(document).on('click', '.AddToFavorites', function () {
            id = $(this).attr('id');
            var requestData = { "Id": id };
            $.ajax({
                type: "POST",
                url: '/api/product/AddToFavourite',
                data: requestData,
                success: function () {
                    alert("Uspesno dodato");
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

            var order = { "Id": id, "Quantity": quantity}

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
