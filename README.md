# MongooseJsLab5Template

## Initial Machine Setup

1. **Install NodeJS 18**

## Get Started

1. **Install** `npm install`
2. **Configure connection to MongoDB Atlas** - replace `<Put your connection string here>` by connection string to MongoDb Atlas in `config/db.config.js`
3. **Run the app** `npm run start`

### Linting

Code linters: [eslint](https://eslint.org/) with pluggable [Prettier](https://github.com/jlongster/prettier) configs.

- run: `npm run lint`
- fix JS errors: `lint:fix`
  Eslint configuration file: [here](.eslintrc.json)

### Testing

We use Jest for unit tests. Test file for .js should be named as .test.js and be placed along with code file.

- run unit tests: `npm run test`
- run tests with coverage: `npm run test:cover`

Refer to this [document](https://jestjs.io/docs/en/api) for more details.
