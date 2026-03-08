export function toTitleCaseMap(str: string, splitter = " ") {
  return str
    .toLowerCase()
    .split(splitter)
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(" ")
}
