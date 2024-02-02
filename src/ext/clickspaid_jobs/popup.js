if (typeof jQuery !== 'undefined') {
    jQuery(document).ready(function($) {
        let $form_login = $('#form-login'),
            $username = $form_login.find('[name="email"]'),
            $password = $form_login.find('[name="password"]'),
            $login_button = $form_login.find('[type="submit"]'),
            $error = $('#error');

        browser.runtime.sendMessage({'message': 'request_username'}).then(() => {
            //            console.log('Requested if username saved');
        }, onError);

        browser.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                if (request.message === 'show_login_error') {
                    $error.html(request.error);
                }
                if (request.message === 'set_username') {
                    if (request.username) {
                        $username.val(request.username);
                    }
                }

                if (request.message !== 'show_login_error' && request.message !== 'set_username') {
                    window.close();
                }
            },
        );

        $username.focus(function() {
            resetError();
        });

        $password.focus(function() {
            resetError();
        });

        $login_button.on('click', function(e) {
            // e.preventDefault();

            browser.runtime.sendMessage({
                'message': 'try_auth',
                'email': $username.val(),
                'password': $password.val(),
            }).then(() => {
                // console.log('');
            }, onError);

        });

        $username.on('blur', function() {
            browser.runtime.sendMessage({
                'message': 'set_email',
                'email': $username.val()
            }).then(() => {
                // console.log('username saved');
            }, onError);
        });
    });

    function resetError() {
        $('#error').html('');
    }

    function onError(error) {
        console.error(`Error: ${error}`);
    }
}