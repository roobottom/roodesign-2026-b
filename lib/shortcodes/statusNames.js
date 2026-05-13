const names = require('../../src/_data/statusNames');

module.exports = () => {
    let str = '<ul>'
    Object.values(names).forEach(status => {
        str += `<li><h4>${status.title}</h4><p>${status.description}</p></li>`
    })
    str += '</ul>'
    return str
}