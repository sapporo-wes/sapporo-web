<template>
  <v-form ref="form" class="flex-grow-1 mr-4">
    <template v-for="input in inputs">
      <!-- text field -->
      <template
        v-if="
          ['File', 'Directory', 'string', 'Any', 'int'].includes(input.type)
        "
      >
        <div :key="input.id" class="d-flex flex-column">
          <label>
            <span v-text="input.label || input.id" />
            <span class="red--text" v-text="input.required ? '*' : ''" />
          </label>
          <div class="d-flex ml-4 mb-2">
            <div class="d-flex flex-column flex-grow-1">
              <template v-for="(val, valInd) in values(input.id)">
                <v-text-field
                  :key="`${input.id}-textfield-${valInd}`"
                  :hint="valInd === 0 ? input.doc : ''"
                  :placeholder="`${input.type}`"
                  :rules="
                    input.required && !val ? ['This field is required'] : []
                  "
                  :type="formType(input.type)"
                  :value="val"
                  class="pt-1 mt-0"
                  persistent-hint
                  @input="updateValue($event, input.id, valInd)"
                />
              </template>
              <template v-if="input.secondaryFiles">
                <template
                  v-for="(secondaryFile, fileInd) in secondaryFiles(input.id)"
                >
                  <v-text-field
                    :key="`${input.id}-secondaryFiles-${fileInd}`"
                    :value="secondaryFilesValue(input.id, fileInd)"
                    :hint="`pattern: ${secondaryFile.pattern}`"
                    :placeholder="`SecondaryFiles${
                      secondaryFile.required ? ' *' : ''
                    }: ${secondaryFile.pattern}`"
                    :rules="secondaryFilesRules(input.id, fileInd)"
                    class="pt-1 mt-0 ml-4"
                    persistent-hint
                    @input="updateSecondaryFiles($event, input.id, fileInd)"
                  />
                </template>
              </template>
            </div>

            <div v-if="input.array" class="d-flex">
              <v-btn
                :color="$colors.grey.darken2"
                class="ml-6"
                outlined
                small
                width="100"
                @click.stop="addArray(input.id)"
              >
                <v-icon left v-text="'mdi-text-box-plus-outline'" />
                <span v-text="'Add'" />
              </v-btn>
              <v-btn
                :color="$colors.grey.darken2"
                class="ml-2"
                outlined
                small
                width="100"
                @click.stop="removeArray(input.id)"
              >
                <v-icon left v-text="'mdi-text-box-minus-outline'" />
                <span v-text="'Remove'" />
              </v-btn>
            </div>
          </div>
        </div>
      </template>

      <!-- select field -->
      <template v-if="input.type === 'boolean'">
        <template v-for="(val, valInd) in values(input.id)">
          <v-checkbox
            :key="`${input.id}-checkbox-${valInd}`"
            :hint="valInd === 0 ? input.doc : ''"
            :input-value="val"
            :label="`${input.label || input.id}`"
            persistent-hint
          />
        </template>
      </template>
    </template>
  </v-form>
</template>

<script lang="ts">
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import Vue from 'vue'
import { ParseResult } from '@/types/WES'

type Data = {
  valObj: Record<string, Array<string | number | boolean | null>>
  secondaryFilesObj: Record<string, Array<string | null>>
}
type Methods = {
  updateValue(val: string, id: string, valInd: number): void
  updateSecondaryFiles(val: string, id: string, fileInd: number): void
  addArray(id: string): void
  removeArray(id: string): void
  validate(): boolean
  toParams(): string
}
type Computed = {
  values(id: string): Array<string | number | boolean | null>
  formType(inputType: string): string
  secondaryFiles(id: string): Array<{ pattern: string; required: boolean }>
  secondaryFilesValue(id: string, fileInd: number): string | null
  secondaryFilesRules(id: string, fileInd: number): Array<string>
}

type Inputs = Exclude<ParseResult['inputs'], string | null>
type Unpacked<T> = T extends (infer U)[] ? U : T
type Input = Unpacked<Inputs>
type RequiredInput = Required<Input>
type RequiredInputs = RequiredInput[]

type Props = {
  inputs: RequiredInputs
}

const options: ThisTypedComponentOptionsWithRecordProps<
  Vue,
  Data,
  Methods,
  Computed,
  Props
> = {
  props: {
    inputs: {
      type: Array,
      required: true,
    },
  },

  data() {
    return {
      valObj: {},
      secondaryFilesObj: {},
      foo: true,
    }
  },

  computed: {
    values() {
      return (id: string) => {
        if (this.valObj[id]) {
          return this.valObj[id]
        } else {
          const defaultVal = this.inputs.find(
            (input) => input.id === id
          )?.default
          Vue.set(this.valObj, id, [defaultVal])
          return this.valObj[id]
        }
      }
    },

    formType() {
      return (inputType: string) => {
        switch (inputType) {
          case 'File':
          case 'Directory':
          case 'string':
          case 'Any':
            return 'text'
          case 'int':
            return 'number'
          default:
            return 'text'
        }
      }
    },

    secondaryFiles() {
      return (id: string) => {
        if (this.valObj[id]) {
          const secondaryFiles =
            this.inputs.find((input) => input.id === id)?.secondaryFiles || []
          if (!this.secondaryFilesObj[id]) {
            Vue.set(
              this.secondaryFilesObj,
              id,
              Array(secondaryFiles.length).fill(null)
            )
          }
          return secondaryFiles
        } else {
          return []
        }
      }
    },

    secondaryFilesValue() {
      return (id: string, fileInd: number) => {
        return this.secondaryFilesObj?.[id]?.[fileInd] || null
      }
    },

    secondaryFilesRules() {
      return (id: string, fileInd: number) => {
        const secondaryFiles = this.secondaryFiles(id)
        const secondaryFile = secondaryFiles[fileInd]
        const secondaryFilesValue = this.secondaryFilesValue(id, fileInd)
        const ext = `.${secondaryFilesValue?.split('.').pop()}`
        if (secondaryFile.required) {
          if (!secondaryFilesValue) {
            return ['This field is required']
          }
        }
        if (secondaryFilesValue && secondaryFile.pattern !== ext) {
          return [`It must have the extension ${secondaryFile.pattern}`]
        }

        return []
      }
    },
  },

  methods: {
    updateValue(val: string, id: string, valInd: number) {
      if (this.valObj[id]) {
        Vue.set(this.valObj[id], valInd, val)
      }
    },

    updateSecondaryFiles(val: string, id: string, fileInd: number) {
      if (this.secondaryFilesObj[id]) {
        Vue.set(this.secondaryFilesObj[id], fileInd, val)
      }
    },

    addArray(id: string) {
      if (this.valObj[id]) {
        this.valObj[id].push(null)
      }
    },

    removeArray(id: string) {
      if (this.valObj[id]) {
        if (this.valObj[id].length > 1) {
          this.valObj[id].pop()
        }
      }
    },

    validate() {
      if (this.$refs.form) {
        return (
          this.$refs.form as unknown as { validate: () => boolean }
        ).validate()
      }
      return false
    },

    toParams() {
      if (this.validate()) {
        const params: Record<string, unknown> = {}
        for (const input of this.inputs) {
          if (input.type === 'File' || input.type === 'Directory') {
            if (input.array) {
              // must required at least one value and does not have secondaryFiles
              const values = this.valObj[input.id] as Array<string>
              const arr = values.map((val) => ({
                location: val,
                class: input.type,
              }))
              params[input.id] = arr
            } else {
              const value = this.valObj[input.id][0] as string | null
              if (value) {
                const obj = {
                  location: value,
                  class: input.type,
                }
                if (input.secondaryFiles) {
                  const secondaryFiles = this.secondaryFilesObj[input.id]
                  Object.assign(obj, {
                    secondaryFiles: secondaryFiles
                      .filter((val) => val !== null)
                      .map((val) => ({
                        location: val,
                        class: 'File',
                      })),
                  })
                }
                params[input.id] = obj
              } else {
                // nothing to do (because value is null)
              }
            }
          } else if (input.type === 'string' || input.type === 'Any') {
            if (input.array) {
              // must required at least one value
              const values = this.valObj[input.id] as Array<string>
              params[input.id] = values
            } else {
              const value = this.valObj[input.id][0] as string
              if (value) {
                params[input.id] = value
              } else {
                params[input.id] = null
              }
            }
          } else if (input.type === 'int') {
            if (input.array) {
              // must required at least one value
              const values = this.valObj[input.id] as Array<string | number>
              params[input.id] = values.map((val) => Number(val))
            } else {
              const value = this.valObj[input.id][0] as number | string
              if (value) {
                params[input.id] = Number(value)
              } else {
                params[input.id] = null
              }
            }
          } else if (input.type === 'boolean') {
            // It cannot be an array.
            const value = this.valObj[input.id][0] as boolean | null
            params[input.id] = !!value
          }
        }
        return JSON.stringify(params)
      }
      return ''
    },
  },
}

export default Vue.extend(options)
</script>

<style>
.v-label {
  color: #424242 !important;
}
</style>
