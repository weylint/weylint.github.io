# API: `/allItems`

**Method:** `GET`
**URL:** `https://white-tiger.play.eco/api/v1/plugins/EcoPriceCalculator/allItems`
**JS helper:** `WhiteTigerAPI.fetchAllItems()`

Returns every item the server knows about, keyed by display name.

## Response shape

```json
{
  "AllItems": {
    "<DisplayName>": {
      "Tags": ["<tag>", "..."],
      "Fuel": 0.0,
      "PropertyInfos": {
        "Weight":       { "Int32": "<grams>" },
        "HasWeight":    { "Boolean": "True|False" },
        "MaxStackSize": { "Int32": "<units per slot>" },
        "IsCarried":    { "Boolean": "True|False" },
        "DisplayName":  { "LocString": "<DisplayName>" },
        "Hidden":       { "Boolean": "True|False" },
        "...": "..."
      }
    }
  }
}
```

## Fields we use

| Field | Path | Notes |
|-------|------|-------|
| `Weight` | `PropertyInfos.Weight.Int32` | Item weight in **grams**. Convert to kg: `/ 1000`. |
| `HasWeight` | `PropertyInfos.HasWeight.Boolean` | `"False"` means the item is weightless (UI use only; `Weight` will be `"0"`). |
| `MaxStackSize` | `PropertyInfos.MaxStackSize.Int32` | Max units per inventory slot. Always ≥ 1. |
| `IsCarried` | `PropertyInfos.IsCarried.Boolean` | `"True"` = item occupies the player's **hands** slot (1 slot, no weight limit). `"False"` = item goes in backpack/vehicle. |

## Inventory compartment model

| Compartment | Slots | Weight limit | Eligible items |
|-------------|-------|-------------|----------------|
| Hands | 1 | none | `IsCarried: true` only |
| Backpack | 16 (default) | 25 kg (default) | `IsCarried: false` only |
| Vehicle(s) | configurable | configurable | all items |

Fill order per route (lightest items fill the backpack first to maximise unit count):
1. **Hands** — 1 stack (up to `MaxStackSize` units), profit order, no weight cost
2. **Backpack** — weight-ascending order, slot + weight budget
3. **Vehicle(s)** — profit order, summed slot + weight budgets

## Example: item with weight

```json
"Banana Shirt": {
  "Tags": ["Clothes", "Product"],
  "PropertyInfos": {
    "Weight":       { "Int32": "100" },
    "HasWeight":    { "Boolean": "True" },
    "MaxStackSize": { "Int32": "1" },
    "IsCarried":    { "Boolean": "False" }
  }
}
```
→ 0.1 kg per unit, 1 per slot, goes in backpack/vehicle.

## Example: weightless item

```json
"Backpack": {
  "Tags": [],
  "PropertyInfos": {
    "Weight":       { "Int32": "0" },
    "HasWeight":    { "Boolean": "False" },
    "MaxStackSize": { "Int32": "100" },
    "IsCarried":    { "Boolean": "False" }
  }
}
```
→ Weightless, 100 per slot, goes in backpack/vehicle (occupies slots but no weight budget).

## Extraction snippet

```js
const itemData = {};
for (const [name, item] of Object.entries(data.AllItems)) {
  const p = item.PropertyInfos;
  itemData[name] = {
    weightG:      parseInt(p.Weight?.Int32      ?? 0),
    maxStackSize: parseInt(p.MaxStackSize?.Int32 ?? 1),
    isCarried:    p.IsCarried?.Boolean === 'True',
  };
}
```
