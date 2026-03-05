export async function getDrinkTables() {
  try {
    const response = await fetch("http://localhost:8000/api/order/drink-tables/");
      if (!response.ok) {
        throw new Error("Failed to fetch drink tables");
      }

    const data = await response.json();
    return data
    ;} catch (error) {
    console.error("Error fetching drink tables:", error);
    throw error;
  }}