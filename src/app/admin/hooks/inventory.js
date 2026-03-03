export async function getInventory() {
    const response = await fetch("http://localhost:8000/api/authinventory/drinks/",
// {method: "GET",
// headers: {
//     authorization: `Bearer ${localStorage.getItem("token")}`,
// }}
    )

    if (!response.ok) {
        throw new Error("Failed to fetch inventory")
    }

    const data = await response.json()
    return data
}


export async function updateInventoryItem() {
    const response = await fetch("http://localhost:8000/api/authinventory/drinks/", {
        method: "PUT",
        headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
        }
    })

    if (!response.ok) {
        throw new Error("Failed to update inventory item")
    }
    const data = await response.json()
    return data

}