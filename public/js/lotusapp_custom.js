var lotusapp = jQuery.noConflict();
lotusapp(document).ready(function($){
    fetch('/home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'malo2',
          id: 'id22',
        })
    })
})