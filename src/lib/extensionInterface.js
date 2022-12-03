
let extensionId = 'bamjbfhfacpdkenilcibkmpdahkgfejh';  // -- real ID

if (window.location.href.includes("extension")) {
 extensionId = 'jeanejlnahceelplajcbfgdphkbnpagp'; // -- local 
} 


/*global chrome*/

function sendAdvise(s) {
    console.log('sendAdvise');
    console.log(s);
    try {
        chrome.runtime.sendMessage(extensionId, s,
        function(response) {
            if(!response) {
                if(chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError);
                } else  {
                    console.log('no response');
                }
            } else {
                console.log('sendAdvise got response');
                console.log(response);
            }
        });
    } catch(err) {
        console.log(err)
    }
};

let extensionPort = null;

function connect(findCb) {
    if ( typeof chrome == 'undefined') {
        return; 
    }

    try {
        if(extensionPort) {
            extensionPort.disconnect();
            extensionPort = null
        }

        extensionPort = chrome.runtime.connect(extensionId);

        //manifest V3: 

        setTimeout(connect, 4*60*1000, findCb);

        extensionPort.onDisconnect.addListener((p) => {
            // FF way:
            /*if (p.error) {
                console.log(`Disconnected due to an error: ${p.error.message}`);
            }*/
            // Chrome 
            if(chrome.runtime.lastError) {
                console.log('Connection rintime.error');
                console.log(chrome.runtime.lastError);
            }
            extensionPort = null;
            console.log('disConnected');
        });
        extensionPort.onMessage.addListener(function(message,sender){
            /////  -->  TODO restartIdleTimers();
            console.log('received');
            console.log(message);
            if(message.id === 'find') { // legacy
                message.id = 'advise request';
            }
            if(message.id === 'not a payment page') { // legacy
                message.id = 'advise request';
            }

            if((message.id === 'advise request') || (message.id === 'payment page')) {
                try {
                    sendAdvise(findCb(message));
                } catch(err) {
                    console.log('catch 68');
                    console.log(err);
                    console.log(message);
                }
            } 
        });
    } catch(err) {
        console.log(err)
    }
};



function sendCredentials(s) {
    // console.log('sendCredentials');
    // console.log(s);

    let url = s.url;
    if (url.search('://') == -1) {
        url = `https://${url}`;
    }
    s.url = url;

    if ( (typeof chrome != 'undefined') && chrome.runtime && chrome.runtime.sendMessage) {
        try {
            chrome.runtime.sendMessage(extensionId, s,
            function(response) {
                if(!response) {
                    if(chrome.runtime.lastError) {
                        console.log(chrome.runtime.lastError);
                    } else  {
                        console.log('no response');
                    }

                    window.open(url, "_blank");
                } else {
                    console.log(response);
                }
            });
        } catch(err) {
            console.log(err)
            window.open(url, "_blank");
        }
    } else {
        window.open(url, "_blank");
    }
};


function openInExtension(item) {
    const s = {
        id: 'loginRequest',
        username: item.cleartext[1],
        password: item.cleartext[2],
        url: item.cleartext[3],
    }
    if(item.cleartext[3].length > 0) {
        sendCredentials(s);
    }
}

export {connect, sendCredentials, sendAdvise, openInExtension}
