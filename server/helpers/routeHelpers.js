// Cette fonction est utilisé pour ajouter la classe "active" du css aux lien cliqués afin de leur appliquer une couleur grey.

/* La fonction isActiveRoute(route, currentRoute) est une simple fonction utilitaire qui vérifie si la route actuelle correspond à une route spécifique.

Voici ce que fait isActiveRoute() :

Elle prend en entrée deux arguments :
    route : la route actuelle du lien (par exemple, '/' ou '/about').
    currentRoute : la route courante à laquelle l'utilisateur se trouve (définie dans le routeur).
La fonction compare si la route est égale à la currentRoute et renvoie "active" si c'est le cas. Sinon, elle renvoie une chaîne vide ("").
Cela permet d'ajouter une classe CSS "active" à un élément de navigation lorsque l'utilisateur se trouve sur la page correspondante (lorsque currentRoute = route). Cette classe "active" est utilisée pour styliser les liens de navigation afin d'indiquer visuellement quelle page est actuellement active (par exemple, en mettant le lien en gras ou en changeant sa couleur). */

// Ensuite dans les routes de main.js du dossier "routes" on ajoute currentRoute dans les données associées à la fonction render() afin de pouvoir récupérer currentRoute dans le vues EJS et la comparer à route de isActiveRoute().

// isActiveRoute est récupérée dans 'server.js' afin de la rendre disponible dans toutes les vues EJS avec' app.locals.isActiveRoute = isActiveRoute;'.

// https://chatgpt.com/share/672e0389-1c94-800d-b388-659e73d9334c
export function isActiveRoute(route, currentRoute) {
  // console.log("currentRoute :", currentRoute);
  return route === currentRoute ? "active" : "";
}

// module.exports = { isActiveRoute };
