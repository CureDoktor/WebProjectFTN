$(document).ready(function () {
    $('#loggin-button').click(function () {
        event.preventDefault();
        var roles = ["Customer", "Seller", "Administrator"]

        var user = {
            "Username": $('#txt-username').val(),
            "Password": $('#txt-password').val()
        };

        $.ajax({
            type: "POST",
            url: '/api/login/signin',
            data: user,
            success: function (data) {
                    sessionStorage.setItem("user_username", data.Username);
                    sessionStorage.setItem("user_type", roles[data.Role]);
                    window.location.href = 'Index.html'; 
            },
            error: function (data) {
                alert(data.responseJSON.Message);
            }
        });
    });

});