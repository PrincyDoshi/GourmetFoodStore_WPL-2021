window.onload = function () {
    console.log("found js file")
    //there will be one span element for each input field
    // when the page is loaded, we create them and append them to corresponding input elements 
    // they are initially empty and hidden

    var email = document.getElementById("email");
    var emailSpan = document.createElement("emailSpan");
    emailSpan.style.display = "none";
    email.parentNode.appendChild(emailSpan);

    var password = document.getElementById("password");
    var passwordInfoSpan = document.createElement("PasswordSpan");
    passwordInfoSpan.style.display = "none";
    password.parentNode.appendChild(passwordInfoSpan);

    var confirmPwd = document.getElementById("confirmpwd");
    var confirmPwdSpan = document.createElement("confirmPwdSpan");
    confirmPwdSpan.style.display = "none";
    confirmPwd.parentNode.appendChild(confirmPwdSpan);

    var checkMark = document.getElementById("checkmarkId");
    console.log(checkMark.checked);
    var checkSpan = document.createElement("checkSpan");
    checkSpan.style.display = "none";
    checkMark.parentNode.appendChild(checkSpan);
        
    email.onfocus = function () {
        email.classList.remove("error");
        emailSpan.innerHTML = "Enter a valid email ID here";
        emailSpan.style.display = "block";
    }

    email.onblur = function () {
        emailSpan.style.display = "none";
    }

    password.onfocus = function () {
        password.classList.remove("error");
        passwordInfoSpan.innerHTML = "<li>Password must be atleast 6 characters</li><li> one uppercase letter</li><li> one number</li><li>one special character{!,@,#,$,%,^,&,*,+}</li>";
        passwordInfoSpan.style.display = "block";
    }

    password.onblur = function () {
        passwordInfoSpan.style.display = "none";
    }

    confirmPwd.onfocus = function () {
        confirmPwd.classList.remove("error");
        confirmPwdSpan.innerHTML = "Enter Password again";
        confirmPwdSpan.style.display = "block";
    }

    confirmPwd.onblur = function () {
        confirmPwdSpan.style.display = "none";
    }

    var form = document.getElementById("SignupForm");
    form.onsubmit = function (e) {
        let isError = false;
        passwordInfoSpan.innerHTML = "";

        const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(email.value)) {
            email.classList.add("error");
            emailSpan.innerHTML = " Invalid Email ID ";
            emailSpan.style.display = "block";
            isError = true;
        }

        const capitalLettersRegex = /[A-Z]/g;
        if (!password.value.match(capitalLettersRegex)) {
            password.classList.add("error");
            passwordInfoSpan.innerHTML = " Missing Capital Letters. ";
            passwordInfoSpan.style.display = "block";
            isError = true;
        }

        const numbersRegex = /[0-9]/g;
        if (!password.value.match(numbersRegex)) {
            password.classList.add("error");
            passwordInfoSpan.innerHTML = passwordInfoSpan.innerHTML + " Missing Number. ";
            passwordInfoSpan.style.display = "block";
            isError = true;
        }

        const specialCharRegex = /\W|_/g
        if (!password.value.match(specialCharRegex)) {
            password.classList.add("error");
            passwordInfoSpan.innerHTML = passwordInfoSpan.innerHTML + " Missing Special Characters. ";
            passwordInfoSpan.style.display = "block";
            isError = true;
        }

        if (password.value.length < 6) {
            password.classList.add("error");
            passwordInfoSpan.innerHTML = passwordInfoSpan.innerHTML + " password length less than 6. ";
            passwordInfoSpan.style.display = "block";
            isError = true;
        }
        console.log("here");
        if (!checkMark.checked) {
            alert("Please agree to our terms!");
        }

        if (confirmPwd.value == "") {
            confirmPwd.classList.add("error");
            confirmPwdSpan.innerHTML = " Enter password again ";
            confirmPwdSpan.style.display = "block";
            isError = true;
        }
        else if (password.value !== confirmPwd.value) {
            password.classList.add("error");
            confirmPwd.classList.add("error");
            confirmPwdSpan.innerHTML = " Passwords do not match ";
            confirmPwdSpan.style.display = "block";
            isError = true;
        }
        e.preventDefault();

        if (isError) {
            console.log("form not passsed")
            
        } else {
                console.log("Form is passed");
                $.ajax({
                url: '/signup',
                type:'POST',
                data: $("#SignupForm").serialize()
              })
              .done(response => {
                    if (response) {
                        window.location = '/login';
                    } else {
                        alert("Email ID is already registered! Please check.");
                    }
              })
            
        }
    }


}


