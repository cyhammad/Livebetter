# Contributing to live-better-web

Hello, and thank you for reading this documenting!

The following is a set of guidelines for working within this project. It is a living document, meaning that it is open to change at any time if the team feels it should. That said, most of these guidelines are meant to help with project organization, understandability, and ease-of-development. We should not add anything to this document that could be enforced by Prettier and ESLint.

## Conventions

1. Boolean variables, and functions whose return value is a boolean, should always start with a verb that indicates it is a boolean. These include words like "is", "has", "was", "did", "can", "will", and "should" (this list is not exhaustive). For example, `isVisible`, `isOpen`, or `isValid`.
1. Don't use default exports unless absolutely necessary. Always use named exports. This prevents accidental renaming when importing, which can make things difficult to find.
1. Always use absolute paths in imports. This helps when moving files around, and when needed to do a mass rename of a file
1. Put utility functions in the `lib/` folder
   1. Put client-side-only utility functions in `lib/client`
   1. Put server-side-only utility functions in `lib/server`
   1. Never use server-side functions on the client, or vice versa
1. Put hooks in the `hooks/` folder
1. Contexts should also be in `hooks/` and should export a `use{Name}Context` hook (filename will need the .tsx extension)
1. Never nest components in the `components/` folder
1. Component names should be descriptive and globally identifiable
1. Never use `@ts-ignore`
1. Never disable lint rules unless absolutely necessary, and always leave a comment about why it was necessary
1. Everything should be 80 chars width, including comments if possible. Some comments that include links cannot be 80 chars so this is the exception.
1. Use `import type` wherever possible

## Commit messages

1. Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) (`<type>(<scope>): <message>`)
   1. `<type>` should be `feat`, `fix`, or `chore`
      1. **feat** - any user-facing improvement
      1. **fix** - any bug fix or change to an existing feature that makes it "more correct" even, if it was not part of the original specification
      1. **chore** - any non-user-facing change
   1. `<scope>` is optional, but if specified should be one word, and all lowercase. E.g., "cart", "menu", "email", "orders", etc.
   1. `<message>` should be succinct and effectively describe the contents of the change. Start messages with a capital letter and treat them like a human-readable message to your future self. Commit messages should always use "imperative present tense" or "imperative mood", and should **not** use past tense.
      - Examples
        1. 👎 "Cart changes" (not specific enough)
        1. 👎 "Added subtotal to cart" (uses past tense instead of imperative present tense)
        1. 👍 "Add subtotal to cart"

## Next.js "foot guns"

> Don't shoot yourself in the foot with these!

1. Window does not exist in Next.js under the second render (example of dealing with this https://nextjs.org/docs/migrating/from-create-react-app#single-page-app-spa)
1. Be very careful about the imports you use on the front-end vs back-end code.
1. Hydration errors are common and difficult to fix. Always make sure that what is rendered on the server will render the same way on the client.

## Firebase

1. Firestore collection names should use snake_case
1. Firestore property names should use camelCase
