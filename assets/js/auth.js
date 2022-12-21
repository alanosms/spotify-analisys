    var stateKey = 'spotify_auth_state';

    let displayName = document.getElementById('nameDisplayClient');
    let loginButton = document.getElementById('login-button');

    let table = document.querySelector('.table-top-tracks');

    function getHashParams() {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      while ( e = r.exec(q)) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      return hashParams;
    }

    function generateRandomString(length) {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    var params = getHashParams();

    var access_token = params.access_token,
        state = params.state,
        storedState = localStorage.getItem(stateKey);

    if (access_token && (state == null || state !== storedState)) {
      alert('Ocorreu um erro durante a autenticação. :(');
    } else {
      localStorage.removeItem(stateKey);
      if (access_token) {
        console.log("sucesso, token: "+access_token);
        alterToLockNewRequests();
      }

      loginButton.addEventListener('click', function() {

        var client_id = 'e5e2cfc631ff4d00bb31f9cd5da6befe'; 
        var redirect_uri = 'https://alanosms.github.io/spotify-analysis/';

        var state = generateRandomString(16);

        localStorage.setItem(stateKey, state);
        var scope = 'user-read-private user-read-email user-top-read';

        var url = 'https://accounts.spotify.com/authorize';
        url += '?response_type=token';
        url += '&client_id=' + encodeURIComponent(client_id);
        url += '&scope=' + encodeURIComponent(scope);
        url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
        url += '&state=' + encodeURIComponent(state);

        window.location = url;
      }, false);

      function alterToLockNewRequests(){
        document.getElementById('login-button').style.display = 'none';
        document.querySelector('.styled-table').style.display = 'block';
        handleDataTable();
      }

    async function handleDataTable(){
        if(access_token){
           await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=5&offset=1', {
                method: 'GET', headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + access_token
                }
            })
            .then((response) => {
                (response.json().then(
                    (data) => {
                        let topTracks = data.items;
                        topTracks.forEach(item => {
                            let nameAlbum = item.album.name;
                            let trackName = item.name;
                            let artist = item.album.artists[0].name;
                            let duration = (item.duration_ms / 60000).toFixed(2).replace('.', ':');
                            let tableRow = document.createElement("tr");

                                tableRow.innerHTML = `                        
                                <td data-label="Ranking">${data.items.indexOf(item) + 1}</td>
                                <td data-label="Nome">${trackName}</td>
                                <td data-label="Albúm">${nameAlbum}</td>
                                <td data-label="Cantor">${artist}</td>
                                <td data-label="Duração">${duration}</td>`;

                            console.log(trackName, nameAlbum, artist, duration);
                                table.appendChild(tableRow);

                        });
                     }
                    ));
                });
                
            }
        }
}
