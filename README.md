# CheckFields

A simple library for validating input data based on a predefined schema.

## DO NOT USE IN PRODUCTION

It's not stable yet, there's also nothing cool about it. So please use other libraries.

## Installation

This library can be installed via npm:

```sh
npm install check-fields
```

or

```sh
yarn add check-fields
```

## Usage

Here's an example of how to use this library:

```js
import { CheckFields } from "check-fields";

// Define your input data schema and required fields
const data = {
  name: "sara",
  age: 28,
  email: "sara@me.com",
  address: {
    street: "Park Ave, New York, NY, USA",
    city: "new york city",
    state: "new york",
  },
};

const schema = {
  name: { type: "string" },
  age: { type: "number" },
  address: {
    type: "object",
    value: {
      street: { type: "string" },
      city: { type: "string" },
      state: { type: "string" },
    },
  },
};

// Validate input data against the schema
const checker = new CheckFields(data, schema);
checker.prepare().check();
```

In this example, schema defines the input data, which includes the name, age, email, and address fields. Schema specifies which fields are required for input data and defines their data types.

The CheckFields constructor takes the data and schema objects as parameters, and returns a checker object that can be used to validate the input data.

The prepare() method is used to prepare the validation. If the input data is valid, this method returns without throwing an error. Otherwise, an error is thrown with a message that describes the problem with the input data.

## Custom Errors

You can pass custom error messages to CheckFields by defining an errors object. For example:

```js
const customErrors = {
  schemaInvalidType: {
    reason: "INVALID_TYPE",
    message: "The {key} field must be of type {type}.",
  },
};

const checker = new CheckFields(data, schema, customErrors);
```

In this example, the customErrors object provides a custom error message for the schemaInvalidType error. The {key} and {type} placeholders will be replaced with the corresponding values at runtime.

More examples are written in test files.

## License

This library is released under the MIT License. See LICENSE for details.
