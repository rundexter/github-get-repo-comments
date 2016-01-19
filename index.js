var _ = require('lodash'),
    util = require('./util.js'),
    GitHubApi = require("github"),
    github = new GitHubApi({ version: '3.0.0' });

var pickInputs = {
        'owner': { key: 'user', validate: { req: true }},
        'repo': { key: 'repo', validate: { req: true }},
        'sort': 'sort',
        'direction': 'direction',
        'since': 'since'
    },
    pickOutputs = {
        '-': {
            key: 'data',
            fields: {
                'user': 'user.login',
                'body': 'body',
                'created_at': 'created_at',
                'html_url': 'html_url'
            }
        }
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('github').credentials(),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        // check params.
        if (validateErrors)
            return this.fail(validateErrors);

        github.authenticate({
            type: 'oauth',
            token: _.get(credentials, 'access_token')
        });

        github.issues.repoComments(inputs, function (error, dataInfo) {
            console.log(dataInfo);
            error ? this.fail(error) : this.complete(util.pickOutputs({ data: dataInfo }, pickOutputs));
        }.bind(this));
    }
};
