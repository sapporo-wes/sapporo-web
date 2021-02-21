export type ValidResult = boolean | string
export type Rule = (value: string) => ValidResult
export type FormComponent = {
  validate: () => boolean
  reset: () => boolean
  resetValidation: () => boolean
}
