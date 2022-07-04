<template>
  <v-dialog
    :value="dialogShow"
    overlay-opacity="0.8"
    width="600"
    @click:outside="$emit('close')"
  >
    <v-card>
      <div class="d-flex align-center mx-6 pt-4">
        <v-icon color="black" left v-text="'mdi-sticker-plus-outline'" />
        <div class="card-header" v-text="'Register WES Instance'" />
      </div>
      <div class="mx-12 my-2">
        <v-text-field
          v-model="name"
          :persistent-hint="!name.length"
          :rules="nameRules"
          hint="Name of the WES instance (free text, e.g., 'Test service,' etc.)"
          label="Name"
          placeholder="Type a name"
        />
        <v-text-field
          v-model="endpoint"
          :persistent-hint="!endpoint.length"
          :rules="endpointRules"
          hint="Endpoint of the WES instance (e.g., 'http://localhost:1122' etc.)"
          label="Endpoint"
          placeholder="Type a endpoint"
          @input="connection = true"
        />
      </div>
      <div class="d-flex justify-end mx-12 pb-6 mt-4">
        <v-btn
          :disabled="!(registerValid && registerButton)"
          color="primary"
          outlined
          @click.stop="submitService"
        >
          <v-icon left v-text="'mdi-arrow-up'" />
          <span v-text="'Submit'" />
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { getServiceInfo } from '@/utils/WESRequest'
import { Service } from '@/store/services'
import { validUrl } from '@/utils'

export default defineComponent({
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
      connection: true,
      registerButton: true,
    }
  },

  computed: {
    registerValid(): boolean {
      return (
        !this.nameRules.length && !this.endpointRules.length && this.connection
      )
    },

    serviceNames(): string[] {
      return this.$store.getters['services/services'].map(
        (service: Service) => service.name
      )
    },

    nameRules(): string[] {
      if (!this.name) {
        return ['Required']
      }
      if (this.serviceNames.includes(this.name)) {
        return ['Typed name already exists']
      }
      return []
    },

    endpointRules(): string[] {
      if (!this.endpoint) {
        return ['Required']
      }
      if (
        !this.endpoint.startsWith('http://') &&
        !this.endpoint.startsWith('https://')
      ) {
        return ['The endpoint must start with http:// or https://']
      }
      if (!validUrl(this.endpoint)) {
        return ['Invalid URL']
      }
      if (!this.connection) {
        return ['Connection failed']
      }
      return []
    },
  },

  methods: {
    async submitService(): Promise<void> {
      await getServiceInfo(this.endpoint.replace(/\/$/, ''))
        .then(async (serviceInfo) => {
          this.registerButton = false
          await this.$store
            .dispatch('services/submitService', {
              name: this.name,
              endpoint: this.endpoint.replace(/\/$/, ''),
              preRegistered: false,
              serviceInfo,
            })
            .then((serviceId) => {
              this.$router.push({ path: '/services', query: { serviceId } })
            })
        })
        .catch((_) => {
          this.connection = false
        })
    },
  },
})
</script>
