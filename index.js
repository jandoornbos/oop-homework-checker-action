const core = require('@actions/core')
const github = require('@actions/github')

var fs = require('fs')
var path = require('path')
var parser = require('java-parser')

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

    files.forEach(file => {
        validateJavaFile(file);
    })
}

function validateJavaFile(filePath, fieldName) {
    const javaCode = fs.readFileSync(filePath, 'utf-8');

    parser.parseCode(javaCode, { comments: false }, (err, parsedCode) => {
        if (err) {
            console.error('Error parsing Java code:', err);
            return;
        }

        traverseAST(parsedCode, fieldName);
    });
}
  
function traverseAST(node) {
    if (node.type === 'ClassDeclaration') {
        validateFields(node);
    }
  
    if (node.body && node.body.length) {
        node.body.forEach((childNode) => {
            traverseAST(childNode);
        });
    }
}
  
function validateFields(clazz) {
    const fields = clazz.body.filter(
        (element) => element.type === 'FieldDeclaration'
    );

    fields.forEach((field) => {
        const fieldName = field.variables[0].name;
        const getterName = 'get' + fieldName[0].toUpperCase() + fieldName.slice(1);
        const setterName = 'set' + fieldName[0].toUpperCase() + fieldName.slice(1);

        const hasGetter = clazz.body.some(
        (method) =>
            method.type === 'MethodDeclaration' && method.name === getterName
        );

        const hasSetter = clazz.body.some(
        (method) =>
            method.type === 'MethodDeclaration' && method.name === setterName
        );

        if (!hasGetter || !hasSetter) {
            core.error(
                `Validation failed for field ${fieldName} in class ${clazz.name}. Missing ${
                hasGetter ? 'setter' : 'getter'
                }.`
            );
        }
    });
}