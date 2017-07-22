<template>
    <vodal :show="displayModal" @hide="closeModal" :height="height" animation="flip">
        <el-input placeholder="Enter the URL of the feed" v-model="feedURL" type="url"></el-input>
        <el-button @click="submitURL(feedURL)" type="primary" icon="search" style="margin-top: 21px;">Fetch URL</el-button>
        <div v-if="feedObject">
            <el-row style="padding: 21px">
                <el-col :span="24">
                    <hr />
                </el-col>
                <el-col :span="12">
                    <img height="25" :src="feedObject.favicon" :alt="feedObject.title" />
                </el-col>
                <el-col :span="12">
                    <h6 style="font-weight: bolder; margin: 3px">{{feedObject.title | truncate(15)}}</h6>
                </el-col>
                <el-col :span="24" style="padding: 7px">
                    {{feedObject.description | truncate(25)}}
                </el-col>
                <el-col :span="24">
                    <el-button @click="saveFeedSource" type="primary" icon="star-on" style="margin-top: 14px;">Save Feed</el-button>
                </el-col>
            </el-row>
        </div>
    </vodal>
</template>

<script>
    export default {
        props: {
            displayModal: {
                type: Boolean,
                required: true
            },
            closeModal: {
                type: Function,
                required: true
            },
            saveFeedSource: {
                type: Function,
                required: true
            },
            submitURL: {
                type: Function,
                required: true
            },
            height: {
                type: Number,
                required: true
            },
            feedObject: {
                required: true
            }
        },
        data() {
            return {
                feedURL: ''
            };
        }
    };

</script>