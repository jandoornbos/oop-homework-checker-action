const core = require('@actions/core')
const github = require('@actions/github')

var fs = require('fs')
var path = require('path')

try {
    const fileList = fs.readdirSync('./')
    let weeks = [1, 2, 3, 4, 5, 6, 7, 8]

    weeks.forEach(weekNumber => {
        const weekDir = 'week-' + weekNumber
        
        if (fs.existsSync(weekDir)) {
            // There is a folder with week-x
            const contents = fs.readdirSync(weekDir)

            const subDirs = contents.filter(item => fs.statSync(path.join(weekDir, item)).isDirectory())
            const allFiles = []

            subDirs.forEach(subDir => {
                const subDirPath = path.join(weekDir, subDir)
                const files = fs.readdirSync(subDirPath)

                const javaFiles = files.filter(file => path.extname(file) === '.java')
                allFiles.push(javaFiles)
            })

            checkFilesForWeek(weekNumber, allFiles)
        }
    });
} catch (error) {
    core.setFailed(error.message)
}

function checkFilesForWeek(week, files) {
    let possibleFiles = []
    let expectedFiles = 0

    if (week === 1) {
        possibleFiles = [ 'Book.java' ]
        expectedFiles = 1
    }

    if (files.length < expectedFiles) {
        core.warning('Week ' + week + ' has not the expected amount of files!')
    }
}