export function insertNavBarGallery() {
    return `
    <nav id="nav-gallery" class="navbar justify-content-between navbar-expand-lg navbar-dark" style="background-color:rgb(21,69,110);">
      <a class="navbar-brand px-3" href="/gallery" style="font-size: 1.25rem;">Camagru</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" 
          aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
      </button>   
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div class="navbar-nav">
              <a id="nav-public" class="nav-item nav-link px-4 py-3" href="/public">Public Gallery</a>
              <a id="nav-editor" class="nav-item nav-link px-4 py-3" href="/editor">Editor</a>
              <a id="nav-account" class="nav-item nav-link px-4 py-3" href="/account">Account</a>
              <a id="nav-logout" class="nav-item nav-link px-4 py-3" href="/logout">Logout</a>
          </div>
      </div>
      <form id="search-form" class="d-flex align-items-center px-3">
          <input id="search-username" maxlength="16" class="form-control me-2" type="search" placeholder="username" aria-label="Search">
          <button id="search-btn" class="btn btn btn-primary" type="submit">Search</button>
      </form>
    </nav>
    `;
}

export function insertLoggedInNavBar() {
    return `
    <nav id="nav-loggedin" class="navbar justify-content-between navbar-expand-lg navbar-dark" style="background-color:rgb(21,69,110);">
      <a class="navbar-brand px-3" href="/gallery" style="font-size: 1.25rem;">Camagru</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" 
          aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
      </button>   
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div class="navbar-nav">
              <a id="nav-public" class="nav-item nav-link px-4 py-3" href="/public">Public Gallery</a>
              <a id="nav-editor" class="nav-item nav-link px-4 py-3" href="/editor">Editor</a>
              <a id="nav-account" class="nav-item nav-link px-4 py-3" href="/account">Account</a>
              <a id="nav-logout" class="nav-item nav-link px-4 py-3" href="/logout">Logout</a>
            </div>
        </div>
    </nav>
              `;
}


export function insertLoggedOutNavBar() {
    return `
   <nav id="nav-loggedout" class="navbar justify-content-between navbar-expand-lg navbar-dark" style="background-color:rgb(21,69,110);">
      <a class="navbar-brand px-3" href="/gallery" style="font-size: 1.25rem;">Camagru</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" 
          aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
      </button>
      <div class="navbar-nav">
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div class="navbar-nav">
              <a id="nav-public" class="nav-item nav-link px-4 py-3" href="/public">Public Gallery</a>
            </div>
        </div>
    </nav>
    `;
}