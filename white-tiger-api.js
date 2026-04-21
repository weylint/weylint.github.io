// Shared API access for the White Tiger Eco server
// https://white-tiger.play.eco
const WhiteTigerAPI = (() => {
  const BASE_URL = 'https://white-tiger.play.eco/api/v1/plugins/EcoPriceCalculator';

  async function fetchEndpoint(endpoint) {
    const response = await fetch(`${BASE_URL}/${endpoint}`);
    if (!response.ok) throw new Error(`HTTP Error (${endpoint}): ${response.status}`);
    return response.json();
  }

  return {
    fetchRecipes:        () => fetchEndpoint('recipes'),
    fetchStores:         () => fetchEndpoint('stores'),
    fetchAllItems:       () => fetchEndpoint('allItems'),
    fetchCraftingTables: () => fetchEndpoint('craftingTables'),
  };
})();
