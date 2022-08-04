# Contributing to live-better-web

Hello, and thank you for reading this document!

The following is a set of guidelines for working within this project. It is a living document, meaning it is open to change at any time if the team feels it should. These guidelines are meant to help with project organization, understandability, and ease-of-development.

_Prettier and ESLint are fantastic tools for enforcing stylistic guidelines and best practices. Prior to adding a new rule to this document, we should **always check if there is a way to support that rule automatically through Prettier or ESLint**._

## Conventions

1. Boolean variables, and functions whose return value is a boolean, should always start with a verb that indicates it is a boolean. These include words like "is", "has", "was", "did", "can", "will", and "should" (this list is not exhaustive). For example, `isVisible`, `didSubmitForm`, or `shouldRequireOtp`.
2. This project uses "strict camel case", which means abbreviations should also be camelCase. For example, `didFbiInvestiveCia`, not `didFBIInvestigateCIA`.
3. Don't use default exports unless absolutely necessary. Always use named exports. This prevents accidental renaming when importing, which can make things difficult to find.
4. Always use absolute paths in imports. This helps when moving files around, and when needed to do a mass rename of a file.
   - 👎 `import { isOpen } from './isOpen';`
   - 👍 `import { isOpen } from 'lib/isOpen';`
5. Put utility functions in the `lib/` folder.
   1. Put client-side-only utility functions in `lib/client`.
   1. Put server-side-only utility functions in `lib/server`.
   1. Never use server-side functions on the client, or vice versa.
6. Put hooks in the `hooks/` folder.
7. Contexts should also be in `hooks/` and should export a `use{Name}Context` hook (filename will need the .tsx extension).
8. Never nest components in the `components/` folder.
9. Component names should be descriptive and globally identifiable.
10. Never use `@ts-ignore`.
11. Never disable lint rules unless absolutely necessary, and always leave a comment about why it was necessary.
12. Everything should be 80 chars width, including comments if possible. Some comments that include links cannot be 80 chars so this is the exception.
13. Use `import type` wherever possible.
14. Don't commit commented code. Remove the code altogether! This keeps the project clean and you can always get the code back from git.

## Commit messages

1. Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) (`<type>(<scope>): <message>`)
   1. `<type>` should be `feat`, `fix`, or `chore`
      1. **feat** - any user-facing improvement
      1. **fix** - any bug fix or change to an existing feature that makes it "more correct", even if it was not part of the original specification ("fix" does not have any negative connotations and should be used without hesitation when it applies)
      1. **chore** - any non-user-facing change
   1. `<scope>` is optional, but if specified should be one word, and all lowercase. E.g., "cart", "menu", "email", "orders", etc. If multiple words are required, separate them with hyphens.
   1. `<message>` should be succinct and effectively describe the contents of the change. Start messages with a capital letter and treat them like a human-readable message to your future self. Commit messages should always use "imperative present tense" or "imperative mood", and should **not** use past tense.
      - Examples
        1. 👎 "Cart changes" (not specific enough)
        1. 👎 "Added subtotal to cart" (uses past tense instead of imperative present tense)
        1. 👍 "Add subtotal to cart"

## Next.js "foot guns"

> Don't shoot yourself in the foot with these!

1. Window does not exist in Next.js until the second render, therefore any time `window` is referenced, it should always be within a `useEffect` hook (example of dealing with this https://nextjs.org/docs/migrating/from-create-react-app#single-page-app-spa).
1. Be very careful about the imports you use on the front-end vs back-end code.
1. Hydration errors are common and difficult to fix. Always make sure that what is rendered on the server will render the same way on the client.

## Firebase

1. Firestore collection names should use snake_case.
1. Firestore property names should use camelCase.
