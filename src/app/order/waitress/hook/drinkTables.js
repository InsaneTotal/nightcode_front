export async function getDrinkTables() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/order/drink-tables/`);
    if (!response.ok) {
      throw new Error("Failed to fetch drink tables");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching drink tables:", error);
    throw error;
  }
}