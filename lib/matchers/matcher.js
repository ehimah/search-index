var skeleton = require('log-skeleton');

module.exports = function (options) {
  var log = skeleton((options) ? options.log : undefined);
  var matcher = {};
  var threshold = 3; //only give matches for strings longer or equal to than this number

  matcher.matcher = function (reverseIndex, beginsWith, callback) {
    //sggestion string is too short
    var suggestions = [];
    if (beginsWith.length < threshold)
      return callback(new Error('string below threshold length (' +
                                threshold + ')'), suggestions);
    reverseIndex.createReadStream({
      start: 'TF~*~' + beginsWith,
      end: 'TF~*~' + beginsWith + '~~~'})
      .on('data', function (data) {
        if (data.key.substring(data.key.length, data.key.length - 2) == '~~')
          suggestions.push([data.key.split('~')[2], data.value.length]);
      })
      .on('error', function (err) {
        log.error('Oh my!', err);
        callback(err, []);
      })
      .on('close', function () {
        var sortedSuggestions = suggestions.sort(function (a, b) {
          return b[1] - a[1];
        }).splice(0, 10);
        var simpleSortedSuggestions = [];
        for (var i = 0; i < sortedSuggestions.length; i++) {
          simpleSortedSuggestions.push(sortedSuggestions[i][0]);
        }
        callback(null, simpleSortedSuggestions);
      });
  };

  return matcher;
};
