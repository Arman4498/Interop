async function init() {
    // Appel du script PHP qui gère la géolocalisation et la transformation
    const response = await fetch("atmosphere.php");
    const html = await response.text();
  
    // Affichage du résultat HTML
    document.getElementById("example").innerHTML = html;
  }
  
  init();