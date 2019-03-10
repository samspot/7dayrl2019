    export function hasLocalStorage() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('feature_test', 'yes');
                if (localStorage.getItem('feature_test') === 'yes') {
                    localStorage.removeItem('feature_test');

                    return true

                } else {
                    console.log('localstorage disabled 1')
                }
            } else {
                console.log('localstorage not available 2')
            }
        } catch (e) {
            console.log('localstorage exception 2', e)
        }
        return false
    }

    export function addScore(name, score){
        let highScores = getScores()
        highScores.push({name: name, score: score})
        if(hasLocalStorage()){
            localStorage.setItem("highscores", JSON.stringify(highScores))
        }

        return highScores
    }

    export function getScores() {
        let highScores = []
        if (hasLocalStorage()) {
            // localStorage is enabled
            highScores = JSON.parse(localStorage.getItem("highscores"))
            if (!_.isArray(highScores)) { highScores = [] }
        }

        return highScores
    }

    export function renderScores() {
        let highScores = getScores()

        let ol = document.createElement('ol')

        // let highScoreHtml = '<h2>High Scores</h2><ol>'

        highScores.sort((a, b) => b.score - a.score).forEach(s => {
            let li = document.createElement('li')
            li.innerHTML = `${s.name}: ${s.score}`
            ol.appendChild(li)
            // highScoreHtml += `<li>${s.name}: ${s.score}</li>`
        })
        // highScoreHtml += '</ol>'
        // alert(highScoreHtml)

        let elem = document.getElementById('highScoresSplash')
        elem.innerHTML = ''
        elem.appendChild(ol)
    }