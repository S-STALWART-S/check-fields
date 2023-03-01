/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { describe, expect } from "@jest/globals";

import { CheckFields, ioFieldMaker } from "../src/index";

const defaultErrors = {
  dataFieldInvalidType: {
    reason: "DATA_FIELD_INVALID_TYPE",
  },
  dataFieldsMissing: {
    reason: "DATA_FIELDS_MISSING",
  },
  dataFieldsOverload: {
    reason: "DATA_FIELDS_OVERLOAD",
  },
  dataNotDefined: {
    reason: "DATA_NOT_DEFINED",
  },
  schemaInvalid: {
    reason: "SCHEMA_INVALID",
  },
  schemaInvalidType: {
    reason: "SCHEMA_INVALID_TYPE",
  },
  schemaNotDefined: {
    reason: "SCHEMA_NOT_DEFINED",
  },
};

const checker = (data, schema, expectedError) => {
  try {
    new CheckFields(data, schema).prepare().check();
    throw "test failed";
  } catch (error) {
    // console.log("error:::", error);
    expect(error.reason).toEqual(expectedError.reason);
  }
};

describe("should throw error if some fields is not defined - DATA_FIELDS_MISSING", () => {
  it("", () => {
    const data = {
      foo: "foo",
      // 'bar' is missing
    };
    const schema = {
      foo: ioFieldMaker().type("string").build(),
      bar: ioFieldMaker().type("boolean").build(),
    };

    checker(data, schema, defaultErrors.dataFieldsMissing);
  });
});

describe("should throw error if data is overloaded - DATA_FIELDS_OVERLOAD", () => {
  it("if some field is overloaded", () => {
    const data = {
      foo: "foo",
      bar: "bar", // 'bar' is not defined in schema
    };
    const schema = {
      foo: ioFieldMaker().type("number").build(),
    };

    checker(data, schema, defaultErrors.dataFieldsOverload);
  });

  it("if all data is overloaded when schema is empty object", () => {
    const data = {
      // foo should be empty object as defined in schema
      foo: {
        bar: "bar",
      },
    };
    const schema = {
      foo: ioFieldMaker().type("object").value({}).build(),
    };

    checker(data, schema, defaultErrors.dataFieldsOverload);
  });

  it("if all data is overloaded when schema is empty array", () => {
    const data = {
      // foo should be empty array as defined in schema
      foo: [
        {
          bar: "bar",
        },
      ],
    };
    const schema = {
      foo: ioFieldMaker().type("array").value([]).build(),
    };

    checker(data, schema, defaultErrors.dataFieldsOverload);
  });
});

describe("should throw error if data has mistyping property - DATA_FIELD_INVALID_TYPE", () => {
  it("", () => {
    const data = {
      // foo must be a number as defined in the schema
      foo: "string value",
    };
    const schema = {
      foo: ioFieldMaker().type("number").build(),
    };

    checker(data, schema, defaultErrors.dataFieldInvalidType);
  });
});

describe("", () => {
  it("should throw error if data is not defined - DATA_NOT_DEFINED", () => {
    const data = undefined;
    const schema = {
      foo: ioFieldMaker().type("string").build(),
    };

    checker(data, schema, defaultErrors.dataNotDefined);
  });
});

describe("should throw error when schema field type is not match with value - SCHEMA_INVALID", () => {
  it("when object type has a array value", () => {
    const data = {
      foo: {
        bar: "bar",
      },
    };
    const schema = {
      foo: ioFieldMaker()
        .type("object")
        .value([
          {
            bar: ioFieldMaker().type("string").build(),
          },
        ])
        .build(),
    };

    checker(data, schema, defaultErrors.schemaInvalid);
  });
});

describe("should throw error if schema is not defined", () => {
  it("", () => {
    const data = { foo: "foo" };
    const schema = undefined;

    checker(data, schema, defaultErrors.schemaNotDefined);
  });
});

describe("should throw error if the schema has a mistyped value - SCHEMA_INVALID", () => {
  it("when primitive type has a value", () => {
    const data = { foo: "foo" };
    const schema = {
      foo: ioFieldMaker()
        .type("string")
        .value({
          // primitive types will throw an error with any value, even with an empty object or array
        })
        .build(),
    };

    checker(data, schema, defaultErrors.schemaInvalid);
  });
});

describe("should throw error if the schema has a invalid type - SCHEMA_INVALID_TYPE", () => {
  it("", () => {
    const data = { foo: "foo" };
    const schema = {
      foo: ioFieldMaker().type("invalid type...").build(),
    };

    checker(data, schema, defaultErrors.schemaInvalidType);
  });
});
