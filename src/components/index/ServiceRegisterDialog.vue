<template>
  <v-dialog
    :value="dialogShow"
    overlay-opacity="0.8"
    width="600"
    @click:outside="$emit('close')"
  >
    <v-card>
      <div class="card-header pl-6 pt-4" v-text="'Register Service'" />
      <div class="px-12 pt-2">
        <v-text-field
          v-model="name"
          :error-messages="nameError"
          clearable
          label="Name"
        />
        <v-text-field
          v-model="endpoint"
          :error-messages="endpointError || checkConnectionMessage"
          clearable
          label="Endpoint"
          @blur="checkConnection"
        />
      </div>
      <div class="d-flex justify-end px-12 pb-6">
        <v-btn
          :disabled="!registerValid"
          color="primary"
          outlined
          @click.stop="submitService"
        >
          <v-icon class="mr-2">mdi-arrow-up</v-icon>Submit
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Service } from '@/store/services'
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options'
import { validUrl } from '@/utils'
import Vue from 'vue'
import { getServiceInfo } from '@/utils/WESRequest'

type Data = {
  name: string
  endpoint: string
  checkConnectionMessage: string
}

type Methods = {
  submitService: () => Promise<void>
  checkConnection: () => Promise<void>
}

type Computed = {
  registerValid: boolean
  serviceNames: string[]
  nameError: string
  endpointError: string
}

type Props = {
  dialogShow: boolean
}

const options: ThisTypedComponentOptionsWithRecordProps<
  Vue,
  Data,
  Methods,
  Computed,
  Props
> = {
  props: {
    dialogShow: {
      type: Boolean,
      default: false,
      required: true,
    },
  },

  data() {
    return {
      name: '',
      endpoint: '',
      checkConnectionMessage: '',
    }
  },

  computed: {
    registerValid() {
      return !this.nameError && !this.endpointError
    },

    serviceNames() {
      return this.$store.getters['services/services'].map(
        (service: Service) => service.name
      )
    },

    nameError() {
      if (!this.name) {
        return 'Name is required.'
      }
      if (this.serviceNames.includes(this.name)) {
        return `Service name: ${this.name} already exists.`
      }
      return ''
    },

    endpointError() {
      if (!this.endpoint) {
        return 'Endpoint is required.'
      }
      if (!validUrl(this.endpoint)) {
        return `Endpoint: ${this.endpoint} does not valid.`
      }
      return ''
    },
  },

  methods: {
    async submitService(): Promise<void> {
      if (this.registerValid) {
        await this.$store
          .dispatch('services/submitService', {
            name: this.name,
            endpoint: this.endpoint,
            preRegistered: false,
          })
          .then((serviceId) => {
            this.$router.push({ path: '/services', query: { serviceId } })
          })
      }
    },

    async checkConnection(): Promise<void> {
      await getServiceInfo(this.$axios, this.endpoint)
        .then((_) => {
          this.checkConnectionMessage = ''
        })
        .catch((_) => {
          this.checkConnectionMessage = `GET ${this.endpoint}/service_info is not working.`
        })
    },
  },
}

export default Vue.extend(options)
</script>
