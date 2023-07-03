$(document).ready(function () {
    $('#registration-button').click(function () {
        event.preventDefault();
        //alert("click");

        if ($('#txt-password').val() === $('#txt-confirm-password').val()) {

            var korisnik = {
                "Username": $('#txt-username').val(),
                "Password": $('#txt-password').val(),
                "FirstName": $('#txt-fname').val(),
                "LastName": $('#txt-lname').val(),
                "Gender": $('#gender').val(),
                "EMail": $('#txt-email').val(),
                "DateOfBirth": $('#txt-date').val()
            };
            $.ajax({
                type: "POST",
                url: '/api/registration',
                data: korisnik,
                success: function () {
                    alert("Uspesna registracija");
                    window.location.href = 'Index.html';
                },
                error: function (data) {
                    alert(data.responseJSON['Message']);
                }

            });
        } else {
            alert("Lozinke se ne poklapaju");
        }
    });
});