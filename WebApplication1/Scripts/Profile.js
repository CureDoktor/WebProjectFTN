$(document).ready(function () {
    $.ajax({
        type: "GET",
        url: '/api/registration/CompleteUser',
        success: function (data) {
            sessionStorage.setItem("user_id", data.Id);
            FillData(data);
        }

    });
    $('#toggle-profile').click(function (event) {
        event.preventDefault();
        if ($('#profile-section').css("display") == "flex") {
            $('#profile-section').css("display", "none");
        }
        else {
            $('#profile-section').css("display", "flex");
        }
    });

    $('#profile-save-button').click(function (event) {
        event.preventDefault();
        var korisnik = {
            "Id": sessionStorage.getItem("user_id"),
            "Username": $('#txt-username').val(),
            "Password": $('#txt-password').val(),
            "FirstName": $('#txt-fname').val(),
            "LastName": $('#txt-lname').val(),
            "Gender": $('#gender').val(),
            "EMail": $('#txt-email').val(),
            "DateOfBirth": $('#txt-date').val()
        };

        $.ajax({
            url: '/api/registration/update',
            type: 'PUT',
            data: JSON.stringify(korisnik),
            contentType: 'application/json; charset=utf-8',
            success: function () {
                alert("Uspesno sacuvano");
                window.location.href = 'Index.html';
            },
            error: function (data) {
                alert(data.responseJSON['Message']);
            }
        });
    });
});

function FillData(data) {
    $('#txt-username').val(data.Username);
    $('#txt-fname').val(data.FirstName);
    $('#txt-lname').val(data.LastName);
    $('#txt-email').val(data.Email);
    $('#gender').val(data.Gender);
}
