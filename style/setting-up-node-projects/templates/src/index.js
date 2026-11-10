export function greet(name) {
  return `Hello, ${name}!`;
}

if (import.meta.main) {
  console.log(greet("world"));
}
