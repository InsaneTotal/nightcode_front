export async function getDrinks() {
  const response = await fetch(
    "http://127.0.0.1:8000/api/authinventory/drinks/"
  );

  if (!response.ok) {
    throw new Error("Error cargando bebidas");
  }

  return await response.json();
}