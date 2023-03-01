/* eslint-disable @typescript-eslint/no-explicit-any */

import { customTypeof, CustomTypeof } from "custom-typeof";

const errorThrower = <T>(condition: boolean, error: T) => {
  if (condition) {
    if (typeof error === "function") throw error();

    throw error;
  }
};

const upperFirst = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

const acceptableTypes = ["string", "boolean", "number", "array", "object"];

type IoError = {
  reason: string;
  [prop: string]: any;
};

interface IoErrors {
  dataFieldInvalidType: IoError;
  dataFieldsMissing: IoError;
  dataFieldsOverload: IoError;
  dataNotDefined: IoError;
  schemaInvalid: IoError;
  schemaInvalidType: IoError;
  schemaNotDefined: IoError;
  [prop: string]: IoError;
}

const defaultErrors: IoErrors = {
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

type IoFields = object;

class CheckFields {
  errors: IoErrors;

  constructor(
    public ioData: IoFields,
    public requiredFields: IoFields,
    errors: IoErrors = defaultErrors
  ) {
    this.errors = {
      ...defaultErrors,
      ...errors,
    };
  }

  prepare() {
    this.throwErrorIfRequiredFieldsIsNotDefined(
      this.requiredFields,
      this.errors.schemaNotDefined
    );

    this.throwErrorIfIoDataIsNotDefined(
      this.errors.dataNotDefined,
      this.ioData,
      this.requiredFields
    );

    return this;
  }

  throwErrorIfRequiredFieldsIsNotDefined(
    requiredFields: IoFields,
    error: IoError
  ) {
    errorThrower<IoError>(customTypeof.isUndefined(requiredFields), error);
  }

  throwErrorIfIoDataIsNotDefined(
    error: IoError,
    ioData: IoFields,
    requiredFields: IoFields
  ) {
    errorThrower(customTypeof.isUndefined(ioData), {
      ...error,
      ioData,
      requiredFields,
    });
  }

  check() {
    this.checkIoFieldsDefinition();
    this.checkLength();
    this.checkRequiredFields();
  }

  checkIoFieldsDefinition() {
    errorThrower(!this.ioData, {
      ...this.errors.dataFieldsMissing,
      ioData: this.ioData,
      requiredFields: this.requiredFields,
    });
    errorThrower(!this.requiredFields, {
      ...this.errors.dataFieldsMissing,
      ioData: this.ioData,
      requiredFields: this.requiredFields,
    });
  }

  checkLength() {
    const ioFieldsLength = Object.keys(this.ioData).length;
    const requiredFieldsLength = Object.keys(this.requiredFields).length;

    if (ioFieldsLength !== requiredFieldsLength) {
      const errorBase = {
        ioFieldsLength,
        requiredFieldsLength,
        ioData: this.ioData,
        requiredFields: this.requiredFields,
      };

      const missingError = {
        ...errorBase,
        ...this.errors.dataFieldsMissing,
      };
      errorThrower(ioFieldsLength < requiredFieldsLength, missingError);

      throw {
        ...errorBase,
        ...this.errors.dataFieldsOverload,
      };
    }
  }

  checkRequiredFields() {
    Object.entries(this.requiredFields).forEach(([key, requiredField]) => {
      this.checkRequiredFieldType(key, requiredField.type);
      const isValueDefined = requiredField.value;
      this.checkSchema(requiredField.type, requiredField.value);

      const ioValue = (this.ioData as any)[key];
      this.throwErrorIfIoFieldIsUndefined(key, ioValue);
      this.checkIoDataFieldType(key, ioValue, requiredField.type);

      if (isValueDefined) {
        this.checkNestedFields(requiredField.value, ioValue);
      }
    });
  }

  throwErrorIfIoFieldIsUndefined(ioFieldKey: string, ioFieldValue: any) {
    errorThrower(customTypeof.isUndefined(ioFieldValue), {
      ...this.errors.dataFieldsMissing,
      ioFieldIsUndefined: true,
      ioFieldKey,
      ioData: this.ioData,
      requiredFields: this.requiredFields,
    });
  }

  checkRequiredFieldType(requiredFieldKey: string, requiredFieldType: string) {
    if (
      customTypeof.isString(requiredFieldType) &&
      acceptableTypes.includes(requiredFieldType)
    )
      return;

    throw {
      ...this.errors.schemaInvalidType,
      requiredField: {
        key: requiredFieldKey,
        type: requiredFieldType,
      },
      acceptableTypes,
    };
  }

  checkIoDataFieldType(
    requiredFieldKey: string,
    ioFieldValue: any,
    requiredFieldType: string
  ) {
    const typeofMethodName = `is${upperFirst(
      requiredFieldType
    )}` as keyof CustomTypeof;

    if (customTypeof[typeofMethodName](ioFieldValue)) return;

    throw {
      ...this.errors.dataFieldInvalidType,
      ioField: {
        expectedType: requiredFieldType,
        receivedType: typeof ioFieldValue,
        key: requiredFieldKey,
        value: ioFieldValue,
      },
      ioData: this.ioData,
      requiredFields: this.requiredFields,
    };
  }

  checkSchema(schemaFieldType: string, schemaFieldValue: any) {
    const { type } = customTypeof.check(schemaFieldValue);
    const receivedType = type.isObject
      ? "object"
      : //prettier-ignore
      type.isArray
        ? "array"
        : typeof schemaFieldValue;

    const errorBase = {
      ...this.errors.schemaInvalid,
      requiredFields: schemaFieldValue,
      receivedType,
    };

    if (["object", "array"].includes(schemaFieldType) && !schemaFieldValue) {
      throw {
        ...errorBase,
        expectedValue: "object | array",
        receivedValue: schemaFieldValue,
      };
    }
    if (
      schemaFieldType === "object" &&
      customTypeof.isNotObject(schemaFieldValue)
    ) {
      throw {
        ...errorBase,
        expectedType: "object",
      };
    }
    if (
      schemaFieldType === "array" &&
      customTypeof.isNotArray(schemaFieldValue)
    ) {
      throw {
        ...errorBase,
        expectedType: "array",
      };
    }
    if (
      schemaFieldType !== "object" &&
      schemaFieldType !== "array" &&
      schemaFieldValue
    ) {
      throw {
        ...errorBase,
        expectedType: "object | array",
      };
    }
  }
  checkNestedFields(requiredFieldValue: any, ioFieldValue: any) {
    if (customTypeof.isObject(requiredFieldValue))
      this.checkObjectFields(ioFieldValue, requiredFieldValue);
    else if (customTypeof.isArray(requiredFieldValue))
      this.checkArrayFields(ioFieldValue, requiredFieldValue[0] || {});
  }

  checkObjectFields(ioData: object, requiredFields: object) {
    checkFields(ioData, requiredFields, this.errors);
  }

  checkArrayFields(ioData: any[], requiredFields: object) {
    ioData.forEach((item: any) => {
      checkFields(item, requiredFields, this.errors);
    });
  }

  checkFieldsRecallArgHelper(ioData: any, requiredFields: any) {
    return {
      ioData,
      requiredFields,
      errors: this.errors,
    };
  }
}

type FieldValueType = object | object[];
type FieldType = "string" | "boolean" | "number" | "array" | "object";

interface Field {
  type: FieldType;
  value?: FieldValueType;
  required: boolean;
}

class IoFieldMaker {
  private field: Field;

  constructor() {
    this.field = {
      required: true,
      type: "object",
    };
  }

  type(type: FieldType) {
    this.field.type = type;
    return this;
  }

  value(value: FieldValueType) {
    this.field.value = value;
    return this;
  }

  required(required = true) {
    this.field.required = required;
    return this;
  }

  optional() {
    this.field.required = false;
    return this;
  }

  build(): Field {
    if (customTypeof.isUndefined(this.field.value)) {
      const { value, ...rest } = this.field;
      return rest;
    }
    return this.field;
  }
}

const ioFieldMaker = () => new IoFieldMaker();

const checkFields = (
  ioData: IoFields,
  requiredFields: IoFields,
  errors: IoErrors
) => new CheckFields(ioData, requiredFields, errors).prepare().check();

export { checkFields, CheckFields, ioFieldMaker, IoFieldMaker };
