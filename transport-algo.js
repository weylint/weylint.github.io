// Transport Profits Algorithm
// Pure logic — no DOM, no API calls.
//
// compute(stores) takes the raw array from fetchStores().Stores and returns:
//   routes: [{ sellStore, buyStore, totalProfit, items: [{ itemName, sellPrice, buyPrice, profitPerUnit, qty, totalProfit }] }]
//
// "sellStore" = the store you BUY FROM (it is selling the item).
// "buyStore"  = the store you SELL TO   (it is buying  the item).
//
// Future extension: once a weight/stack-size API is available, add per-item
// batch-size logic here before totalProfit is finalised.
const TransportAlgo = (() => {

  // Returns true when the sell-side durability satisfies the buy-side requirement.
  function durabilityOk(sellMinDur, buyMinDur) {
    if (buyMinDur === -1) return true;   // buyer has no durability requirement
    if (sellMinDur === -1) return true;   // sell-side durability unknown — ignore
    return sellMinDur >= buyMinDur;
  }

  function compute(stores) {
    const validStores = (stores || []).filter(
      s => s.Enabled === true && s.CurrencyName === 'Euro'
    );

    // sellOffers[itemName] = [{ storeName, price, qty, minDurability, storeBalance }]
    // buyOffers[itemName]  = [{ storeName, price, maxNumWanted, minDurability, storeBalance }]
    const sellOffers = {};
    const buyOffers  = {};

    for (const store of validStores) {
      for (const offer of (store.AllOffers || [])) {
        const item = offer.ItemName;
        if (offer.Buying === false) {
          if (!sellOffers[item]) sellOffers[item] = [];
          sellOffers[item].push({
            storeName:    store.Name,
            price:        offer.Price,
            qty:          offer.Quantity,
            minDurability: offer.MinDurability,
            storeBalance: store.Balance,
          });
        } else {
          if (!buyOffers[item]) buyOffers[item] = [];
          buyOffers[item].push({
            storeName:    store.Name,
            price:        offer.Price,
            maxNumWanted: offer.MaxNumWanted,
            minDurability: offer.MinDurability,
            storeBalance: store.Balance,
          });
        }
      }
    }

    // routeMap key: "sellStoreName|||buyStoreName"
    const routeMap = {};

    for (const item of Object.keys(sellOffers)) {
      if (!buyOffers[item]) continue;

      for (const sell of sellOffers[item]) {
        for (const buy of buyOffers[item]) {
          if (sell.storeName === buy.storeName) continue;
          if (!durabilityOk(sell.minDurability, buy.minDurability)) continue;

          const profitPerUnit = buy.price - sell.price;
          if (profitPerUnit < 0) continue;

          // Effective quantity: limited by available stock and buyer's appetite
          let qty = Math.min(sell.qty, buy.maxNumWanted);

          // Affordability cap: buyer's cash balance limits how many units they can pay for
          if (buy.price > 0) {
            qty = Math.min(qty, Math.floor(buy.storeBalance / buy.price));
          }

          if (qty <= 0) continue;

          const totalProfit = profitPerUnit * qty;

          const key = `${sell.storeName}|||${buy.storeName}`;
          if (!routeMap[key]) {
            routeMap[key] = {
              sellStore:   sell.storeName,
              buyStore:    buy.storeName,
              totalProfit: 0,
              items:       [],
            };
          }
          routeMap[key].items.push({
            itemName:     item,
            sellPrice:    sell.price,   // price you PAY at sellStore
            buyPrice:     buy.price,    // price you RECEIVE at buyStore
            profitPerUnit,
            qty,
            totalProfit,
          });
        }
      }
    }

    const routes = Object.values(routeMap);

    for (const route of routes) {
      // Profitable items first, break-even items at the bottom
      route.items.sort((a, b) => b.profitPerUnit - a.profitPerUnit);
      // Route total profit counts only the profitable items (break-even don't inflate ranking)
      route.totalProfit = route.items.reduce(
        (sum, i) => (i.profitPerUnit > 0 ? sum + i.totalProfit : sum), 0
      );
    }

    // Sort routes by total profit descending; altruistic-only routes (totalProfit==0) rank last
    routes.sort((a, b) => b.totalProfit - a.totalProfit);

    return routes;
  }

  return { compute };
})();
