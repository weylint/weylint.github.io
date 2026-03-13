# API: `/recipes`

**Method:** `GET`
**URL:** `https://white-tiger.play.eco/api/v1/plugins/EcoPriceCalculator/recipes`
**JS helper:** `WhiteTigerAPI.fetchRecipes()`

## Response shape

```json
{
  "Recipes": [
    {
      "Key":          "string",
      "CraftingTable": "string",
      "SkillNeeds": [
        { "Skill": "string", "Level": 1 }
      ],
      "Variants": [
        {
          "Name": "string",
          "Products": [
            { "Name": "string", "Ammount": 1 }
          ],
          "Ingredients": [
            { "Name": "string", "Tag": "string", "IsSpecificItem": true, "Ammount": 2 }
          ]
        }
      ]
    }
  ]
}
```

## Fields

| Field | Type | Notes |
|-------|------|-------|
| `Recipes` | array | Top-level array of all recipes. |
| `Key` | string | Unique recipe identifier. |
| `CraftingTable` | string | Name of the table where this recipe is crafted. |
| `SkillNeeds` | array | Required skills; empty if no skill needed. |
| `SkillNeeds[].Skill` | string | Skill name. |
| `SkillNeeds[].Level` | number | Minimum skill level required. |
| `Variants` | array | One entry per recipe variant (e.g. different upgrade tiers). |
| `Variants[].Name` | string | Variant label. |
| `Products` | array | Items produced by this variant. |
| `Products[].Name` | string | Output item name. |
| `Products[].Ammount` | number | Quantity produced. (Typo in API — double m.) |
| `Ingredients` | array | Items consumed by this variant. |
| `Ingredients[].IsSpecificItem` | boolean | `true` = use `Name`; `false` = use `Tag` (accepts any item with that tag). |
| `Ingredients[].Name` | string | Specific item name (when `IsSpecificItem` is true). |
| `Ingredients[].Tag` | string | Tag name (when `IsSpecificItem` is false). |
| `Ingredients[].Ammount` | number | Quantity consumed. (Typo in API — double m.) |
