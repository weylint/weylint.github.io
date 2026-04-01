# API: `/laws`

Base URL: `https://white-tiger.play.eco/api/v1/laws`

No shared JS module — called directly via `fetch`.

---

## `GET /laws`

Returns all laws on the server (including removed ones).

**URL:** `https://white-tiger.play.eco/api/v1/laws`

### Response shape

```json
[
  {
    "Id":              121644,
    "Name":            "string",
    "State":           "Active",
    "Creator":         "string",
    "UserDescription": "string",
    "Description":     "string"
  }
]
```

### Fields

| Field | Type | Notes |
|-------|------|-------|
| `Id` | number | Unique law ID. Use with `/laws/{id}` to fetch a single law. |
| `Name` | string | Display name of the law. |
| `State` | string | `"Active"`, `"Proposed"`, or `"Removed"`. Filter out `"Removed"` for display. |
| `Creator` | string | Player who created the law. |
| `UserDescription` | string | Human-readable summary written by the creator. May contain Eco rich-text markup. |
| `Description` | string | Full machine-generated law text. Contains Eco rich-text markup and structured law code (`on event`, `if`, `then`, etc.). |

### Usage notes

- Filter `State !== 'Removed'` before rendering.
- Sort order: `Active` before `Proposed`, then alphabetically by `Name`.
- `UserDescription` and `Description` both contain Eco markup — pass through `formatEcoText()` before inserting into the DOM.

---

## `GET /laws/{id}`

Returns a single law by its numeric ID.

**URL:** `https://white-tiger.play.eco/api/v1/laws/121644`

### Response shape

Same object shape as a single element of the `/laws` array.

```json
{
  "Id":              121644,
  "Name":            "string",
  "State":           "Active",
  "Creator":         "string",
  "UserDescription": "string",
  "Description":     "string"
}
```

### Usage notes

- Returns `404` if the ID does not exist.
- Used by `law-view.html` via `?id=XXXXX` query param.

---

## Eco markup in `Description`

The `Description` field uses Unity/Eco rich-text tags. Key constructs:

| Tag | Meaning |
|-----|---------|
| `<style="Header">…</style>` | Section heading |
| `<style="Government">…</style>` | Government entity name |
| `<style="Currency">…</style>` | Currency amount |
| `<style="BankAccount">…</style>` | Bank account reference |
| `<style="Positive">…</style>` | Positive/success value |
| `<color=#RRGGBB[AA]>…</color>` | Arbitrary color |
| `<link="…"><icon …>…</icon></link>` | Chip (item/skill reference) |
| `<foldout><linktext>…</linktext><title>…</title>…</foldout>` | Expandable tooltip |
| `<i>…</i>` | Italic — used for prose explanations embedded in law code |
| `on event …` / `on every …` | Law trigger |
| `if … then …` | Conditional block |
| `else if …` / `and if …` / `else …` | Branch keywords |
| `and` / `or` / `not` | Boolean operators |
