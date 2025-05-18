# Group  
Justine Barreto, Andrés Evertsz, Juan Pineda

# Project  
Build X (formerly Twitter)
[![Demo](https://img.youtube.com/vi/RJhJ2JYpFxc/0.jpg)](https://www.youtube.com/watch?v=RJhJ2JYpFxc)

---

## User Stories

- As a **User**, I can create an account, and authenticate (recover my password only via Firebase).  
- As a **User**, I can visit my profile page to read all my Posts.  
- As a **User**, I can see only my Posts in the Timeline ordered by the most recent date.  
- As a **User**, I can create a Post or delete a Post that I created.  
- As a **User**, I can Reply and Like my Posts.

---

## ¿Qué hace este proyecto?

- **Autenticación de usuarios:** Permite a los usuarios crear una cuenta, iniciar sesión y recuperar su contraseña usando Firebase Authentication.
- **Posts:** Los usuarios pueden crear, ver, eliminar y comentar sus propios posts. Los posts se muestran en orden del más reciente al más antiguo.
- **Likes y comentarios:** Los usuarios pueden dar like y comentar en sus propios posts.
- **Sentry:** Los errores de la aplicación se reportan automáticamente a Sentry en producción para monitoreo y diagnóstico.
- **Feature flag con GrowthBook:** Se utiliza GrowthBook para experimentar con nuevas funcionalidades. Si el feature flag está activo, se muestra un botón experimental; si no, se muestra un link experimental.
- **Pruebas unitarias:** El proyecto incluye pruebas unitarias para los componentes principales y funciones utilitarias.
- **CI/CD:** Cada vez que haces push o un pull request, GitHub Actions ejecuta automáticamente las pruebas unitarias para asegurar la calidad del código.
- **Extensión de Chrome (BONO):** En modo desarrollo, los errores no se envían a Sentry, sino que se guardan en el navegador y pueden verse usando una extensión de Chrome incluida en el repositorio.

---

## ¿Cómo funciona la extensión de Chrome?

1. En modo desarrollo, los errores se guardan en `localStorage` bajo la clave `mini-x-errors`.
2. La extensión de Chrome lee y muestra estos errores en un popup.
3. Para usarla:
   - Ve a `chrome://extensions/`
   - Activa el modo desarrollador
   - Haz clic en "Cargar descomprimida" y selecciona la carpeta `chrome-extension/`
   - Abre la app en `localhost:3000`, genera un error (por ejemplo, con el botón "Test Sentry Error") y revisa el popup de la extensión.

---

## ¿Cómo funciona el feature flag?

- El feature flag `show-experiment-button` se controla desde GrowthBook.
- Si está activo, se muestra un botón experimental en la pantalla principal.
- Si está inactivo, se muestra un link experimental a [GrowthBook](https://growthbook.io/).

---

## ¿Cómo se ejecutan las pruebas?

```bash
npm test
```

---

## ¿Cómo se ejecuta el proyecto?

```bash
npm start
```
