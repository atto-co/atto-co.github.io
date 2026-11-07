# atto-co.github.io

Official Atto company website, product information, and commercial platform documentation.

## Project focus

Public product navigation, company information, and infrastructure service documentation.

## Ecosystem architecture

This is a proposed component of Atto's commercial ecosystem. Keep the boundary clear between the independent [AttoLang language and runtime](https://github.com/atto-lang) and optional hosted services. Describe API versions, user/tenant permissions, state and resource lifecycles, and interoperability requirements as they are implemented.

## Validation and deployment

Follow checked-in project manifests, tests, and CI for verified build, release and deployment commands. Avoid inventing executable instructions; verify credentials, service isolation and rollback behavior prior to release.

## Project status

The scope above is a planning description, not evidence of implemented functionality or a deployed service.

## Links

- [Atto company](https://github.com/atto-co)
- [AttoLang](https://github.com/atto-lang)

## AttoLang Playground

The company site's proposed `/play/` route redirects to the open-language [browser playground](https://atto-lang.github.io/play/). The implementation lives in [atto-lang/atto-lang.github.io PR #1](https://github.com/atto-lang/atto-lang.github.io/pull/1) and its canonical runtime project is [atto-lang/atto-playground PR #1](https://github.com/atto-lang/atto-playground/pull/1). Treat the site as a preview until GitHub Pages deployment and live browser execution are verified. The editor compiles and executes an explicit scalar M0 subset on-device without a compilation server.
