window.onload = function () {

    var email = document.getElementById("email")
    var password = document.getElementById("pwd");
    var form = document.getElementById("LoginForm");

    form.onsubmit = function (e) {
        alert("form submitted")
        e.preventDefault();
        console.log("hash is", $("#LoginForm").serialize())
        $.ajax({
            url: '/login',
            type: 'POST',
            data: { username: email.value, password: hash }
        }).done(response => {
            if (!response) {
                alert("Invalid emailId or password");
            } else {
                window.location = '/home';
            }
        })

    }


}


