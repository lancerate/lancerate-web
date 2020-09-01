const emotional = require('emotional')

function consCriticism(sentence) {
    emotional.load(function () {
        emotional.get("sentence")
        emotional.positive("sentence")
      });
}

module.exports = consCriticism;