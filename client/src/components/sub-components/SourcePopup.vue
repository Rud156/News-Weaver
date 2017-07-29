<template>
    <vodal :show="displayModal" @hide="closeModal" :height="height" animation="flip">
        <el-form :model="sourceForm" :rules="rules" ref="sourceForm">
            <el-form-item label="URL Of The Feed Source:" prop="feedURL">
                <el-input v-model="sourceForm.feedURL" type="url"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button @click="validateAndSubmitForm" type="primary" icon="search">Fetch URL</el-button>
            </el-form-item>
        </el-form>
        <div v-if="feedObject">
            <el-row>
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
    import {
        handleError
    } from './../../api/api';

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
            var validateURL = (rule, value, callback) => {
                var regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
                if (!regex.test(value)) {
                    return callback(new Error('Invalid URL format'));
                } else {
                    callback();
                }
            };
            return {
                sourceForm: {
                    feedURL: ''
                },
                rules: {
                    feedURL: [{
                        validator: validateURL,
                        required: true,
                        trigger: 'change'
                    }]
                }
            };
        },
        methods: {
            validateAndSubmitForm() {
                let feedURL = this.sourceForm.feedURL;
                this.$refs.sourceForm.validate(valid => {
                    if (valid)
                        this.submitURL(feedURL);
                    else
                        handleError(null, 'Please enter a valid URL');
                });
            }
        }
    };
</script>