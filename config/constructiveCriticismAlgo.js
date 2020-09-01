const emotional = require('emotional')

async function consCriticism(Sentence) {
    let localSentence = Sentence;
    var promise = new Promise((resolve, reject) => {
        emotional.load(function () {
            let sentences = Sentence.split(/[\\.!?]/);
            console.log(sentences)
            sentences.forEach((sentence) => {
                sentence = sentence.trim();
                let emo_data = emotional.get(sentence)
                console.log(emo_data)
                let emo_positive = emotional.positive(sentence)
                if (!emo_positive) {
                    let emo_data = emotional.get(sentence)
                    console.log(emo_data)
                    console.log(emo_data['assessments'])
                    if (emo_data['polarity'] < 0 || emo_data['subjectivity'] == 1) {
                        localSentence = localSentence.replace(sentence, '')
                    }
                }
            })
            resolve(localSentence);
        })
    })
    return promise;
}

module.exports = consCriticism;