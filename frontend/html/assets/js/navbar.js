export function insertNavBar() {
    return `
  <nav class="navbar navbar-expand-lg navbar-dark" style="background-color:rgb(21,69,110); height: 70px;">
    <a class="navbar-brand px-3" href="/gallery" style="font-size: 1.25rem;">Camagru</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" 
        aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>   
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav">
            <a class="nav-item nav-link active px-4 py-3" href="/editor">Editor</a>
            <a class="nav-item nav-link px-4 py-3" href="/account">Account</a>
            <a class="nav-item nav-link px-4 py-3" href="/logout">Logout</a>
        </div>
    </div>
  </nav>
  `;
  }