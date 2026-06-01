# Quizify

A simple, modern quiz app that runs entirely in your browser. Load a quiz from a JSON file, answer one question at a time, and get your score with explanations for anything you missed. No accounts, no servers, no uploads. Your files never leave the browser.

**Live demo:** https://hqkh4nh.github.io/quizify/

## Features

- Drag and drop (or browse) a JSON quiz file
- Single-answer and multiple-answer questions
- One question at a time with a progress bar
- Score summary plus a review of incorrect answers with explanations
- Light and dark mode
- Full UTF-8 support with safe wrapping for long text, code snippets, and any language

## Quiz file format

A quiz is a JSON object with a `questions` array. Each question has `options` (an array of strings) and an `answer` (a 0-based index, or an array of indices for multiple answers). `title` and `explanation` are optional.

```json
{
  "title": "My Quiz",
  "questions": [
    {
      "question": "Which is a JS runtime?",
      "type": "single",
      "options": ["Node.js", "Django"],
      "answer": 0,
      "explanation": "Node.js runs JavaScript outside the browser."
    },
    {
      "question": "Select the even numbers.",
      "type": "multi",
      "options": ["1", "2", "3", "4"],
      "answer": [1, 3]
    }
  ]
}
```

Scoring is exact match: for multiple-answer questions you must select every correct option and nothing else. Invalid files show a clear message about what to fix.

## Getting started

Requires Node.js 20+.

```bash
npm install      # install dependencies
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run preview  # preview the production build
npm test         # run unit tests
npm run lint     # run ESLint
```

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS with shadcn UI components
- Zustand for state, Zod for schema validation
- Sonner for toasts, lucide-react for icons
- Vitest for unit tests

The app is 100% client-side. Files are read locally with the FileReader API.

## Deployment

The project ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys to GitHub Pages on every push to `master`. To enable it, set **Settings - Pages - Source** to **GitHub Actions**. The Vite `base` is relative, so the build works under any path without extra configuration.

## License

MIT License. See [LICENSE](LICENSE).
