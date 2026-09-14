// ========================================
// LOGIN JS
// ========================================


// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
    "https://yevvekkwhovevqcvyhxv.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_Vx9PlEUAX3NyVVEVMSzmDQ_XwtUYZKW";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// ELEMENT
// ========================================

const loginForm =
    document.getElementById("loginForm");

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");


// ========================================
// TOGGLE PASSWORD
// PERSIS SEPERTI PUNYA KAMU
// ========================================

if (togglePassword && passwordInput) {

    togglePassword.addEventListener(
        "click",
        function () {

            if (passwordInput.type === "password") {

                passwordInput.type = "text";
                togglePassword.textContent = "🙈";

            } else {

                passwordInput.type = "password";
                togglePassword.textContent = "👁";

            }

        }
    );

}


// ========================================
// LOGIN FORM
// ========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                passwordInput.value;


            // ========================================
            // VALIDASI
            // ========================================

            if (!email || !password) {

                alert(
                    "Email dan password wajib diisi."
                );

                return;

            }


            // ========================================
            // BUTTON
            // ========================================

            const loginButton =
                document.getElementById(
                    "loginButton"
                );


            if (loginButton) {

                loginButton.disabled = true;
                loginButton.textContent =
                    "Login...";

            }


            // ========================================
            // LOGIN SUPABASE
            // ========================================

            const {
                data,
                error
            } =
                await supabaseClient.auth
                    .signInWithPassword({

                        email: email,

                        password: password

                    });


            // ========================================
            // LOGIN ERROR
            // ========================================

            if (error) {

                console.error(
                    "Login gagal:",
                    error
                );

                alert(
                    "Login gagal: " +
                    error.message
                );


                if (loginButton) {

                    loginButton.disabled = false;
                    loginButton.textContent =
                        "Login";

                }

                return;

            }


            // ========================================
            // LOGIN BERHASIL
            // ========================================

            console.log(
                "Login berhasil:",
                data.user
            );


            window.location.replace(
                "dashboard.html"
            );

        }
    );

}