const core = require('@actions/core');
const github = require('@actions/github');

var fs = require('fs');

try {
    console.log(fs.readdirSync('./'));
} catch (error) {
    core.setFailed(error.message)
}