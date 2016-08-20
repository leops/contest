const Twitter = require('twitter');

const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    bearer_token: process.env.BEARER_TOKEN
});

exports.fetchRTs = function fetchRTs(tweet, lastResult, cb) {
    let cursor = -1;
    if(lastResult !== null) {
        cursor = lastResult['next_cursor'];
    }

    client.get('statuses/retweeters/ids.json?id=' + tweet + '&count=100&cursor=' + cursor, (error, tweets) => {
        if(error) {
            return console.error(error);
        }

        if(lastResult !== null) {
            tweets.ids = lastResult.ids.concat(tweets.ids);
        }

        if(tweets['next_cursor'] != 0) {
            fetchRTs(tweet, tweets, cb);
        } else {
            cb(tweets.ids);
        }
    });
}
