/* eslint-disable @typescript-eslint/no-explicit-any */

import { CustomTypeof, customTypeof } from "custom-typeof";

const errorThrower = <T>(condition: boolean, error: T) => {
  if (condition) {
    if (typeof error === "function") throw error();

    throw error;
  }
};

function upperFirst(string: string) {
  const chr = string.charAt(0);

  return chr.toUpperCase() + string.slice(1);
}

const acceptableTypes = ["string", "boolean", "number", "array", "object"];

type IoError = {
  reason: string;
  [prop: string]: any;
};

interface IoErrors {
  ioDataFieldInvalidType: IoError;
  ioDataNotDefined: IoError;
  fieldsMissing: IoError;
  fieldsOverload: IoError;
  requiredFieldInvalidType: IoError;
  requiredFieldsInvalid: IoError;
  requiredFieldsNotDefined: IoError;
  [prop: string]: IoError;
}

const defaultErrors: IoErrors = {
  fieldsMissing: {
    reason: "FIELDS_MISSING",
  },
  fieldsOverload: {
    reason: "FIELDS_OVERLOAD",
  },
  ioDataFieldInvalidType: {
    reason: "IO_DATA_FIELD_INVALID_TYPE",
  },
  ioDataNotDefined: {
    reason: "IO_DATA_NOT_DEFINED",
  },
  requiredFieldInvalidType: {
    reason: "REQUIRED_FIELD_INVALID_TYPE",
  },
  requiredFieldsInvalid: {
    reason: "IO_DATA_FIELDS_INVALID",
  },
  requiredFieldsNotDefined: {
    reason: "REQUIRED_FIELDS_NOT_DEFINED",
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
      this.errors.requiredFieldsNotDefined
    );

    this.throwErrorIfIoDataIsNotDefined(
      this.errors.ioDataNotDefined,
      this.ioData,
      this.requiredFields
    );

    this.check();
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
      ...this.errors.fieldsMissing,
      ioData: this.ioData,
      requiredFields: this.requiredFields,
    });
    errorThrower(!this.requiredFields, {
      ...this.errors.fieldsMissing,
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
        ...this.errors.fieldsMissing,
      };
      errorThrower(ioFieldsLength < requiredFieldsLength, missingError);

      throw {
        ...errorBase,
        ...this.errors.fieldsOverload,
      };
    }
  }

  checkRequiredFields() {
    for (const requiredFieldKey in this.requiredFields) {
      const ioFieldValue = (this.ioData as any)[requiredFieldKey];
      this.throwErrorIfIoFieldIsUndefined(requiredFieldKey, ioFieldValue);

      const { type: requiredFieldType, value: requiredFieldValue } = (
        this.requiredFields as any
      )[requiredFieldKey];

      this.checkRequiredFieldType(requiredFieldKey, requiredFieldType);

      this.checkIoDataFieldType(
        requiredFieldKey,
        ioFieldValue,
        requiredFieldType
      );

      if (requiredFieldValue) {
        this.checkRequiredFieldTypeWhenHasValue(
          requiredFieldType,
          requiredFieldValue
        );

        this.checkNestedFields(requiredFieldValue, ioFieldValue);
      }
    }
  }

  throwErrorIfIoFieldIsUndefined(ioFieldKey: string, ioFieldValue: any) {
    errorThrower(customTypeof.isUndefined(ioFieldValue), {
      ...this.errors.fieldsMissing,
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
      ...this.errors.requiredFieldInvalidType,
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
      ...this.errors.ioDataFieldInvalidType,
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

  checkRequiredFieldTypeWhenHasValue(
    requiredFieldType: string,
    requiredFieldValue: any
  ) {
    const receivedType = customTypeof.isObject(requiredFieldValue)
      ? "object"
      : "array";

    const errorBase = {
      ...this.errors.requiredFieldsInvalid,
      requiredFields: requiredFieldValue,
      receivedType,
    };

    if (requiredFieldType !== "object" && requiredFieldType !== "array") {
      throw {
        ...errorBase,
        expectedType: receivedType,
      };
    }

    if (
      requiredFieldType === "object" &&
      customTypeof.isNotObject(requiredFieldValue)
    ) {
      throw {
        ...errorBase,
        expectedType: "object",
      };
    }
    if (
      requiredFieldType === "array" &&
      customTypeof.isNotArray(requiredFieldValue)
    ) {
      throw {
        ...errorBase,
        expectedType: "array",
      };
    }
  }

  checkNestedFields(requiredFieldValue: any, ioFieldValue: any) {
    if (customTypeof.isObject(requiredFieldValue))
      this.checkObjectFields(ioFieldValue, requiredFieldValue);
    else if (customTypeof.isArray(requiredFieldValue))
      this.checkArrayFields(ioFieldValue, requiredFieldValue[0]);
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

const checkFields = (
  ioData: IoFields,
  requiredFields: IoFields,
  errors: IoErrors
) => new CheckFields(ioData, requiredFields, errors).prepare();

export { CheckFields, checkFields };
