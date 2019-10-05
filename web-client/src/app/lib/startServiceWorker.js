import constants from "../../../common/constants";

export default function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  let promise;
  if (process.env.NODE_ENV === "development") {
    promise = navigator.serviceWorker.getRegistrations().then(regs => {
      if (!regs.length) return;

      return Promise.all(_.invokeMap(regs, "unregister")).then(() => {
        console.log("[SW]", "Unregistered");
        window.location.reload(true);
      });
    });
  } else {
    promise = navigator.serviceWorker
      .register("sw.js", { scope: "/" })
      .then(reg => {
        reg.onupdatefound = () => {
          // Check if update is needed
          let installingWorker = reg.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                window.__updateReady = true;
                window.dispatchEvent(
                  new CustomEvent(constants.events.UPDATE_READY)
                );
              }
            }
          };
        };

        // Prefetch PWA start page
        window.caches.open("site").then(myCache => myCache.addAll(["/pwa"]));
      });
  }

  promise.catch(error => {
    console.error("[SW]", error);
  });
}