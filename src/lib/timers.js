import { updateTicket } from 'wwpass-frontend';
import $ from 'jquery';

let idleStart = new Date() / 1000;
let idleTimeout = 0;

function restartIdleTimers(inactivityTimeout = 0) {
  idleStart = new Date() / 1000;
  if (inactivityTimeout) {
    idleTimeout = inactivityTimeout;
  }
}

function initTimers(times) {

  idleTimeout = times.idleTimeout;

  const maxTicketAge = times.ttl / 2 + 30;
  let ticketTimeStamp = new Date() / 1000 - times.ticketAge;

  document.onclick = () => {
    idleStart = new Date() / 1000;
  };
  document.onkeypress = () => {
    idleStart = new Date() / 1000;
  };

  function CheckIdleTime() {
    const secondsNow = new Date() / 1000;

    if ((secondsNow - ticketTimeStamp) > maxTicketAge) {
      ticketTimeStamp = new Date() / 1000;
      updateTicket('update_ticket.php');
    }
    
    if (((secondsNow - idleStart) >= idleTimeout) && !$('#idleModalLabel').is('visible')) {
      $('#idleModal').modal('show');
    }

    if ((secondsNow - idleStart) >= idleTimeout + 60) {
      document.location.href = 'logout.php';
    }
  }

  if (idleTimeout > 0) {
    window.setInterval(CheckIdleTime, 1000);
  }
}

// hack, sorry
if (typeof timersArgs !== "undefined") {
  initTimers(timersArgs);
}

export {restartIdleTimers}
