"use client"

import { useEffect } from "react"

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Evita registrar o Service Worker em navegadores controlados por automação
    // (Playwright, Selenium, etc.), que é o caso dos testes E2E em CI.
    if (navigator.webdriver) {
      return
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("SW registrado"))
        .catch(console.error)
    }
  }, [])

  return null
}