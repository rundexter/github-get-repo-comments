var GitHubApi = require("github");
var _ = require('lodash');

var pickResultData = [
    'commit_id',
    'user.login',
    'body',
    'created_at',
    'html_url',
    'pull_request_url'
];






module.exports = {
    /**
     * Pick API result.
     *
     * @param inputs
     * @returns {Array}
     */
    pickResultData: function (inputs) {
        var result = [];

        _.map(inputs, function (input) {
            var tmpResults = {};

            pickResultData.forEach(function (dataKey) {
                if (!_.isUndefined(_.get(input, dataKey, undefined))) {

                    _.set(tmpResults, dataKey, _.get(input, dataKey));
                }
            });
            result.push(tmpResults);
        });

        return result;
    },

    /**
     * Authenticate gitHub user.
     *
     * @param dexter
     * @param github
     */
    gitHubAuthenticate: function (dexter, github) {

        if (dexter.environment('GitHubUserName') && dexter.environment('GitHubPassword')) {

            github.authenticate({
                type: dexter.environment('GitHubType') || "basic",
                username: dexter.environment('GitHubUserName'),
                password: dexter.environment('GitHubPassword')
            });
        } else {
            this.fail('A GitHubUserName and GitHubPassword environment variable is required for this module');
        }
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        var github = new GitHubApi({
            // required 
            version: "3.0.0"
        });

        this.gitHubAuthenticate(dexter, github);

        if (!step.input('owner').first() || !step.input('repo').first()) {

            this.fail('A owner and repo need for this module');
        } else {

            github.issues.repoComments(_.merge({user: step.input('owner').first()}, _.omit(step.inputs(), ['owner'])), function (err, comments) {

                err ? this.fail(err) : this.complete(this.pickResultData(comments));
            }.bind(this));
        }
    }
};
