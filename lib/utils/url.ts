// Function to remove the query string from the current URL
export function clearQueryString() {
  // Create a URL object from the current window location
  const url = new URL(window.location.href)

  // Set the search property to an empty string to remove all parameters
  url.search = ""

  // Use the History API to update the URL in the address bar without a page reload
  window.history.replaceState({}, document.title, url.toString())
}
