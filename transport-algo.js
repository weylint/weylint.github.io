// Transport Profits Algorithm
// Pure logic — no DOM, no API calls.
//
// compute(stores, itemData, config) takes the raw array from fetchStores().Stores and returns:
//   routes: [{ sellStore, buyStore, totalProfit,
//              items: [{ itemName, sellPrice, buyPrice, profitPerUnit,
//                        qty, totalProfit, handsQty, backpackQty, vehicleQty }] }]
//
// "sellStore" = the store you BUY FROM (it is selling the item).
// "buyStore"  = the store you SELL TO   (it is buying  the item).
//
// itemData (optional): { [itemName]: { weightG, maxStackSize, isCarried } }
//   weightG      — item weight in grams (0 = weightless)
//   maxStackSize — max units per inventory slot
//   isCarried    — true if the item uses the player's hands slot instead of backpack
//
// config (optional, used when itemData is supplied):
//   { vehicles: [{ name, slots, weightG }], backpack: { slots, weightG }, hands: { slots } }
//   Vehicle capacities are summed into one shared budget.
//   Backpack only holds !isCarried items. Hands slot holds isCarried items (no weight cost).
//
// Capacity fill order per route (budgets reset per route = one trip):
//   Pass 1 — Hands:    profit order, IsCarried only, 1 stack max, no weight
//   Pass 2 — Backpack: weight ascending (!IsCarried), so lightest items fill first
//   Pass 3 — Vehicle:  profit order, all items, shared summed budget
const TransportAlgo = (() => {

  // Returns true when the sell-side durability satisfies the buy-side requirement.
  function durabilityOk(sellMinDur, buyMinDur) {
    if (buyMinDur === -1) return true;   // buyer has no durability requirement
    if (sellMinDur === -1) return true;  // sell-side durability unknown — ignore
    return sellMinDur >= buyMinDur;
  }

  // Allocates as many units as fit within a slot+weight budget. Mutates budget in place.
  // Returns the qty actually allocated.
  function allocateToCompartment(want, maxStackSize, weightG, budget) {
    const stackSize = Math.max(1, maxStackSize);
    let qty = want;
    if (weightG > 0 && budget.weightG !== Infinity)
      qty = Math.min(qty, Math.floor(budget.weightG / weightG));
    qty = Math.min(qty, budget.slots * stackSize);
    qty = Math.max(qty, 0);
    budget.slots   -= qty > 0 ? Math.ceil(qty / stackSize) : 0;
    budget.weightG -= qty * weightG;
    return qty;
  }

  function compute(stores, itemData, config) {
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
            storeName:     store.Name,
            price:         offer.Price,
            qty:           offer.Quantity,
            minDurability: offer.MinDurability,
            storeBalance:  store.Balance,
          });
        } else {
          if (!buyOffers[item]) buyOffers[item] = [];
          buyOffers[item].push({
            storeName:     store.Name,
            price:         offer.Price,
            maxNumWanted:  offer.MaxNumWanted,
            minDurability: offer.MinDurability,
            storeBalance:  store.Balance,
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
            itemName:      item,
            sellPrice:     sell.price,   // price you PAY at sellStore
            buyPrice:      buy.price,    // price you RECEIVE at buyStore
            profitPerUnit,
            qty,
            totalProfit:   profitPerUnit * qty,
            handsQty:      0,
            backpackQty:   0,
            vehicleQty:    0,
          });
        }
      }
    }

    const routes = Object.values(routeMap);

    const applyCapacity = !!(itemData && config && Object.keys(itemData).length > 0);

    for (const route of routes) {
      // Profitable items first, break-even items at the bottom
      route.items.sort((a, b) => b.profitPerUnit - a.profitPerUnit);

      if (applyCapacity) {
        // Per-route mutable budgets — reset each route (= one trip)
        const vehicle = {
          slots:   config.vehicles.reduce((s, v) => s + v.slots,   0),
          weightG: config.vehicles.reduce((s, v) => s + v.weightG, 0),
        };
        const backpack = { slots: config.backpack.slots, weightG: config.backpack.weightG };
        const hands    = { slots: config.hands.slots };

        // Track remaining unallocated qty per item across passes
        const remaining = new Map(route.items.map(it => [it, it.qty]));

        // Pass 1 — Hands (profit order, IsCarried items only, 1 stack max, no weight cost)
        for (const it of route.items) {
          const d = itemData[it.itemName];
          if (!d?.isCarried || hands.slots <= 0) continue;
          const qty = Math.min(remaining.get(it), Math.max(1, d.maxStackSize));
          it.handsQty = qty;
          hands.slots -= 1;
          remaining.set(it, remaining.get(it) - qty);
        }

        // Pass 2 — Backpack (weight ascending, !IsCarried items only)
        // Sorting by weight ascending means lightest items fill the limited backpack first,
        // maximising the total number of units that fit in the weight-limited compartment.
        const byWeight = route.items
          .filter(it => !itemData[it.itemName]?.isCarried)
          .sort((a, b) =>
            (itemData[a.itemName]?.weightG ?? 0) - (itemData[b.itemName]?.weightG ?? 0)
          );
        for (const it of byWeight) {
          const d = itemData[it.itemName] ?? { weightG: 0, maxStackSize: 1 };
          const qty = allocateToCompartment(remaining.get(it), d.maxStackSize, d.weightG, backpack);
          it.backpackQty = qty;
          remaining.set(it, remaining.get(it) - qty);
        }

        // Pass 3 — Vehicle (profit order, all items)
        for (const it of route.items) {
          const d = itemData[it.itemName] ?? { weightG: 0, maxStackSize: 1 };
          const qty = allocateToCompartment(remaining.get(it), d.maxStackSize, d.weightG, vehicle);
          it.vehicleQty = qty;
          remaining.set(it, remaining.get(it) - qty);
        }

        // Commit final quantities
        for (const it of route.items) {
          it.qty         = it.handsQty + it.backpackQty + it.vehicleQty;
          it.totalProfit = it.profitPerUnit * it.qty;
        }
      } else {
        // No capacity data — treat all qty as vehicle for display consistency
        for (const it of route.items) {
          it.vehicleQty = it.qty;
        }
      }

      // Route total profit counts only profitable items (break-even don't inflate ranking)
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
