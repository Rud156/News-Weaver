<template>
    <v-card flat light>
        <v-card-title primary-title>
          <div style="width: 100%">
            <h3 class="headline">{{ heading }}</h3>
            <div>{{ description }}</div>
          </div>
        </v-card-title>
    </v-card>
</template>

<script>
    export default {
        props: {
            heading: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            }
        }
    }
</script>
