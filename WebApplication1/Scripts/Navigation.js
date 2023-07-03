$(document).ready(function () {

    var roles = ["Customer", "Seller", "Administrator"]
    var user = sessionStorage.getItem("user_username");
    if (user == null) {
        $.ajax({
            url: '/api/login',
            method: 'GET',
            success: function (data) {
                if (Object.keys(data).length === 0) {
                    Unregistered();
                } else {
                    sessionStorage.setItem("user_username", data.Username);
                    sessionStorage.setItem("user_type", roles[data.Role]);
                    if (data.Role == 0) { Customer(); }
                    else if (data.Role == 1) { Seller(); }
                    else { Administrator(); }
                }
            },
            error: function () {
                Unregistered();
            }
        });
    } else {
        var user_role = sessionStorage.getItem("user_type");
        if (user_role == "Customer") { Customer(); }
        else if (user_role == "Seller") { Seller(); }
        else if (user_role == "Administrator") { Administrator(); }
        else { Unregistered(); }
    }


    $('#nav-index').click(function () {
        window.location.href = "Index.html";
    });

    $('#nav-user').click(function () {
        window.location.href = "User.html";
    });

    $('#nav-registration').click(function () {
        window.location.href = "Registration.html";
    });

    $('#nav-login').click(function () {
        window.location.href = "Login.html";
    });

    $('#nav-profile').click(function () {
        window.location.href = "Profile.html";
    });

    $('#nav-sign_out').click(function () {
        $.ajax({
            type: "GET",
            url: '/api/login/signout',
            success: function (data) {
                alert("Uspesno odjavljeni");
                Unregistered();
                sessionStorage.clear();
                window.location.href = "Index.html";
            },
            error: function (data) {
                alert(data);
            }
        });

    });
});

function Unregistered() {
    $("#nav-index").show();
    $("#nav-user").hide();

    $("#nav-registration").show();
    $("#nav-login").show();
    $("#nav-sign_out").hide();

}
function Customer() {
    $("#nav-index").show();
    $("#nav-user").show();

    $("#nav-registration").hide();
    $("#nav-login").hide();
    $("#nav-sign_out").show();
}
function Seller() {
    $("#nav-index").show();
    $("#nav-user").show();

    $("#nav-registration").hide();
    $("#nav-login").hide();
    $("#nav-sign_out").show();
}
function Administrator() {
    $("#nav-index").show();
    $("#nav-user").show();

    $("#nav-registration").hide();
    $("#nav-login").hide();
    $("#nav-sign_out").show();
}