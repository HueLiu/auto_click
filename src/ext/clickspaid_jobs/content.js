'use strict';
browser.runtime.onMessage.addListener(request => {
    if (request.message === 'show_alert') {
        alert(request.text);
    }

    console.log('browser.runtime.onMessage');
    console.log('request.search: '+request.search);


    if (request.message === 'mark_website') {

        setTimeout(() => {

        // let isAndroid = request.isAndroid;
        let currentSearcVal = $('textarea[name="q"]').val();

        if (currentSearcVal !== request.search)
            currentSearcVal = $('[name="q"]').val();

        // if (isAndroid) {
        //     currentSearcVal = $('header div form div div textarea[name="q"]').val();
        // }

        console.log('request.match: '+request.match);
        console.log('currentSearcVal: '+currentSearcVal);
        console.log('request.message');

        if (currentSearcVal === request.search) {
            console.log('currentSearcVal === request.search');


            chrome.runtime.sendMessage({'message': 'set_query_match', 'ismatch': true});

            var testString1 = request.match;
            let lastString = testString1.replace(/\./g, '\\.');
            let reg = lastString.replace(/\*/g, '\.');
            let re = new RegExp('^http://' + reg + '/', 'i');
            let re0 = new RegExp('^' + reg + '/', 'i');
            let re1 = new RegExp('^https://' + reg + '/', 'i');
            let re2 = new RegExp('^http://www.' + reg + '/', 'i');
            let re3 = new RegExp('^https://www.' + reg + '/', 'i');
            let re4 = new RegExp('^/.*' + reg + '.*', 'i');
            // let reQ = new RegExp('^\/url\?q=http://'+reg+'/',"i");
            // let re1Q = new RegExp('^\/url\?q=https://'+reg+'/',"i");
            // let re2Q = new RegExp('^\/url\?q=http://www.'+reg+'/',"i");
            // let re3Q = new RegExp('^\/url\?q=https://www.'+reg+'/',"i");

            /*
            if (isAndroid) {
                let elt5 = $('#main').children('div').children('div.xpd').children('div').children('a').filter(function() {
                    let testString = $(this).attr('href');
                    let testStringClean = testString.split('/url?q=').join('');
                    if (re.test(testStringClean) || re1.test(testStringClean) || re2.test(testStringClean) || re3.test(testStringClean)) {
                        return true;
                    } else {
                        return false;
                    }
                });
                // console.log($(elt5));
                //$(elt5).css('background-color', '#ef9292');
                $(elt5).eq(0).parent().css('background-color', '#ef9292');
            }*/

            // let elt4 = $('.g').children('div').children('.rc').children('.r').children('a').filter(function() {
            //     if (re.test($(this).attr('href')) || re1.test($(this).attr('href')) || re2.test($(this).attr('href')) || re3.test($(this).attr('href'))) {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // });
            // $(elt4).eq(0).closest('.g').css('background-color', '#ef9292');

            // let elt3 = $('.g').find('.rc').children('.r').children('a').filter(function() {
            //     if (re.test($(this).attr('href')) || re1.test($(this).attr('href')) || re2.test($(this).attr('href')) || re3.test($(this).attr('href'))) {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // });
            // $(elt3).eq(0).parent().parent().parent().css('background-color', '#ef9292');

            // let elt6 = $('.g').find('.rc').children('div').children('a').filter(function() {
            //     if (re.test($(this).attr('href')) || re1.test($(this).attr('href')) || re2.test($(this).attr('href')) || re3.test($(this).attr('href'))) {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // });
            // $(elt6).eq(0).parent().parent().css('background-color', '#ef9292');

            // let elt7 = $('.g .rc a').filter(function() {
            //     console.log('!!!2: ');
            //     console.log($(this));
            //     if (re.test($(this).attr('href')) || re1.test($(this).attr('href')) || re2.test($(this).attr('href')) || re3.test($(this).attr('href'))) {
            //         return true;
            //     } else {
            //         return false;
            //     }
            // });
            // $(elt7).eq(0).closest('.rc').css('background-color', '#ef9292');

            $('#tads').hide();
            $('#bottomads').hide();
            $('#taw').hide();

            console.log('marking the item red');

            $('a').each(function(index) {
                if (re.test($(this).attr('href')) || re0.test($(this).attr('href')) || re1.test($(this).attr('href')) || re2.test($(this).attr('href')) || re3.test($(this).attr('href')) || re4.test($(this).attr('href'))) {
                    $(this).css('background-color', '#ef9292');
                    $(this).closest('div').css('background-color', '#ef9292');

                    console.log('Found the link');
                }
            });
        } else {
            chrome.runtime.sendMessage({'message': 'set_query_match', 'ismatch': false});
        }

        }, "1000");
    }

    return Promise.resolve({response: 'Hi from content script'});
});

